import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    
    const payload = await getPayload({
      config: configPromise,
    });

    console.log('Payload initialized');

    const body = await request.json();
    console.log('Login request body:', body);
    
    const { email, password, locale = 'bg' } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('Looking for user with email:', email);
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    console.log('Users found:', users.totalDocs);

    if (users.totalDocs === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users.docs[0];
    console.log('User found:', user.id);

    // Check if user is activated
    if (!user.isActivated) {
      return NextResponse.json(
        { error: 'Account not activated. Please check your email for activation link.' },
        { status: 401 }
      );
    }

    // Check if user is approved (for agencies)
    if (user.role === 'agency' && !user.isApproved) {
      return NextResponse.json(
        { error: 'Account pending approval. You will receive an email when approved.' },
        { status: 401 }
      );
    }

    // Verify password using Payload's auth
    console.log('Verifying password...');
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    });

    console.log('Login successful');

    // Generate JWT token
    const jwtSecret = process.env.PAYLOAD_SECRET;
    if (!jwtSecret) {
      throw new Error('PAYLOAD_SECRET environment variable is required');
    }
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        discountPercent: user.discountPercent
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      discountPercent: user.discountPercent,
      companyName: user.companyName,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
} 