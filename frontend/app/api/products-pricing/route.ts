import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Best practice: Use environment variable, never hardcode secrets
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
if (!PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required');
}
const CMS_URL = 'http://127.0.0.1:3000';

function getAuthToken(req: NextRequest) {
  return req.headers.get('Authorization')?.replace('Bearer ', '') || req.cookies.get('payload-token')?.value;
}

function verifyToken(token: string | undefined) {
  if (!token || !PAYLOAD_SECRET) return null;
  try {
    return jwt.verify(token, PAYLOAD_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = getAuthToken(req);
  const user = verifyToken(token);
  
  const discount =
    user && typeof user === 'object' && 'discountPercent' in user
      ? (user as any).discountPercent ?? 0
      : 0;

  const res = await fetch(`${CMS_URL}/api/products?limit=100&where[published][equals]=true`);
  const data = await res.json();
  const products = data.docs || [];

  const result = products.map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    imageGallery: p.imageGallery,
    categories: p.categories,
    price: p.price,
    ownStock: p.ownStock,
    deliveryStock: p.deliveryStock,
    deliveryTime: p.deliveryTime,
    supplierName: p.supplierName,
    discountedPrice: user ? p.price * (1 - discount / 100) : undefined,
  }));

  return NextResponse.json(result);
} 