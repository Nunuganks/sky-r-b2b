import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Best practice: Use environment variable, never hardcode secrets
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
if (!PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required');
}

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
  console.log('Me API - Token received:', token ? 'Yes' : 'No');
  
  const user = verifyToken(token);
  console.log('Me API - User verified:', user ? 'Yes' : 'No');
  console.log('Me API - User data:', user);

  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role,
      discountPercent: user.discountPercent
    }
  });
} 