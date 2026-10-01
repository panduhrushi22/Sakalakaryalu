import { NextResponse } from 'next/server';
import { getDecodedToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const decoded = getDecodedToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
