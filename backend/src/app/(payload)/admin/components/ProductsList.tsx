'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BulkActions from './BulkActions';

interface Product {
  id: string;
  sku: string;
  name: {
    en: string;
    bg: string;
  };
  price: number;
  ownStock: number;
  deliveryStock: number;
  published: boolean;
  imageGallery?: Array<{
    image: {
      url: string;
      filename: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?depth=2');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.docs || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSuccess = () => {
    fetchProducts();
    setSelectedIds([]);
  };

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button
          onClick={() => router.push('/admin/collections/products/create')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
        >
          Add New Product
        </button>
      </div>

      <BulkActions selectedIds={selectedIds} onSuccess={handleSuccess} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0">
                    {product.imageGallery && product.imageGallery.length > 0 ? (
                      <img
                        src={product.imageGallery[0].image.url}
                        alt={product.name.en}
                        className="h-12 w-12 rounded-lg object-contain border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium text-gray-900">{product.name.en}</div>
                    <div className="text-gray-500 text-xs">{product.name.bg}</div>
                    <div className="text-gray-400 text-xs font-mono mt-1">{product.sku}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>Own: {product.ownStock}</div>
                    <div>Delivery: {product.deliveryStock}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.published ? 'Published' : 'Unpublished'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/collections/products/${product.id}`)}
                      className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/admin/collections/products/${product.id}/duplicate`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Duplicate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsList; 