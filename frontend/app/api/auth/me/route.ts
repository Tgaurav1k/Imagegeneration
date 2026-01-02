import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest, isAuthenticated } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = getUserIdFromRequest(request);

    return NextResponse.json({
      success: true,
      data: {
        id: userId,
        // In production, fetch full user data from database
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication check failed',
      },
      { status: 500 }
    );
  }
}
