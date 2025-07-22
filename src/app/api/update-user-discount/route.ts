import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const body = await request.json();
    const { email, discountPercent } = body;

    if (!email || discountPercent === undefined) {
      return NextResponse.json(
        { error: 'Email and discount percent are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (users.totalDocs === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users.docs[0];

    // Update user discount
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        discountPercent,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User discount updated to ${discountPercent}%`
    });

  } catch (error) {
    console.error('Update user discount error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 