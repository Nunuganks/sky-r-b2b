import { NextRequest, NextResponse } from 'next/server';

// In a real application, you would store this in a database
// For now, we'll use a simple in-memory store (will be lost on server restart)
let stockAlerts: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const { productId, sku, name, email } = await req.json();

    if (!productId || !sku || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if alert already exists for this product and email
    const existingAlert = stockAlerts.find(
      alert => alert.productId === productId && alert.email === email
    );

    if (existingAlert) {
      return NextResponse.json(
        { error: 'Stock alert already exists for this product and email' },
        { status: 409 }
      );
    }

    // Add new stock alert
    const newAlert = {
      id: Date.now().toString(),
      productId,
      sku,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    stockAlerts.push(newAlert);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Set up monitoring for when stock becomes available

    return NextResponse.json({
      success: true,
      message: 'Stock alert created successfully',
      alert: newAlert,
    });

  } catch (error) {
    console.error('Stock alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Filter alerts by email
    const userAlerts = stockAlerts.filter(alert => alert.email === email);

    return NextResponse.json({
      alerts: userAlerts,
    });

  } catch (error) {
    console.error('Get stock alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Remove alert
    const initialLength = stockAlerts.length;
    stockAlerts = stockAlerts.filter(alert => alert.id !== alertId);

    if (stockAlerts.length === initialLength) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stock alert removed successfully',
    });

  } catch (error) {
    console.error('Delete stock alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 