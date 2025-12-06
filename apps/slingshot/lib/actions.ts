'use server';

import { revalidatePath } from 'next/cache';
import { createProject, getAllProjects } from './projects-storage';
import type { Webhook } from './types';

export async function createProjectAction(slug: string) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Slug is required');
  }

  // Validate slug format: lowercase letters, numbers, hyphens only, 1-32 characters, cannot start or end with dash
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.length > 32) {
    throw new Error(
      'Invalid slug format. Use only lowercase letters, numbers, and hyphens (1-32 characters). Cannot start or end with a dash.',
    );
  }

  try {
    const project = await createProject(slug);

    // Revalidate the home page and layout (for sidebar)
    revalidatePath('/');
    revalidatePath('/', 'layout');

    return {
      success: true,
      slug: project.slug,
    };
  } catch (error: any) {
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('Slug already exists')
    ) {
      throw new Error('Slug already exists');
    }
    throw new Error('Failed to create project');
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
 */
export async function sendTestWebhookAction(
  webhookUrl: string,
  method = 'POST',
  body?: string,
) {
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
 * Get webhooks for a project (slug is the ID)
 */
export async function getWebhooksAction(slug: string) {
  try {
    const { getWebhooks } = await import('./storage');
    const { data: history } = await getWebhooks(slug);
    return {
      webhooks: history?.webhooks || [],
      maxSize: history?.maxSize || 100,
    };
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    throw new Error('Failed to fetch webhooks');
  }
}

/**
 * Save an outgoing webhook (slug is the project ID)
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
    const { getWebhooks, saveWebhooks } = await import('./storage');
    const { incrementWebhookCount } = await import('./stats-storage');
    const { generateProjectId } = await import('./nanoid');

    const webhook: Webhook = {
      id: generateProjectId(),
      method: webhookData.method,
      url: webhookData.url,
      headers: webhookData.headers || {},
      body: webhookData.body || null,
      timestamp: Date.now(),
      direction: 'outgoing',
      responseStatus: webhookData.responseStatus,
      responseBody: webhookData.responseBody,
    };

    // Get existing webhooks
    const { data: history } = await getWebhooks(slug);
    const existingWebhooks = history?.webhooks || [];

    // Add new webhook to the front
    const updatedWebhooks = [webhook, ...existingWebhooks];

    await saveWebhooks(slug, updatedWebhooks);

    // Update stats
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
 */
export async function deleteProjectAction(slug: string) {
  try {
    const { deleteProject } = await import('./projects-storage');
    await deleteProject(slug);

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
