import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sendRegistrationEmail } from '../../../email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called');
    
    const payload = await getPayload({
      config: configPromise,
    });

    console.log('Payload initialized');

    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneCountryCode, 
      phoneNumber,
      userType,
      companyName,
      eik,
      bulstat,
      mol,
      companyWebsite,
      companyActivity,
      deliveryCountry,
      deliveryPostalCode,
      deliveryCity,
      deliveryAddress,
      invoiceCountry,
      invoicePostalCode,
      invoiceCity,
      invoiceAddress,
      locale = 'bg'
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    
    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    console.log('Existing user check result:', existingUser);

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user in database using Payload's auth system
    console.log('Creating user in database...');
    
    // Use Payload's create method which handles password hashing
    const createdUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password, // Payload will hash this automatically
        firstName,
        lastName,
        phoneCountryCode,
        phoneNumber,
        role: userType || 'customer',
        discountPercent: 0, // Default 0%, will be set manually in admin panel
        companyName,
        eik,
        bulstat,
        mol,
        companyWebsite,
        companyActivity,
        deliveryCountry,
        deliveryPostalCode,
        deliveryCity,
        deliveryAddress,
        invoiceCountry,
        invoicePostalCode,
        invoiceCity,
        invoiceAddress,
        activationToken,
        isActivated: false,
        isApproved: userType === 'agency' ? false : true, // Agencies need approval
      },
    });

    console.log('User created successfully:', createdUser);

    // Send registration email
    const userName = `${firstName} ${lastName}`;
    const emailResult = await sendRegistrationEmail(email, userName, activationToken, locale);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send registration email' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: userType === 'agency' 
        ? 'Registration submitted for approval. You will receive an email when approved.'
        : 'Registration successful! Please check your email to activate your account.',
      activationToken // In production, don't return this
    });

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
} 