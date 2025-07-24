# 🛒 SKY-R B2B Cart System

## Overview

The cart system implements a comprehensive stock availability checking mechanism with three main scenarios:

1. **Available in Warehouse** - Products with `ownStock > 0`
2. **Available from European Supplier** - Products with `deliveryStock > 0` but `ownStock = 0`
3. **Unavailable** - Products with both `ownStock = 0` and `deliveryStock = 0`

## 🏗️ Architecture

### Core Components

#### 1. Cart Context (`/frontend/app/contexts/CartContext.tsx`)
- **State Management**: Uses React useReducer for cart state
- **Persistence**: Saves cart to localStorage
- **Stock Checking**: Integrates with stock availability API
- **Stock Alerts**: Manages stock alert subscriptions

#### 2. Stock Check API (`/frontend/app/api/stock-check/route.ts`)
- **Endpoint**: `POST /api/stock-check`
- **Logic**: Checks product availability based on `ownStock` and `deliveryStock`
- **Response**: Returns status and delivery information

#### 3. Stock Alerts API (`/frontend/app/api/stock-alerts/route.ts`)
- **Endpoints**: 
  - `POST /api/stock-alerts` - Create stock alert
  - `GET /api/stock-alerts?email=...` - Get user alerts
  - `DELETE /api/stock-alerts?id=...` - Remove alert

#### 4. Add to Cart Button (`/frontend/app/components/AddToCartButton.tsx`)
- **Stock Checking**: Validates availability before adding
- **Modals**: Shows appropriate dialogs for different stock statuses
- **Quantity Controls**: Allows quantity selection

#### 5. Cart Page (`/frontend/app/[locale]/cart/page.tsx`)
- **Display**: Shows cart items with stock status indicators
- **Management**: Quantity updates and item removal
- **Summary**: Order total and checkout flow

## 🔄 Stock Availability Logic

### Flow Diagram
```
User clicks "Add to Cart"
         ↓
Check stock availability
         ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   ownStock > 0  │ deliveryStock>0 │  Both = 0      │
│                 │ & ownStock = 0  │                 │
├─────────────────┼─────────────────┼─────────────────┤
│   Add to Cart   │ Show Delivery   │ Show Stock      │
│   Immediately   │ Confirmation    │ Alert Modal     │
│                 │ Modal           │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

### Stock Status Types

#### 1. Available (`ownStock > 0`)
- **Action**: Add to cart immediately
- **Message**: "Product is available in our warehouse"
- **Color**: Green indicator

#### 2. Delivery (`deliveryStock > 0` but `ownStock = 0`)
- **Action**: Show confirmation modal
- **Message**: "Product is available from European supplier"
- **Details**: Shows delivery time (e.g., "5-7 working days")
- **Color**: Orange indicator

#### 3. Unavailable (both stocks = 0)
- **Action**: Show stock alert modal
- **Message**: "Product is currently out of stock"
- **Option**: Set up stock alert notification
- **Color**: Red indicator

## 🎯 User Experience

### For Available Products
1. User clicks "Add to Cart"
2. Product added immediately
3. Success feedback shown

### For European Supplier Products
1. User clicks "Add to Cart"
2. Modal appears: "This product will be delivered from our European supplier. You will need to wait 5-7 working days. Are you sure you want to continue?"
3. User can:
   - **Cancel**: Close modal, no action
   - **Continue**: Add to cart with delivery status

### For Unavailable Products
1. User clicks "Add to Cart"
2. Modal appears: "This product is currently out of stock. Enter your email to be notified when the product becomes available."
3. User can:
   - **Cancel**: Close modal, no action
   - **Add Alert**: Enter email and subscribe to stock notifications

## 📊 Data Structure

### Cart Item
```typescript
interface CartItem {
  id: string;
  sku: string;
  name: { en: string; bg: string };
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
  stockStatus: 'available' | 'delivery' | 'unavailable';
  deliveryTime?: string;
  supplierName?: string;
}
```

### Stock Alert
```typescript
interface StockAlert {
  productId: string;
  sku: string;
  name: { en: string; bg: string };
  email: string;
  createdAt: Date;
}
```

## 🌐 Internationalization

The system supports both Bulgarian (`bg`) and English (`en`) languages:

- **Cart Page**: Full localization
- **Modals**: Language-specific messages
- **Status Indicators**: Translated stock status messages
- **Buttons**: Localized action buttons

## 🔧 API Endpoints

### Stock Check
```http
POST /api/stock-check
Content-Type: application/json

{
  "sku": "PRODUCT-SKU"
}
```

**Response:**
```json
{
  "status": "available|delivery|unavailable",
  "message": "Status description",
  "ownStock": 10,
  "deliveryStock": 5,
  "deliveryTime": "5-7 working days",
  "supplierName": "European Supplier"
}
```

### Stock Alerts
```http
POST /api/stock-alerts
Content-Type: application/json

{
  "productId": "123",
  "sku": "PRODUCT-SKU",
  "name": { "en": "Product Name", "bg": "Име на продукт" },
  "email": "user@example.com"
}
```

## 🚀 Implementation Steps

1. **Cart Context**: Provides state management and stock checking
2. **API Endpoints**: Handle stock availability and alerts
3. **UI Components**: Add to cart button and cart page
4. **Integration**: Connect to existing product listing
5. **Testing**: Verify all stock scenarios work correctly

## 🔮 Future Enhancements

### Database Integration
- Store stock alerts in database instead of memory
- Add email notification system
- Implement stock monitoring and automatic notifications

### Advanced Features
- Real-time stock updates
- Bulk stock alert management
- Email templates for notifications
- Admin interface for stock alert management

### Performance
- Cache stock availability results
- Implement optimistic updates
- Add loading states for better UX

## 🧪 Testing Scenarios

### Test Cases
1. **Available Product**: Should add to cart immediately
2. **European Supplier**: Should show confirmation modal
3. **Unavailable Product**: Should show stock alert modal
4. **Quantity Changes**: Should update cart correctly
5. **Cart Persistence**: Should survive page refresh
6. **Stock Alerts**: Should create and manage alerts correctly

### Edge Cases
- Network failures during stock check
- Invalid product SKUs
- Duplicate stock alerts
- Cart state corruption

## 📝 Notes

- **Current Implementation**: Uses in-memory storage for stock alerts (will be lost on server restart)
- **Production Ready**: Requires database integration for stock alerts
- **Email System**: Stock alert notifications need email service integration
- **Security**: Add authentication for stock alert management
- **Monitoring**: Add logging for stock check failures and user actions 