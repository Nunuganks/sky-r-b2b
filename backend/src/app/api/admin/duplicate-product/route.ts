import { NextRequest, NextResponse } from 'next/server';
import payload from 'payload';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get the original product
    const originalProduct = await payload.findByID({
      collection: 'products',
      id: productId,
    });

    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create a copy of the product data
    const productData = {
      ...originalProduct,
      sku: `${originalProduct.sku}-copy`,
      name: {
        en: `${originalProduct.name.en} (Copy)`,
        bg: `${originalProduct.name.bg} (Копие)`,
      },
      published: false, // Set to unpublished by default
    };

    // Remove the id field as it will be auto-generated
    delete productData.id;
    delete productData.createdAt;
    delete productData.updatedAt;

    // Create the duplicated product
    const duplicatedProduct = await payload.create({
      collection: 'products',
      data: productData,
    });

    return NextResponse.json({ 
      success: true, 
      product: duplicatedProduct,
      message: 'Product duplicated successfully'
    });

  } catch (error) {
    console.error('Error duplicating product:', error);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
} 