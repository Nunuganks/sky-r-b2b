import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    // Get all products
    const products = await payload.find({
      collection: 'products',
      limit: 1000,
    });

    const updatedProducts = [];

    for (const product of products.docs) {
      // If product has image gallery, set the first image as main (regardless of existing main image)
      if (product.imageGallery && product.imageGallery.length > 0) {
        try {
          const updatedProduct = await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              mainImage: product.imageGallery[0].image,
            },
          });
          updatedProducts.push(updatedProduct);
        } catch (error) {
          console.error(`Error updating product ${product.id}:`, error);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedProducts.length,
      message: `Set main image from gallery for ${updatedProducts.length} products`
    });

  } catch (error) {
    console.error('Error updating main images:', error);
    return NextResponse.json({ error: 'Failed to update main images' }, { status: 500 });
  }
} 