'use client';

import React from 'react';
import ProductsList from '../components/ProductsList';

export default function CustomProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <ProductsList />
      </div>
    </div>
  );
} 