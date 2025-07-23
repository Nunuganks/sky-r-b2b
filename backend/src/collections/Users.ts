import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'firstName', 'lastName', 'companyName'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    // Password field is automatically handled by Payload when auth: true
    // No need to define it manually
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneCountryCode',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
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
    // Company fields (for agencies)
    {
      name: 'companyName',
      type: 'text',
      required: false,
    },
    {
      name: 'eik',
      type: 'text',
      required: false,
    },
    {
      name: 'bulstat',
      type: 'text',
      required: false,
    },
    {
      name: 'mol',
      type: 'text',
      required: false,
    },
    {
      name: 'companyWebsite',
      type: 'text',
      required: false,
    },
    {
      name: 'companyActivity',
      type: 'textarea',
      required: false,
    },
    // Address fields
    {
      name: 'deliveryCountry',
      type: 'text',
      required: false,
    },
    {
      name: 'deliveryPostalCode',
      type: 'text',
      required: false,
    },
    {
      name: 'deliveryCity',
      type: 'text',
      required: false,
    },
    {
      name: 'deliveryAddress',
      type: 'text',
      required: false,
    },
    {
      name: 'invoiceCountry',
      type: 'text',
      required: false,
    },
    {
      name: 'invoicePostalCode',
      type: 'text',
      required: false,
    },
    {
      name: 'invoiceCity',
      type: 'text',
      required: false,
    },
    {
      name: 'invoiceAddress',
      type: 'text',
      required: false,
    },
    // Activation fields
    {
      name: 'activationToken',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isActivated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
               {
             name: 'isApproved',
             type: 'checkbox',
             defaultValue: false,
             admin: {
               position: 'sidebar',
             },
           },
           // Password reset fields
           {
             name: 'resetPasswordToken',
             type: 'text',
             required: false,
             admin: {
               position: 'sidebar',
             },
           },
           {
             name: 'resetPasswordTokenExpiry',
             type: 'date',
             required: false,
             admin: {
               position: 'sidebar',
             },
           },
  ],
};

export default Users;
