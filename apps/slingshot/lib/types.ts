/**
 * Core types for the webhook testing platform
 */

export interface Webhook {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  ip?: string;
  userAgent?: string;
  responseStatus?: number;
  responseBody?: string;
  duration?: number; // Latency in milliseconds (for outgoing requests)
}

export interface Project {
  slug: string;
  createdAt: number;
}

export interface WebhookHistory {
  webhooks: Webhook[];
  maxSize: number;
}
