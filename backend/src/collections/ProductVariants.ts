import type { CollectionConfig } from 'payload'

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'product', 'variantOptions', 'price', 'ownStock', 'deliveryStock'],
    group: 'Product Management',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: {
        description: 'Parent product this variant belongs to',
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique SKU for this specific variant',
      },
    },
    {
      name: 'variantOptions',
      type: 'array',
      fields: [
        {
          name: 'option',
          type: 'relationship',
          relationTo: 'variant-options',
          required: true,
          admin: {
            description: 'Variant option (e.g., color, size)',
          },
        },
      ],
      required: true,
      admin: {
        description: 'Variant options that define this variant (e.g., Red + Large)',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Price for this specific variant (overrides product base price)',
      },
    },
    {
      name: 'ownStock',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Stock available in own warehouse',
      },
    },
    {
      name: 'deliveryStock',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Stock available for delivery',
      },
    },
    {
      name: 'deliveryTime',
      type: 'text',
      required: false,
      admin: {
        description: 'Specific delivery time for this variant (overrides product delivery time)',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Main image for this specific variant',
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
            description: 'Upload variant image',
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
            description: 'Set as main variant image',
            position: 'sidebar',
          },
        },
      ],
      required: false,
      admin: {
        description: 'Variant-specific images',
        position: 'sidebar',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this variant is available for purchase',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in which this variant appears in lists',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-generate SKU if not provided
        if (!data.sku && data.product) {
          const product = await req.payload.findByID({
            collection: 'products',
            id: data.product,
          });
          
          if (product) {
            const variantOptions = data.variantOptions || [];
            const optionValues = variantOptions.map((opt: any) => {
              if (typeof opt.option === 'string') {
                return opt.option; // If it's already an ID, we'll need to fetch the option
              }
              return opt.option?.value || opt.option;
            });
            
            const variantSuffix = optionValues.length > 0 ? `-${optionValues.join('-')}` : '';
            data.sku = `${product.sku}${variantSuffix}`;
          }
        }

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
  },
}

export default ProductVariants 