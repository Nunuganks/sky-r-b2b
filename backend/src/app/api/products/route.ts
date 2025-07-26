import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    console.log('=== API PRODUCTS ROUTE START ===');
    
    const payload = await getPayload({
      config: configPromise,
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    // New filter parameters
    const visibility = searchParams.get('visibility') || '';
    const tag = searchParams.get('tag') || '';
    const supplier = searchParams.get('supplier') || '';
    const category = searchParams.get('category') || '';

    // Sorting parameters
    const sort = searchParams.get('sort') || '';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    
    console.log('Received parameters:', {
      page, limit, search, includeUnpublished,
      visibility, tag, supplier, category,
      sort, sortDirection
    });

    const query: any = {};

    // Only show published products by default unless explicitly requested
    if (!includeUnpublished) {
      query.published = {
        equals: true,
      };
    }

    // Visibility filter
    if (visibility) {
      if (visibility === 'shown') {
        query.published = {
          equals: true,
        };
      } else if (visibility === 'hidden') {
        query.published = {
          equals: false,
        };
      }
    }

    // Tag filter
    if (tag) {
      query.tags = {
        contains: tag,
      };
    }

    // Supplier filter
    if (supplier) {
      query.supplierName = {
        contains: supplier,
      };
    }

    // Category filter
    if (category) {
      query.categories = {
        in: [category],
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

    // Field mapping for sorting - map frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      'id': 'id',
      'sku': 'sku',
      'nameEn': 'name.en',
      'nameBg': 'name.bg',
      'descriptionEn': 'description.en',
      'descriptionBg': 'description.bg',
      'price': 'price',
      'ownStock': 'ownStock',
      'deliveryStock': 'deliveryStock',
      'deliveryTime': 'deliveryTime',
      'supplierName': 'supplierName',
      'categories': 'categories',
      'imageGallery': 'imageGallery',
      'brandingOptions': 'brandingOptions',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      'syncUpdatedAt': 'syncUpdatedAt',
      'published': 'published',
    };

    // Simple sorting implementation
    const findOptions: any = {
      collection: 'products',
      where: query,
      page,
      limit,
      depth: 1,
    };

    // Add sorting if specified
    if (sort && sortDirection) {
      const dbField = fieldMapping[sort] || sort;
      
      // Use string format for all fields - Payload expects this format
      findOptions.sort = `${dbField}-${sortDirection}`;
      console.log('Sorting applied (string format):', {
        originalField: sort,
        mappedField: dbField,
        direction: sortDirection,
        sortString: findOptions.sort
      });
    } else {
      console.log('No sorting applied');
    }

    console.log('Final findOptions:', JSON.stringify(findOptions, null, 2));
    console.log('Sort string being passed to payload.find:', findOptions.sort);
    
    const result = await payload.find(findOptions);
    
    console.log('Payload result:', {
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      docsCount: result.docs?.length || 0
    });
    
    // If sorting is specified but Payload didn't sort properly, sort manually
    if (sort && sortDirection && result.docs && result.docs.length > 0) {
      console.log('=== MANUAL SORTING ATTEMPT ===');
      const sortedDocs = [...result.docs].sort((a, b) => {
        let aValue, bValue;
        
        if (sort === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else if (sort === 'published') {
          aValue = a.published ? 1 : 0;
          bValue = b.published ? 1 : 0;
        } else if (sort === 'sku') {
          aValue = a.sku;
          bValue = b.sku;
        } else {
          aValue = a[sort];
          bValue = b[sort];
        }
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
      
      console.log('Manual sorting applied:', {
        originalOrder: result.docs.map(p => ({ id: p.id, sku: p.sku, createdAt: p.createdAt, published: p.published })),
        sortedOrder: sortedDocs.map(p => ({ id: p.id, sku: p.sku, createdAt: p.createdAt, published: p.published }))
      });
      
      result.docs = sortedDocs;
    }
    
    if (result.docs && result.docs.length > 0) {
      console.log('First 3 products from result:', result.docs.slice(0, 3).map(p => ({
        id: p.id,
        sku: p.sku,
        published: p.published,
        createdAt: p.createdAt
      })));
      
      // Log all products with their sort values
      console.log('All products with sort values:');
      result.docs.forEach((p, index) => {
        console.log(`Product ${index + 1}:`, {
          id: p.id,
          sku: p.sku,
          published: p.published,
          createdAt: p.createdAt,
          sortField: sort,
          sortDirection: sortDirection
        });
      });
      
      // Additional debugging for sorting issues
      if (sort === 'published') {
        console.log('=== PUBLISHED SORT DEBUG ===');
        console.log('Published values in order:', result.docs.map(p => p.published));
        console.log('Expected order for', sortDirection, ':', 
          sortDirection === 'asc' ? 'false, true' : 'true, false');
      }
      
      if (sort === 'createdAt') {
        console.log('=== CREATED AT SORT DEBUG ===');
        console.log('CreatedAt values in order:', result.docs.map(p => p.createdAt));
        console.log('Expected order for', sortDirection, ':', 
          sortDirection === 'asc' ? 'oldest first' : 'newest first');
      }
      
      if (sort === 'sku') {
        console.log('=== SKU SORT DEBUG ===');
        console.log('SKU values in order:', result.docs.map(p => p.sku));
        console.log('Expected order for', sortDirection, ':', 
          sortDirection === 'asc' ? 'alphabetical' : 'reverse alphabetical');
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 