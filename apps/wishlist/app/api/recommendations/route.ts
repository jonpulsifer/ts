import { auth } from '@/app/auth';
import { getRecommendationsForHomePage } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recommendations = await getRecommendationsForHomePage(session.user.id);
  return NextResponse.json({ recommendations });
}
