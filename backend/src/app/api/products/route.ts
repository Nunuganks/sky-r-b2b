import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const query: any = {};

    // Only show published products by default unless explicitly requested
    if (!includeUnpublished) {
      query.published = {
        equals: true,
      };
    }

    if (search) {
      query.or = [
        {
          sku: {
            contains: search,
          },
        },
        {
          'name.en': {
            contains: search,
          },
        },
        {
          'name.bg': {
            contains: search,
          },
        },
      ];
    }

    const result = await payload.find({
      collection: 'products',
      where: query,
      page,
      limit,
      depth: 1,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 