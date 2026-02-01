import { type NextRequest, NextResponse } from 'next/server';
import { generateProjectId } from '@/lib/nanoid';
import { projectExists } from '@/lib/projects-storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizeHeaders } from '@/lib/sanitize-headers';
import { incrementWebhookCount } from '@/lib/stats-storage';
import { appendWebhook } from '@/lib/storage';
import type { Webhook } from '@/lib/types';

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Webhook ingestion endpoint for /api/[slug]
 * Handles incoming webhooks with:
 * - Rate limiting (5 RPS)
 * - Optimistic locking for blob writes
 * - Automatic webhook storage
 *
 * Reserved slugs: "health" (handled by /api/health)
 */
async function handleWebhook(request: NextRequest, slug: string) {
  // Rate limiting
  const rateLimitResult = checkRateLimit(slug);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        limit: rateLimitResult.limit,
        reset: rateLimitResult.reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  // Get request metadata
  const method = request.method;
  const url = request.url;
  const rawHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    rawHeaders[key] = value;
  });
  // Sanitize headers to remove sensitive tokens
  const headers = sanitizeHeaders(rawHeaders);

  // Read body with size limit
  let body: string | null = null;
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    body = bodyText || null;
  } catch (_error) {
    // Body might be empty or invalid, that's okay
    body = null;
  }

  // Create webhook object
  const webhook: Webhook = {
    id: generateProjectId(),
    method,
    url,
    headers,
    body,
    timestamp: Date.now(),
    direction: 'incoming',
    ip:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };

  try {
    await Promise.all([
      appendWebhook(slug, webhook),
      incrementWebhookCount(slug, webhook.timestamp),
    ]);

    return NextResponse.json(
      {
        success: true,
        webhookId: webhook.id,
        timestamp: webhook.timestamp,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      },
    );
  } catch (error) {
    console.error('Failed to save webhook:', error);
    return NextResponse.json(
      { error: 'Failed to save webhook' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Skip reserved routes
  if (slug === 'health') {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
  }

  // Check if project exists
  const exists = await projectExists(slug);
  if (!exists) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return handleWebhook(request, slug);
}

// Allow all HTTP methods
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return POST(request, { params });
}
