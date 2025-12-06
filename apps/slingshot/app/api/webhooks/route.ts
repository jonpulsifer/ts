import { NextResponse } from 'next/server';
import { sanitizeHeaders } from '@/lib/sanitize-headers';
import { webhookStore } from '@/lib/webhook-store';

export async function GET() {
  const requests = webhookStore.getRequests();
  // Sanitize headers before returning (defense in depth)
  const sanitizedRequests = requests.map((request) => ({
    ...request,
    headers: sanitizeHeaders(request.headers),
  }));
  return NextResponse.json(sanitizedRequests);
}

export async function DELETE() {
  webhookStore.clearRequests();
  return NextResponse.json({ message: 'All webhooks cleared' });
}
