import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Activation token is required' },
        { status: 400 }
      );
    }

    // Find user with this activation token
    const users = await payload.find({
      collection: 'users',
      where: {
        activationToken: {
          equals: token,
        },
      },
    });

    if (users.totalDocs === 0) {
      return NextResponse.json(
        { error: 'Invalid activation token' },
        { status: 400 }
      );
    }

    const user = users.docs[0];

    // Check if already activated
    if (user.isActivated) {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      );
    }

    // Activate the user
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        isActivated: true,
        activationToken: null, // Clear the token
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully! You can now log in.'
    });

  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 