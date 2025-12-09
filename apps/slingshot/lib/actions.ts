'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
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
    revalidateTag('projects', 'default');

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
 * Get webhooks with local-first cache (client-side only)
 * Uses stale-while-revalidate pattern:
 * - Returns stale cache immediately if available
 * - Refreshes in background if stale
 * - Only waits for server if cache is missing
 */
export async function getWebhooksWithCache(slug: string) {
  // Only run on client
  if (typeof window === 'undefined') {
    return getWebhooksAction(slug);
  }

  const { getCachedWebhooksEntry, setCachedWebhooks } = await import(
    './webhook-cache'
  );

  const cachedEntry = getCachedWebhooksEntry(slug);

  // If we have cached data (even if stale), return it immediately
  // and refresh in background
  if (cachedEntry) {
    // Start background refresh if stale
    if (cachedEntry.stale) {
      // Fire and forget - don't await
      getWebhooksAction(slug)
        .then((result) => {
          setCachedWebhooks(
            slug,
            result.webhooks,
            result.etag || undefined,
            result.maxSize,
          );
        })
        .catch((error) => {
          console.error('[Cache] Background refresh failed:', error);
          // Keep using stale cache on error
        });
    }

    return {
      webhooks: cachedEntry.webhooks,
      maxSize: cachedEntry.maxSize || 100,
      etag: cachedEntry.etag || null,
      fromCache: true,
      stale: cachedEntry.stale,
    };
  }

  // Cache miss - fetch from server (user waits)
  const { getWebhooks } = await import('./storage');
  const { data: history, etag } = await getWebhooks(slug);
  const result = {
    webhooks: history?.webhooks || [],
    maxSize: history?.maxSize || 100,
    etag: etag || null,
    fromCache: false,
    stale: false,
  };

  // Update cache with fresh data
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

    // Ensure URL is properly encoded (handle Unicode characters in URL)
    let encodedUrl: string;
    try {
      const urlObj = new URL(parsed.url);
      // Reconstruct URL with properly encoded components
      encodedUrl = urlObj.toString();
    } catch {
      // If URL parsing fails, try encoding the entire string
      encodedUrl = encodeURI(parsed.url);
    }

    // Validate domain before sending
    const { validateOutgoingDomain } = await import(
      './validate-outgoing-domain'
    );
    const validation = validateOutgoingDomain(encodedUrl);

    if (!validation.allowed) {
      throw new Error(validation.error || 'Domain not allowed');
    }

    // Sanitize headers to ensure they're ASCII-only (HTTP headers must be ASCII)
    // Headers cannot contain Unicode characters - they must be ASCII (0-255)
    const sanitizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed.headers)) {
      // Header keys must be ASCII-only - replace non-ASCII with '?'
      const sanitizedKey = Array.from(key)
        .map((char) => {
          const code = char.charCodeAt(0);
          // Check for surrogate pairs (UTF-16) and single code points > 255
          if (code >= 0xd800 && code <= 0xdfff) {
            // Surrogate pair - skip or replace
            return '';
          }
          return code > 255 ? '?' : char;
        })
        .join('')
        .trim();

      // Header values must be ASCII-only - replace non-ASCII with '?'
      const sanitizedValue = Array.from(value)
        .map((char) => {
          const code = char.charCodeAt(0);
          // Check for surrogate pairs (UTF-16) and single code points > 255
          if (code >= 0xd800 && code <= 0xdfff) {
            // Surrogate pair - skip or replace
            return '';
          }
          return code > 255 ? '?' : char;
        })
        .join('');

      if (sanitizedKey) {
        sanitizedHeaders[sanitizedKey] = sanitizedValue;
      }
    }

    // Send the webhook
    const options: RequestInit = {
      method: parsed.method,
      headers: sanitizedHeaders,
    };

    if (parsed.body && ['POST', 'PUT', 'PATCH'].includes(parsed.method)) {
      options.body = parsed.body;
    }

    const startTime = Date.now();
    const response = await fetch(encodedUrl, options);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const responseText = await response.text();

    // Save the outgoing webhook
    const { appendWebhook } = await import('./storage');
    const { incrementWebhookCount } = await import('./stats-storage');
    const { generateProjectId } = await import('./nanoid');

    // Sanitize headers before storing (remove sensitive values)
    const sanitizedHeadersForStorage = sanitizeHeaders(parsed.headers || {});

    const webhook: Webhook = {
      id: generateProjectId(),
      method: parsed.method,
      url: encodedUrl, // Use encoded URL
      headers: sanitizedHeadersForStorage,
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
    revalidateTag('projects', 'default');

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
