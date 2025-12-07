'use server';

import { revalidatePath } from 'next/cache';
import { createProject, getAllProjects } from './projects-storage';
import { sanitizeHeaders } from './sanitize-headers';
import { slugSchema } from './slug-schema';
import type { Webhook } from './types';

export async function createProjectAction(slug: string) {
  // Validate using Zod
  const validationResult = slugSchema.safeParse(slug);
  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    throw new Error(firstError?.message || 'Invalid slug format');
  }

  const validatedSlug = validationResult.data;

  try {
    const project = await createProject(validatedSlug);

    // Revalidate the home page and layout (for sidebar)
    revalidatePath('/');
    revalidatePath('/', 'layout');

    return {
      success: true,
      slug: project.slug,
    };
  } catch (error) {
    console.error('Failed to create project:', error);

    // Normalize "already exists" errors
    if (error instanceof Error) {
      if (
        error.message.includes('already exists') ||
        error.message.includes('Slug already exists')
      ) {
        throw new Error('Slug already exists');
      }
    }

    // Re-throw the original error
    throw error;
  }
}

export async function getAllProjectsAction() {
  try {
    const projects = await getAllProjects();
    return { projects };
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return { projects: [] };
  }
}

/**
 * Send a test webhook to self (for example/demo purposes)
 * Note: This sends to the project's own endpoint, so domain validation is not needed
 */
export async function sendTestWebhookAction(
  webhookUrl: string,
  method = 'POST',
  body?: string,
) {
  'use server';

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Webhook': 'true',
      },
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = body;
    }

    const response = await fetch(webhookUrl, options);
    const responseText = await response.text();

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      body: responseText.slice(0, 200), // Limit response body size
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to send test webhook',
    );
  }
}

/**
 * Poll for stats updates (optimized with metadata check)
 */
export async function pollStatsAction(currentEtag?: string | null) {
  try {
    const { checkStatsChanged, getStats } = await import('./stats-storage');

    // Check metadata first
    const { changed, etag: newEtag } = await checkStatsChanged();

    // If not changed or ETag matches, return no change
    if (!changed || (currentEtag && newEtag === currentEtag)) {
      return { changed: false };
    }

    // If changed, fetch full data
    const { data, etag } = await getStats(newEtag);
    return {
      changed: true,
      stats: data,
      etag: etag || undefined,
    };
  } catch (error) {
    console.error('Failed to poll stats:', error);
    return { changed: false };
  }
}

/**
 * Get webhooks for a project (slug is the ID)
 * Server action - always fetches from GCS
 * Use getWebhooksWithCache() on the client instead
 */
export async function getWebhooksAction(slug: string) {
  try {
    const { getWebhooks } = await import('./storage');
    const { data: history, etag } = await getWebhooks(slug);
    return {
      webhooks: history?.webhooks || [],
      maxSize: history?.maxSize || 100,
      // expose etag so the client can avoid redundant downloads
      etag: etag || null,
    };
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    throw new Error('Failed to fetch webhooks');
  }
}

/**
 * Poll for new webhooks (optimized with metadata check)
 */
export async function pollWebhooksAction(
  slug: string,
  currentEtag?: string | null,
) {
  try {
    const { checkWebhooksChanged, getWebhooks } = await import('./storage');

    // Check metadata first
    const { changed, etag: newEtag } = await checkWebhooksChanged(slug);

    // If not changed or ETag matches, return no change
    if (!changed || (currentEtag && newEtag === currentEtag)) {
      return { changed: false };
    }

    // If changed, fetch full data
    const { data: history, etag } = await getWebhooks(slug, newEtag);
    return {
      changed: true,
      webhooks: history?.webhooks || [],
      etag: etag || undefined,
    };
  } catch (error) {
    console.error('Failed to poll webhooks:', error);
    return { changed: false };
  }
}

/**
 * Get webhooks with localStorage cache check (client-side only)
 * Uses cache if available and not expired - NO GCS requests for cached data
 * Only fetches from GCS if cache is missing/expired
 */
export async function getWebhooksWithCache(slug: string) {
  // Only run on client
  if (typeof window === 'undefined') {
    return getWebhooksAction(slug);
  }

  const { getCachedWebhooks, setCachedWebhooks } = await import(
    './webhook-cache'
  );

  // Check cache first - if it exists and is valid, use it immediately
  // NO metadata check - trust the cache until it expires
  const cached = getCachedWebhooks(slug);
  if (cached && cached.length > 0) {
    console.log(
      `[Client] Using cached webhooks for ${slug} (${cached.length} webhooks, no Firestore request)`,
    );
    return {
      webhooks: cached,
      maxSize: 100, // Default, cache doesn't store this
    };
  }

  // Cache miss or expired, fetch from server
  console.log(
    `[Client] Cache miss/expired for ${slug}, fetching from Firestore`,
  );
  const { getWebhooks } = await import('./storage');
  const { data: history, etag } = await getWebhooks(slug);
  const result = {
    webhooks: history?.webhooks || [],
    maxSize: history?.maxSize || 100,
    etag: etag || null,
  };

  // Update cache with fresh data and etag (even if empty) so future requests
  // can skip downloads when the ETag matches.
  setCachedWebhooks(slug, result.webhooks, etag || undefined, result.maxSize);

  return result;
}

