import { NextResponse } from 'next/server';

/**
 * Health check endpoint for containerization
 * GET /health
 *
 * Returns 200 OK if the application is healthy
 */
export async function GET() {
  try {
    // Basic health check - can be extended to check database, storage, etc.
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
