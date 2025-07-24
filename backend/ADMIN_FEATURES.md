# Admin Panel Features

## Product Management Features

### 1. Published/Unpublished Status
- All products now have a `published` field (checkbox)
- Only published products are shown on the frontend website
- Unpublished products are hidden from customers but still exist in the admin

### 2. Bulk Operations
You can select multiple products and perform bulk actions:

#### Duplicate Products
- Select one or more products using checkboxes
- Click "Duplicate" button to create copies
- Duplicated products will have:
  - Original SKU + timestamp (e.g., "PROD-001-1703123456789")
  - "(Copy)" added to the name in both English and Bulgarian
  - Published status set to false by default
  - All other data copied from original

#### Publish/Unpublish Products
- Select multiple products using checkboxes
- Click "Publish" to make them visible on the website
- Click "Unpublish" to hide them from the website

### 3. Individual Product Actions
- Each product row has "Edit" and "Duplicate" buttons
- Edit button takes you to the product edit page
- Duplicate button creates a copy of that specific product

### 4. API Endpoints

#### Duplicate Product
```
POST /api/admin/duplicate-product
Body: { "productId": "product-id" }
```

#### Bulk Update Products
```
POST /api/admin/bulk-update-products
Body: { 
  "productIds": ["id1", "id2", "id3"], 
  "action": "publish" | "unpublish" 
}
```

### 5. Accessing the Features

#### Standard Admin Panel
- Go to `/admin` and navigate to Products collection
- Use the standard Payload admin interface
- The `published` field is visible in the product form
- Published status is shown in the products list

#### Custom Products Management Page
- Go to `/admin/custom-products` for enhanced bulk operations
- This page provides:
  - Checkbox selection for multiple products
  - Bulk action buttons (Duplicate, Publish, Unpublish)
  - Real-time status updates
  - Better visual feedback

### 6. Frontend Integration
- The frontend automatically filters out unpublished products
- Only published products appear in:
  - Product listings
  - Search results
  - Category pages
  - Homepage showcase

### 7. Usage Examples

#### To duplicate a product:
1. Go to `/admin/custom-products`
2. Select the product(s) you want to duplicate
3. Click "Duplicate" button
4. The duplicated product(s) will be created with "(Copy)" in the name

#### To hide products from the website:
1. Select the products you want to hide
2. Click "Unpublish" button
3. The products will no longer appear on the frontend

#### To show hidden products:
1. Select the unpublished products
2. Click "Publish" button
3. The products will become visible on the frontend again

### 8. Database Changes
- Added `published` field to Products collection
- Default value: `true` (published)
- Field type: checkbox
- Admin description: "Control whether this product is visible on the website"

### 9. Security
- All admin operations require authentication
- API endpoints are protected
- Only admin users can perform these operations 