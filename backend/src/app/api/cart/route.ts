import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import jwt from 'jsonwebtoken';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Simple test endpoint
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid token provided' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get payload instance properly
    const payload = await getPayload({
      config: configPromise,
    });

    // Find the user's cart
    const carts = await payload.find({
      collection: 'carts',
      where: {
        user: {
          equals: decoded.userId,
        },
      },
      limit: 1,
    });

    const cart = carts.docs[0];
    
    if (!cart) {
      // Return empty cart if none exists
      return NextResponse.json({
        items: [],
        total: 0,
        count: 0,
      }, {
        headers: corsHeaders,
      });
    }

    return NextResponse.json({
      items: cart.items || [],
      total: cart.total || 0,
      count: cart.itemsCount || 0,
    }, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { 
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid token provided' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    const { action, item, quantity } = await request.json();
    
    // Verify the token
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get payload instance properly
    const payload = await getPayload({
      config: configPromise,
    });

    // Find the user's cart
    const carts = await payload.find({
      collection: 'carts',
      where: {
        user: {
          equals: decoded.userId,
        },
      },
      limit: 1,
    });

    let cart = carts.docs[0];
    let cartItems = cart?.items || [];

    switch (action) {
      case 'add':
        // productId is now stored as a simple string
        const existingItem = cartItems.find((cartItem: any) => cartItem.productId === item.id);
        if (existingItem) {
          cartItems = cartItems.map((cartItem: any) =>
            cartItem.productId === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        } else {
          cartItems.push({
            productId: item.id,
            sku: item.sku,
            name: item.name,
            price: item.price,
            discountedPrice: item.discountedPrice,
            quantity,
            imageUrl: item.imageUrl,
            stockStatus: item.stockStatus,
            deliveryTime: item.deliveryTime,
            supplierName: item.supplierName,
          });
        }
        break;
        
      case 'update':
        cartItems = cartItems.map((cartItem: any) =>
          cartItem.productId === item.id
            ? { ...cartItem, quantity }
            : cartItem
        );
        break;
        
      case 'remove':
        // Remove item by matching either productId or id
        cartItems = cartItems.filter((cartItem: any) => {
          // Check if the cart item matches the item to remove
          // The item.id could be either the productId or the cart item's own id
          return cartItem.productId !== item.id && cartItem.id !== item.id;
        });
        break;
        
      case 'clear':
        cartItems = [];
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { 
          status: 400,
          headers: corsHeaders,
        });
    }

    // Calculate totals
    const total = cartItems.reduce((sum: number, item: any) => {
      const price = item.discountedPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);

    const itemsCount = cartItems.length;

    if (cart) {
      // Update existing cart
      cart = await payload.update({
        collection: 'carts',
        id: cart.id,
        data: {
          items: cartItems,
          total,
          itemsCount,
        },
      });
    } else {
      // Create new cart
      cart = await payload.create({
        collection: 'carts',
        data: {
          user: decoded.userId,
          items: cartItems,
          total,
          itemsCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      items: cartItems,
      total,
      count: itemsCount,
    }, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { 
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid token provided' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    const { localCart } = await request.json();
    
    // Verify the token
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { 
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get payload instance properly
    const payload = await getPayload({
      config: configPromise,
    });

    // Find the user's cart
    const carts = await payload.find({
      collection: 'carts',
      where: {
        user: {
          equals: decoded.userId,
        },
      },
      limit: 1,
    });

    let cart = carts.docs[0];
    let cartItems = cart?.items || [];

    // Merge local cart with user's saved cart
    const mergedCart = [...cartItems];

    localCart.forEach((localItem: any) => {
      const existingItem = mergedCart.find((item: any) => item.productId === localItem.id);
      if (existingItem) {
        // If item exists in both carts, keep the higher quantity
        existingItem.quantity = Math.max(existingItem.quantity, localItem.quantity);
      } else {
        // Add new item from local cart
        mergedCart.push({
          productId: localItem.id,
          sku: localItem.sku,
          name: localItem.name,
          price: localItem.price,
          discountedPrice: localItem.discountedPrice,
          quantity: localItem.quantity,
          imageUrl: localItem.imageUrl,
          stockStatus: localItem.stockStatus,
          deliveryTime: localItem.deliveryTime,
          supplierName: localItem.supplierName,
        });
      }
    });

    // Calculate totals
    const total = mergedCart.reduce((sum: number, item: any) => {
      const price = item.discountedPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);

    const itemsCount = mergedCart.length;

    if (cart) {
      // Update existing cart
      cart = await payload.update({
        collection: 'carts',
        id: cart.id,
        data: {
          items: mergedCart,
          total,
          itemsCount,
        },
      });
    } else {
      // Create new cart
      cart = await payload.create({
        collection: 'carts',
        data: {
          user: decoded.userId,
          items: mergedCart,
          total,
          itemsCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      items: mergedCart,
      total,
      count: itemsCount,
    }, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    return NextResponse.json({ error: 'Failed to merge cart' }, { 
      status: 500,
      headers: corsHeaders,
    });
  }
} 