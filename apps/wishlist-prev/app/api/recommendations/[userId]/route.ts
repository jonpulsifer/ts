import { auth } from 'app/auth';
import { getRecommendations } from 'lib/ai';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await auth();
  const userId = params.userId;
  if (!session || !session?.user || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recommendations = await getRecommendations(userId);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 },
    );
  }
}
