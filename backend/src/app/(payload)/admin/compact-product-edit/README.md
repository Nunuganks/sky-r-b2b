# Compact Product Editor

This is a custom product management interface for the SKY-R B2B platform that provides a more visual and efficient way to manage products.

## Features

### Gallery View (`/admin/compact-product-edit`)
- **Visual Product Grid**: See all products in a card-based layout with images
- **Quick Search**: Search products by SKU or name (English/Bulgarian)
- **Status Filtering**: Filter by published/unpublished status
- **Quick Actions**: Edit products directly from the gallery view
- **Stock Overview**: See own stock and delivery stock at a glance

### Individual Product Edit (`/admin/compact-product-edit/[id]`)
- **Split Layout**: Image preview on the left, form fields on the right
- **Essential Fields**: Focus on the most important product information
- **Quick Save**: Save changes without navigating away
- **Full Edit Link**: Access the complete Payload editor when needed

## Usage

1. **Access the Gallery**: Navigate to `/admin/compact-product-edit`
2. **Search & Filter**: Use the search bar and status filter to find products
3. **Edit Products**: Click "Edit" on any product card to open the compact editor
4. **Save Changes**: Use the "Save Changes" button to update products
5. **Full Editor**: Click "Full Edit" to access the complete Payload editor

## Navigation

- **Standard Products**: `/admin/collections/products` - Full Payload admin interface
- **Compact Gallery**: `/admin/compact-product-edit` - Visual gallery interface
- **Add New Product**: `/admin/collections/products/create` - Create new products

## Technical Details

- Built with Next.js and TypeScript
- Uses Payload CMS API for data management
- Responsive design with Tailwind CSS
- Real-time search and filtering
- Image optimization and lazy loading

## File Structure

```
compact-product-edit/
├── page.tsx              # Gallery view
├── [id]/
│   └── page.tsx          # Individual product edit
├── layout.tsx            # Layout wrapper
├── styles.css            # Custom styles
└── README.md            # This file
``` 