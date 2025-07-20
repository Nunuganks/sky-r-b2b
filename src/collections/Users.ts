import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'discountPercent'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Agency', value: 'agency' },
        { label: 'Reseller', value: 'reseller' },
        { label: 'VIP', value: 'vip' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'customer',
      required: true,
    },
    {
      name: 'discountPercent',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    // ...other fields as needed...
  ],
};

export default Users;
