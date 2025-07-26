'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const AdminNavigation: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/compact-product-edit')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Standard Products
            </button>
            <button
              onClick={() => router.push('/admin/compact-product-edit')}
              className="bg-purple-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-600"
            >
              Compact Gallery Editor
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation; 