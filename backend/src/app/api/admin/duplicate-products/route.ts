import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Utility to recursively remove system fields but keep relationship references
function prepareForDuplication(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(prepareForDuplication);
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      // Remove system fields but keep relationship fields
      if (key !== 'id' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'syncUpdatedAt') {
        newObj[key] = prepareForDuplication(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Utility to extract IDs from relationship fields
function extractRelationshipIds(data: any): any {
  const result = { ...data };
  
  // Handle categories - extract IDs from category objects
  if (result.categories && Array.isArray(result.categories)) {
    result.categories = result.categories.map((category: any) => {
      // If it's already an ID (string or number), return as is
      if (typeof category === 'string' || typeof category === 'number') {
        return category;
      }
      // If it's an object, try to find the ID
      if (typeof category === 'object' && category !== null) {
        // Check if the object has an id field
        if (category.id !== undefined) {
          return category.id;
        }
        // If no id field, we need to find the category by its unique fields
        // For now, let's clear categories if we can't find the ID
        console.warn('Category object without ID found:', category);
        return null;
      }
      return category;
    }).filter(Boolean); // Remove null values
  }
  
  // Handle mainImage - extract ID from image object
  if (result.mainImage) {
    if (typeof result.mainImage === 'string' || typeof result.mainImage === 'number') {
      // Already an ID, keep as is
    } else if (typeof result.mainImage === 'object' && result.mainImage !== null) {
      if (result.mainImage.id !== undefined) {
        result.mainImage = result.mainImage.id;
      } else {
        // If no id field, we need to find the image by its unique fields
        // For now, let's clear mainImage if we can't find the ID
        console.warn('Main image object without ID found:', result.mainImage);
        result.mainImage = null;
      }
    }
  }
  
  // Handle imageGallery - extract IDs from image objects
  if (result.imageGallery && Array.isArray(result.imageGallery)) {
    result.imageGallery = result.imageGallery.map((item: any) => {
      if (item && typeof item === 'object') {
        const newItem = { ...item };
        if (newItem.image) {
          if (typeof newItem.image === 'string' || typeof newItem.image === 'number') {
            // Already an ID, keep as is
          } else if (typeof newItem.image === 'object' && newItem.image !== null) {
            if (newItem.image.id !== undefined) {
              newItem.image = newItem.image.id;
            } else {
              // If no id field, we need to find the image by its unique fields
              // For now, let's clear the image if we can't find the ID
              console.warn('Gallery image object without ID found:', newItem.image);
              newItem.image = null;
            }
          }
        }
        return newItem;
      }
      return item;
    }).filter((item: any) => item && item.image !== null); // Remove items with null images
  }
  
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({
      config: configPromise,
    });

    const { productIds } = await req.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    const duplicatedProducts = [];
    const failedProducts = [];

    for (const productId of productIds) {
      try {
        // Get the original product with depth 0 to get just IDs
        const originalProduct = await payload.findByID({
          collection: 'products',
          id: productId,
          depth: 0, // This ensures we get just IDs, not full objects
        });

        if (!originalProduct) {
          failedProducts.push({ id: productId, error: 'Product not found' });
          continue;
        }

        // Prepare duplicate data
        const duplicateData = {
          ...originalProduct,
          sku: `${originalProduct.sku}-COPY`,
          published: false, // Start as unpublished
        };

        // Remove system fields but keep relationship references
        const cleanData = prepareForDuplication(duplicateData);
        
        // Extract IDs from relationship fields
        const finalData = extractRelationshipIds(cleanData);

        // Log the final data for debugging
        console.log('Duplicating product with data:', JSON.stringify(finalData, null, 2));

        // Create the duplicate product
        const duplicatedProduct = await payload.create({
          collection: 'products',
          data: finalData,
        });

        duplicatedProducts.push(duplicatedProduct);
        console.log(`Successfully duplicated product ${productId} to ${duplicatedProduct.id}`);

      } catch (error) {
        console.error(`Error duplicating product ${productId}:`, error);
        failedProducts.push({ id: productId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      duplicatedProducts,
      failedProducts,
      message: `Successfully duplicated ${duplicatedProducts.length} products${failedProducts.length > 0 ? `, ${failedProducts.length} failed` : ''}`,
    });

  } catch (error) {
    console.error('Error in duplicate products API:', error);
    return NextResponse.json({ error: 'Failed to duplicate products' }, { status: 500 });
  }
} 