/**
 * Send an outgoing webhook with domain validation (slug is the project ID)
 */
export async function sendOutgoingWebhookAction(
  slug: string,
  webhookData: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
  },
) {
  'use server';

  try {
    const { z } = await import('zod');
    const schema = z.object({
      method: z.string(),
      url: z.string().url(),
      headers: z.record(z.string(), z.string()),
      body: z.string().nullable(),
    });
    const parsed = schema.parse(webhookData);

    // If JSON body is present, ensure it is valid JSON when content-type is JSON
    if (
      parsed.body &&
      Object.entries(parsed.headers).some(([k, v]) => {
        const key = k.toLowerCase();
        return (
          key === 'content-type' &&
          typeof v === 'string' &&
          v.toLowerCase().includes('application/json')
        );
      })
    ) {
      try {
        JSON.parse(parsed.body);
      } catch (_e) {
        throw new Error(
          'Body must be valid JSON when Content-Type is application/json',
        );
      }
    }

    // Validate domain before sending
    const { validateOutgoingDomain } = await import(
      './validate-outgoing-domain'
    );
    const validation = validateOutgoingDomain(parsed.url);

    if (!validation.allowed) {
      throw new Error(validation.error || 'Domain not allowed');
    }

    // Send the webhook
    const options: RequestInit = {
      method: parsed.method,
      headers: parsed.headers,
    };

    if (parsed.body && ['POST', 'PUT', 'PATCH'].includes(parsed.method)) {
      options.body = parsed.body;
    }

    const startTime = Date.now();
    const response = await fetch(parsed.url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseText = await response.text();

    // Save the outgoing webhook
    const { appendWebhook } = await import('./storage');
    const { incrementWebhookCount } = await import('./stats-storage');
    const { generateProjectId } = await import('./nanoid');

    // Sanitize headers before storing
    const sanitizedHeaders = sanitizeHeaders(parsed.headers || {});

    const webhook: Webhook = {
      id: generateProjectId(),
      method: parsed.method,
      url: parsed.url,
      headers: sanitizedHeaders,
      body: parsed.body || null,
      timestamp: Date.now(),
      direction: 'outgoing',
      responseStatus: response.status,
      responseBody: responseText.slice(0, 10000), // Limit response body size
      duration,
    };

    // Append webhook
    await appendWebhook(slug, webhook);
    await incrementWebhookCount(slug, webhook.timestamp);

    return {
      success: true,
      webhookId: webhook.id,
      status: response.status,
      statusText: response.statusText,
      responseBody: responseText.slice(0, 200), // Limit response body for return
    };
  } catch (error) {
    console.error('Failed to send outgoing webhook:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to send outgoing webhook',
    );
  }
}

/**
 * Save an outgoing webhook (slug is the project ID)
 * @deprecated Use sendOutgoingWebhookAction instead
 */
export async function saveOutgoingWebhookAction(
  slug: string,
  webhookData: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string | null;
    responseStatus: number;
    responseBody?: string;
  },
) {
  try {
    const { appendWebhook } = await import('./storage');
    const { incrementWebhookCount } = await import('./stats-storage');
    const { generateProjectId } = await import('./nanoid');

    // Sanitize headers before storing
    const sanitizedHeaders = sanitizeHeaders(webhookData.headers || {});

    const webhook: Webhook = {
      id: generateProjectId(),
      method: webhookData.method,
      url: webhookData.url,
      headers: sanitizedHeaders,
      body: webhookData.body || null,
      timestamp: Date.now(),
      direction: 'outgoing',
      responseStatus: webhookData.responseStatus,
      responseBody: webhookData.responseBody,
    };

    await appendWebhook(slug, webhook);
    await incrementWebhookCount(slug, webhook.timestamp);

    return {
      success: true,
      webhookId: webhook.id,
    };
  } catch (error) {
    console.error('Failed to save outgoing webhook:', error);
    throw new Error('Failed to save outgoing webhook');
  }
}

/**
 * Clear all webhooks for a project (slug is the project ID)
 * Note: Client components should call clearCachedWebhooks after this action
 */
export async function clearWebhooksAction(slug: string) {
  try {
    const { clearWebhooks } = await import('./storage');
    await clearWebhooks(slug);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear webhooks:', error);
    throw new Error('Failed to clear webhooks');
  }
}

/**
 * Delete a project
 * Deletes the project from mappings, removes webhooks from GCS, and removes stats
 * Note: Client components should call clearCachedWebhooks after this action
 */
export async function deleteProjectAction(slug: string) {
  try {
    const { deleteProject } = await import('./projects-storage');
    const { clearWebhooks } = await import('./storage');
    const { removeProjectStats } = await import('./stats-storage');

    // Delete the project from mappings
    await deleteProject(slug);

    // Delete webhooks file from GCS (source of truth)
    await clearWebhooks(slug);

    // Remove project stats
    await removeProjectStats(slug);

    // Revalidate paths and layout (for sidebar)
    revalidatePath('/');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      throw new Error('Project not found');
    }
    if (error.message?.includes('Cannot delete')) {
      throw new Error(error.message);
    }
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project');
  }
}
