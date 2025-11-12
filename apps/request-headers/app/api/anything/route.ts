import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { webhookStore } from '@/lib/webhook-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

export async function HEAD(request: NextRequest) {
  return handleRequest(request, 'HEAD');
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, 'OPTIONS');
}

async function handleRequest(
  request: NextRequest,
  method: string,
): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const requestHeaders: Record<string, string> = {};

    for (const [key, value] of headersList.entries()) {
      requestHeaders[key] = value;
    }

    // Get query parameters
    const query: Record<string, string | string[]> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      if (query[key]) {
        // If key already exists, convert to array
        const existing = query[key];
        query[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing as string, value];
      } else {
        query[key] = value;
      }
    });

    let body: any = null;
    const contentType = requestHeaders['content-type'] || '';

    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const arrayBuffer = await request.arrayBuffer();

        if (arrayBuffer.byteLength > 0) {
          const text = new TextDecoder().decode(arrayBuffer);

          if (contentType.includes('application/json') || !contentType) {
            const trimmed = text.trim();
            if (
              (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
              (trimmed.startsWith('[') && trimmed.endsWith(']'))
            ) {
              try {
                body = JSON.parse(text);
              } catch {
                body = text;
              }
            } else {
              body = text;
            }
          } else if (
            contentType.includes('application/x-www-form-urlencoded') ||
            contentType.includes('multipart/form-data')
          ) {
            if (contentType.includes('application/x-www-form-urlencoded')) {
              const formObj: Record<string, string> = {};
              const params = new URLSearchParams(text);
              params.forEach((value, key) => {
                formObj[key] = value;
              });
              body = formObj;
            } else {
              body = text;
            }
          } else {
            body = text;
          }
        }
      } catch {
        body = null;
      }
    }

    // Get client IP
    const ip =
      requestHeaders['x-forwarded-for']?.split(',')[0] ||
      requestHeaders['x-real-ip'] ||
      'unknown';

    // Create webhook request object
    const webhookRequest = {
      id: randomUUID(),
      timestamp: new Date(),
      method,
      url: request.url,
      headers: requestHeaders,
      query,
      body,
      ip,
    };

    // Store the request
    webhookStore.addRequest(webhookRequest);

    return NextResponse.json({
      method,
      url: request.url,
      headers: requestHeaders,
      query,
      body,
      origin: ip,
      args: query,
    });
  } catch (error) {
    console.error('Error in /api/anything:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
