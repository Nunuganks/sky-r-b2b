import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const body = await request.json();
    const { token, password, locale = 'bg' } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const users = await payload.find({
      collection: 'users',
      where: {
        resetPasswordToken: {
          equals: token,
        },
      },
    });

    if (users.totalDocs === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users.docs[0];

    // Check if token is expired (24 hours)
    if (!user.resetPasswordTokenExpiry) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }
    
    const tokenCreated = new Date(user.resetPasswordTokenExpiry);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenCreated.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Update user password and clear reset token
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password, // Payload will hash this automatically
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 