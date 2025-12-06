import { type NextRequest, NextResponse } from 'next/server';
import { projectExists } from '@/lib/projects-storage';
import { sanitizeHeaders } from '@/lib/sanitize-headers';
import { getWebhooks } from '@/lib/storage';

/**
 * Server-Sent Events endpoint for real-time webhook streaming
 * GET /api/stream/[slug]
 *
 * Note: Without Redis pub/sub, this uses polling with short intervals
 * The client will poll for new webhooks every 500ms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Check if project exists (slug is the ID)
  const exists = await projectExists(slug);
  if (!exists) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastWebhookId: string | null = null;
      let isActive = true;
      let lastHeartbeat = Date.now();

      // Send initial connection message
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Polling loop - check for new webhooks every 500ms
      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const { data: history } = await getWebhooks(slug);
          const webhooks = history?.webhooks || [];

          if (webhooks.length > 0) {
            const latestWebhook = webhooks[0];

            // If we have a new webhook (different from last one)
            if (latestWebhook.id !== lastWebhookId) {
              // Send all new webhooks since last check
              const startIndex = lastWebhookId
                ? webhooks.findIndex((w) => w.id === lastWebhookId)
                : -1;

              const newWebhooks =
                startIndex > 0
                  ? webhooks.slice(0, startIndex)
                  : [latestWebhook];

              for (const webhook of newWebhooks.reverse()) {
                // Sanitize headers before sending via SSE (defense in depth)
                const sanitizedWebhook = {
                  ...webhook,
                  headers: sanitizeHeaders(webhook.headers),
                };
                const data = `data: ${JSON.stringify(sanitizedWebhook)}\n\n`;
                controller.enqueue(encoder.encode(data));
              }

              lastWebhookId = latestWebhook.id;
            }
          }

          // Send heartbeat every 15 seconds (properly implemented)
          const now = Date.now();
          if (now - lastHeartbeat >= 15000) {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
            lastHeartbeat = now;
          }
        } catch (error) {
          console.error('Error polling webhooks:', error);
          // Send error event
          const errorData = `data: ${JSON.stringify({ error: 'Failed to fetch webhooks' })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        }
      }, 500);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
