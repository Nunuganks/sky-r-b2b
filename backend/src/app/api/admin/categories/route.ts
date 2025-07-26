import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const result = await payload.find({
      collection: 'categories',
      limit: 1000, // Get all categories
      depth: 0,
    });

    return NextResponse.json(result.docs || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of error if no categories exist
    return NextResponse.json([]);
  }
} 