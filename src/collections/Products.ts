import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['sku', 'name', 'price', 'ownStock', 'deliveryStock', 'syncUpdatedAt'],
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
      name: 'imageGallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
      required: false,
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
      name: 'syncUpdatedAt',
      type: 'date',
      required: false,
    },
  ],
};

export default Products;
