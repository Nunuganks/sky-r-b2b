import { NextRequest, NextResponse } from 'next/server';
import payload from 'payload';

export async function POST(req: NextRequest) {
  try {
    const { productIds, action } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    if (!action || !['publish', 'unpublish'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "publish" or "unpublish"' }, { status: 400 });
    }

    const published = action === 'publish';
    const updatedProducts = [];

    // Update each product
    for (const productId of productIds) {
      try {
        const updatedProduct = await payload.update({
          collection: 'products',
          id: productId,
          data: {
            published,
          },
        });
        updatedProducts.push(updatedProduct);
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedProducts.length,
      products: updatedProducts,
      message: `Successfully ${action}ed ${updatedProducts.length} products`
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
  }
} 