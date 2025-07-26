import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Fetch all products to extract unique tags
    const products = await payload.find({
      collection: 'products',
      limit: 1000, // Adjust as needed
      depth: 0,
    });

    // Extract all tags from products and create a unique set
    const allTags = new Set<string>();
    
    products.docs.forEach((product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag);
          }
        });
      }
    });

    // Convert Set to Array and sort alphabetically
    const uniqueTags = Array.from(allTags).sort();

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
} 