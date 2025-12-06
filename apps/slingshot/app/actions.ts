'use server';

import { revalidatePath } from 'next/cache';
import { clearWebhooks } from '@/lib/storage';

/**
 * Server action to clear webhook history
 */
export async function clearWebhookHistory(projectId: string) {
  try {
    await clearWebhooks(projectId);
    revalidatePath(`/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear webhooks:', error);
    return { success: false, error: 'Failed to clear webhooks' };
  }
}
