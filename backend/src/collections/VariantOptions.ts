import type { CollectionConfig } from 'payload'

export const VariantOptions: CollectionConfig = {
  slug: 'variant-options',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'value'],
    group: 'Product Management',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this option (e.g., "Red", "Large")',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Color', value: 'color' },
        { label: 'Size', value: 'size' },
        { label: 'Material', value: 'material' },
        { label: 'Style', value: 'style' },
      ],
      admin: {
        description: 'Type of variant option',
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal value/code for this option',
      },
    },
    {
      name: 'colorCode',
      type: 'text',
      required: false,
      admin: {
        description: 'Hex color code (for color type variants)',
        condition: (data) => data.type === 'color',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in which this option appears in lists',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this option is available for use',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-generate value if not provided
        if (!data.value) {
          data.value = data.name.toLowerCase().replace(/\s+/g, '-');
        }
        return data;
      },
    ],
  },
}

export default VariantOptions 