import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const { productIds, action, data } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const updatedProducts = [];
    const failedProducts = [];

    // Handle different actions
    switch (action) {
      case 'publish':
      case 'unpublish':
        const published = action === 'publish';
        for (const productId of productIds) {
          try {
            const updatedProduct = await payload.update({
              collection: 'products',
              id: productId,
              data: { published },
            });
            updatedProducts.push(updatedProduct);
          } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            failedProducts.push({ id: productId, error: error.message });
          }
        }
        break;

      case 'delete':
        for (const productId of productIds) {
          try {
            await payload.delete({
              collection: 'products',
              id: productId,
            });
            updatedProducts.push({ id: productId, deleted: true });
          } catch (error) {
            console.error(`Error deleting product ${productId}:`, error);
            failedProducts.push({ id: productId, error: error.message });
          }
        }
        break;

      case 'updateCategory':
        if (!data?.categoryIds || !Array.isArray(data.categoryIds) || data.categoryIds.length === 0) {
          return NextResponse.json({ error: 'Category IDs array is required for updateCategory action' }, { status: 400 });
        }
        
        // Validate that all categories exist
        for (const categoryId of data.categoryIds) {
          try {
            const category = await payload.findByID({
              collection: 'categories',
              id: categoryId,
            });
            if (!category) {
              return NextResponse.json({ error: `Category with ID ${categoryId} not found` }, { status: 400 });
            }
          } catch (error) {
            return NextResponse.json({ error: `Invalid category ID: ${categoryId}` }, { status: 400 });
          }
        }
        
        for (const productId of productIds) {
          try {
            console.log(`Updating product ${productId} with categories:`, data.categoryIds);
            // For relationship fields with hasMany, we need to pass an array of IDs
            const updatedProduct = await payload.update({
              collection: 'products',
              id: productId,
              data: { 
                categories: data.categoryIds 
              },
            });
            updatedProducts.push(updatedProduct);
          } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            failedProducts.push({ id: productId, error: error.message });
          }
        }
        break;

      case 'updateSupplier':
        if (!data?.supplierName) {
          return NextResponse.json({ error: 'Supplier name is required for updateSupplier action' }, { status: 400 });
        }
        for (const productId of productIds) {
          try {
            const updatedProduct = await payload.update({
              collection: 'products',
              id: productId,
              data: { supplierName: data.supplierName },
            });
            updatedProducts.push(updatedProduct);
          } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            failedProducts.push({ id: productId, error: error.message });
          }
        }
        break;

      case 'addTags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json({ error: 'Tags array is required for addTags action' }, { status: 400 });
        }
        for (const productId of productIds) {
          try {
            // Get current product to preserve existing tags
            const currentProduct = await payload.findByID({
              collection: 'products',
              id: productId,
            });
            
            const currentTags = currentProduct.tags || [];
            const currentTagValues = currentTags.map((t: any) => t.tag);
            
            // Convert new tags to the correct format and remove duplicates
            const newTagObjects = data.tags
              .filter((tag: string) => !currentTagValues.includes(tag))
              .map((tag: string) => ({ tag }));
            
            const updatedTags = [...currentTags, ...newTagObjects];
            
            const updatedProduct = await payload.update({
              collection: 'products',
              id: productId,
              data: { tags: updatedTags },
            });
            updatedProducts.push(updatedProduct);
          } catch (error) {
            console.error(`Error updating product ${productId}:`, error);
            failedProducts.push({ id: productId, error: error.message });
          }
        }
        break;

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedProducts.length,
      failedCount: failedProducts.length,
      products: updatedProducts,
      failedProducts,
      message: `Successfully processed ${updatedProducts.length} products${failedProducts.length > 0 ? `, ${failedProducts.length} failed` : ''}`
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
  }
} 