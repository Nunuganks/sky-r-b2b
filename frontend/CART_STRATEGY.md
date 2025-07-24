# Cart Strategy Implementation

## Overview

This document outlines the comprehensive cart strategy implemented for the SKY-R B2B platform, designed to handle both authenticated and guest users with seamless synchronization and multi-device support.

## Architecture

### For Authenticated Users

**Storage**: Cart is stored in the database, bound to the user account
**Access**: Available from multiple devices and browsers
**Sync**: Real-time synchronization via API (`/api/cart`)
**Persistence**: Survives browser sessions, device changes, and app restarts

### For Guest Users

**Storage**: Cart is stored temporarily in localStorage
**Access**: Limited to current browser/device
**Sync**: Local only, no server synchronization
**Persistence**: Survives browser sessions but not device changes

## Implementation Details

### Cart Context (`CartContext.tsx`)

The cart context manages the state and provides the following features:

#### State Management
- `items`: Array of cart items
- `stockAlerts`: Array of stock alert subscriptions
- `isOpen`: Cart modal state
- `isAuthenticated`: User authentication status
- `isSyncing`: Database sync status

#### Key Functions
- `addToCart()`: Add items with stock checking
- `removeFromCart()`: Remove items with database sync
- `updateQuantity()`: Update quantities with database sync
- `clearCart()`: Clear cart with database sync
- `addStockAlert()`: Subscribe to stock notifications

### API Endpoints (`/api/cart`)

#### GET `/api/cart`
- **Purpose**: Fetch user's cart from database
- **Authentication**: Required (Bearer token)
- **Response**: Cart items, total, and count

#### POST `/api/cart`
- **Purpose**: Update cart in database
- **Authentication**: Required (Bearer token)
- **Actions**: `add`, `update`, `remove`, `clear`
- **Response**: Updated cart data

#### PUT `/api/cart`
- **Purpose**: Merge local cart with user's saved cart
- **Authentication**: Required (Bearer token)
- **Use Case**: Called when user logs in
- **Response**: Merged cart data

## User Experience Flow

### Guest User Journey

1. **Browse Products**: User adds items to cart (stored in localStorage)
2. **Continue Shopping**: Cart persists across page refreshes
3. **Login**: Local cart is automatically merged with user's saved cart
4. **Post-Login**: Cart is now synced to database, accessible from any device

### Authenticated User Journey

1. **Login**: User's saved cart is loaded from database
2. **Add Items**: Changes are immediately synced to database
3. **Multi-Device**: Cart is accessible from any device/browser
4. **Agency Workflow**: Perfect for agencies managing multiple clients

## Key Features

### Multi-Session Support
- **Agencies**: Can manage multiple client carts simultaneously
- **Cross-Device**: Cart syncs across all user devices
- **Browser Independence**: Works across different browsers

### Seamless Authentication
- **Auto-Merge**: Local cart merges with saved cart on login
- **Conflict Resolution**: Higher quantities are preserved during merge
- **Clean Transition**: Local cart is cleared after successful merge

### Real-Time Sync
- **Immediate Updates**: All cart changes sync to database instantly
- **Error Handling**: Graceful fallback if sync fails
- **Status Indicators**: UI shows sync status to users

### Stock Management
- **Availability Checking**: Real-time stock status for each item
- **Delivery Options**: Shows delivery time and supplier info
- **Stock Alerts**: Users can subscribe to stock notifications

## Technical Implementation

### Database Schema (Conceptual)
```sql
CREATE TABLE user_carts (
  user_id VARCHAR(255) PRIMARY KEY,
  cart_data JSON,
  updated_at TIMESTAMP
);

CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  product_id VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP
);
```

### API Response Format
```json
{
  "items": [
    {
      "id": "product-123",
      "sku": "SKU123",
      "name": { "en": "Product Name", "bg": "Име на продукт" },
      "price": 99.99,
      "quantity": 2,
      "stockStatus": "available",
      "deliveryTime": "2-3 days",
      "supplierName": "Supplier Co."
    }
  ],
  "total": 199.98,
  "count": 2
}
```

## Error Handling

### Network Failures
- **Offline Mode**: Cart continues to work locally
- **Retry Logic**: Failed syncs are retried automatically
- **User Feedback**: Clear indication of sync status

### Authentication Issues
- **Token Expiry**: Automatic logout and cart preservation
- **Invalid Tokens**: Graceful fallback to guest mode
- **Re-authentication**: Cart restored after successful login

## Performance Considerations

### Optimization Strategies
- **Debounced Sync**: Batch multiple cart changes
- **Lazy Loading**: Load cart data only when needed
- **Caching**: Cache cart data to reduce API calls

### Scalability
- **Database Indexing**: Optimized queries for cart operations
- **API Rate Limiting**: Prevent abuse of cart endpoints
- **CDN Integration**: Fast delivery of cart-related assets

## Security Measures

### Data Protection
- **Token-Based Auth**: Secure API access
- **Input Validation**: Sanitize all cart data
- **SQL Injection Prevention**: Parameterized queries

### Privacy Compliance
- **GDPR Compliance**: User data handling
- **Data Retention**: Automatic cleanup of old cart data
- **User Consent**: Clear data usage policies

## Testing Strategy

### Unit Tests
- Cart state management
- API endpoint functionality
- Error handling scenarios

### Integration Tests
- Authentication flow
- Cart synchronization
- Multi-device scenarios

### User Acceptance Tests
- Guest user workflow
- Authenticated user workflow
- Agency-specific use cases

## Future Enhancements

### Planned Features
- **Cart Sharing**: Share carts between team members
- **Cart Templates**: Pre-configured cart templates
- **Bulk Operations**: Mass cart item management
- **Advanced Analytics**: Cart behavior insights

### Technical Improvements
- **WebSocket Sync**: Real-time cart updates
- **Offline Support**: Enhanced offline functionality
- **Mobile App**: Native mobile cart experience 