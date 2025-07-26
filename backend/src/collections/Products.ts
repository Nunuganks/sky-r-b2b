import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['mainImage', 'name', 'sku', 'price', 'ownStock', 'deliveryStock', 'published'],
  },
  fields: [
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'group',
      fields: [
        { name: 'en', type: 'text', required: true },
        { name: 'bg', type: 'text', required: true },
      ],
      required: true,

    },
    {
      name: 'description',
      type: 'group',
      fields: [
        { name: 'en', type: 'textarea', required: false },
        { name: 'bg', type: 'textarea', required: false },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      access: {
        read: () => true,
      },
    },
    {
      name: 'ownStock',
      type: 'number',
      required: true,
      defaultValue: 0,
      access: {
        read: () => true,
      },
    },
    {
      name: 'deliveryStock',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'deliveryTime',
      type: 'text',
      required: false,
    },
    {
      name: 'supplierName',
      type: 'text',
      required: false,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      required: false,
      admin: {
        description: 'Add tags to help organize and search products',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Main product image (will be shown in product lists)',
      },
    },
    {
      name: 'imageGallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Upload product image',
          },
        },
        {
          name: 'alt',
          type: 'text',
          required: false,
          admin: {
            description: 'Alt text for accessibility',
            position: 'sidebar',
          },
        },
        {
          name: 'isMain',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Set as main product image',
            position: 'sidebar',
          },
        },
      ],
      required: false,
      admin: {
        description: 'Upload product images. First image will be used as the main product image.',
        position: 'sidebar',
      },
    },
    {
      name: 'brandingOptions',
      type: 'array',
      fields: [
        { name: 'option', type: 'text', required: true },
      ],
      required: false,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Control whether this product is visible on the website',
      },
    },
    {
      name: 'syncUpdatedAt',
      type: 'date',
      required: false,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set main image from first image in gallery if gallery has images
        if (data.imageGallery && data.imageGallery.length > 0) {
          // Set the first image as main if no main image is set
          let hasMainImage = false;
          data.imageGallery.forEach((item: any) => {
            if (item.isMain) {
              hasMainImage = true;
            }
          });
          
          if (!hasMainImage) {
            data.imageGallery[0].isMain = true;
          }
          
          // Set the main image field to the first main image
          const mainImageItem = data.imageGallery.find((item: any) => item.isMain);
          if (mainImageItem) {
            data.mainImage = mainImageItem.image;
          } else {
            data.mainImage = data.imageGallery[0].image;
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // If this is a duplicate operation, update the SKU
        if (operation === 'create' && doc.sku && doc.sku.includes('-copy')) {
          // Generate a unique SKU for the duplicated product
          const timestamp = Date.now();
          const newSku = `${doc.sku.replace('-copy', '')}-${timestamp}`;
          
          // Update the document with the new SKU
          await req.payload.update({
            collection: 'products',
            id: doc.id,
            data: {
              ...doc,
              sku: newSku,
            },
          });
        }
      },
    ],
  },
};

export default Products;
