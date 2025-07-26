import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const result = await payload.find({
      collection: 'products',
      limit: 1000, // Get all products to extract unique suppliers
      depth: 0,
    });

    // Extract unique supplier names
    const suppliers = [...new Set(
      result.docs
        .map(product => product.supplierName)
        .filter(supplier => supplier && supplier.trim() !== '')
    )].sort();

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
} 