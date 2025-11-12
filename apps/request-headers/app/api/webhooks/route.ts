import { NextResponse } from 'next/server';
import { webhookStore } from '@/lib/webhook-store';

export async function GET() {
  const requests = webhookStore.getRequests();
  return NextResponse.json(requests);
}

export async function DELETE() {
  webhookStore.clearRequests();
  return NextResponse.json({ message: 'All webhooks cleared' });
}
