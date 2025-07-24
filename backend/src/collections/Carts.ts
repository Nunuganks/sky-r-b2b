import type { CollectionConfig } from 'payload';

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'itemsCount', 'total', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Users can only read their own cart
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => {
      // Users can only create their own cart
      return !!user;
    },
    update: ({ req: { user } }) => {
      // Users can only update their own cart
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      // Users can only delete their own cart
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'productId',
          type: 'text',
          required: true,
        },
        {
          name: 'sku',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'group',
          fields: [
            {
              name: 'en',
              type: 'text',
              required: true,
            },
            {
              name: 'bg',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
        {
          name: 'discountedPrice',
          type: 'number',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'imageUrl',
          type: 'text',
        },
        {
          name: 'stockStatus',
          type: 'select',
          options: [
            { label: 'Available', value: 'available' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Unavailable', value: 'unavailable' },
          ],
          required: true,
        },
        {
          name: 'deliveryTime',
          type: 'text',
        },
        {
          name: 'supplierName',
          type: 'text',
        },
      ],
    },
    {
      name: 'itemsCount',
      type: 'number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.items) {
              return data.items.length;
            }
            return 0;
          },
        ],
      },
    },
    {
      name: 'total',
      type: 'number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.items) {
              return data.items.reduce((sum: number, item: any) => {
                const price = item.discountedPrice || item.price;
                return sum + (price * item.quantity);
              }, 0);
            }
            return 0;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Ensure the cart belongs to the authenticated user
        if (req.user) {
          data.user = req.user.id;
        }
        return data;
      },
    ],
  },
}; 