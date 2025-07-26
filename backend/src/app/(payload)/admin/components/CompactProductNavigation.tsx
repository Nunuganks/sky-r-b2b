'use client';

import React from 'react';
import Link from 'next/link';

const CompactProductNavigation: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Product Management</h1>
            <nav className="flex space-x-4">
              <Link
                href="/admin/collections/products"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Standard Products
              </Link>
              <Link
                href="/admin/compact-product-edit"
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Compact Gallery
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/admin/collections/products/create"
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
            >
              Add New Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactProductNavigation; 