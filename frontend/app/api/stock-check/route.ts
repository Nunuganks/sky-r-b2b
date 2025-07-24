import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = 'http://127.0.0.1:3000';

export async function POST(req: NextRequest) {
  try {
    const { sku, locale = 'bg', quantity = 1 } = await req.json();

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    // Fetch product from CMS
    const response = await fetch(`${CMS_URL}/api/products?where[sku][equals]=${sku}&limit=1`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const product = data.docs?.[0];

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock availability logic
    const { ownStock, deliveryStock, deliveryTime, supplierName } = product;

    let status: 'available' | 'delivery' | 'unavailable' | 'partial' | 'insufficient';
    let responseData: any = {};

    // Check if requested quantity is available
    const hasEnoughOwnStock = ownStock >= quantity;
    const hasEnoughDeliveryStock = deliveryStock >= quantity;

    if (ownStock > 0 && hasEnoughOwnStock) {
      // Product is available in our warehouse with sufficient quantity
      status = 'available';
      responseData = {
        status,
        message: locale === 'bg' ? 'Продуктът е наличен в нашия склад' : 'Product is available in our warehouse',
        ownStock,
        deliveryStock,
        deliveryTime: deliveryTime || (locale === 'bg' ? '2-3 работни дни' : '2-3 working days'),
        supplierName: supplierName || (locale === 'bg' ? 'Европейски доставчик' : 'European Supplier'),
        canAddToCart: true,
        availableQuantity: ownStock,
      };
    } else if (ownStock > 0 && !hasEnoughOwnStock) {
      // Product available but not enough quantity in warehouse
      status = 'partial';
      responseData = {
        status,
        message: locale === 'bg' 
          ? `Налични са само ${ownStock} бр. на склад. Остатъкът ще бъде доставен.`
          : `Only ${ownStock} pcs. available in warehouse. The rest will be delivered.`,
        ownStock,
        deliveryStock,
        deliveryTime: deliveryTime || (locale === 'bg' ? '2-3 работни дни' : '2-3 working days'),
        supplierName: supplierName || (locale === 'bg' ? 'Европейски доставчик' : 'European Supplier'),
        canAddToCart: true,
        requiresConfirmation: true,
        availableQuantity: ownStock,
        missingQuantity: quantity - ownStock,
      };
    } else if (deliveryStock > 0 && hasEnoughDeliveryStock) {
      // Product is available from European supplier
      status = 'delivery';
      responseData = {
        status,
        message: locale === 'bg' 
          ? 'Стоката, която добавяте, не е налична на склад в София! Потвърдете, че ще изчакате доставката в посочения период.'
          : 'The item you are adding is not available in stock in Sofia! Confirm that you will wait for delivery within the specified period.',
        deliveryStock,
        deliveryTime: deliveryTime || (locale === 'bg' ? '2-3 работни дни' : '2-3 working days'),
        supplierName: supplierName || (locale === 'bg' ? 'Европейски доставчик' : 'European Supplier'),
        canAddToCart: false, // Requires confirmation
        requiresConfirmation: true,
        availableQuantity: deliveryStock,
      };
    } else if (deliveryStock > 0 && !hasEnoughDeliveryStock) {
      // Product available from supplier but not enough quantity
      status = 'insufficient';
      responseData = {
        status,
        message: locale === 'bg' 
          ? `Налични са само ${deliveryStock} бр. за доставка.`
          : `Only ${deliveryStock} pcs. available for delivery.`,
        deliveryStock,
        deliveryTime: deliveryTime || (locale === 'bg' ? '2-3 работни дни' : '2-3 working days'),
        supplierName: supplierName || (locale === 'bg' ? 'Европейски доставчик' : 'European Supplier'),
        canAddToCart: false,
        availableQuantity: deliveryStock,
        requestedQuantity: quantity,
      };
    } else {
      // Product is not available anywhere
      status = 'unavailable';
      responseData = {
        status,
        message: locale === 'bg' 
          ? 'Продуктът в момента не е наличен. Можете да настроите предупреждение за наличност.'
          : 'Product is currently out of stock. You can set up a stock alert.',
        ownStock: 0,
        deliveryStock: 0,
        canAddToCart: false,
        requiresStockAlert: true,
        availableQuantity: 0,
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Stock check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 