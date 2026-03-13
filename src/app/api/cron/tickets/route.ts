import { NextRequest, NextResponse } from 'next/server';
import { processScheduledTicketDeliveries } from '@/lib/notifications';

// ============================================
// CRON JOB ENDPOINT FOR TICKET DELIVERY
// ============================================
// This endpoint should be called by a cron job service (Vercel Cron, etc.)
// It checks for events happening in the next 72 hours and sends tickets

export async function GET(request: NextRequest) {
  try {
    // Verify authorization (should use a secret in production)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Skip auth check if no secret is configured (development mode)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting scheduled ticket delivery check...');
    
    const deliveriesSent = await processScheduledTicketDeliveries();
    
    return NextResponse.json({
      success: true,
      deliveriesSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error in scheduled delivery:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
