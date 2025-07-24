'use client';

import React, { useState } from 'react';
import CompactImageGallery from './CompactImageGallery';

interface ProductFormProps {
  product?: any;
  onSave?: (data: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave }) => {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || { en: '', bg: '' },
    description: product?.description || { en: '', bg: '' },
    price: product?.price || 0,
    ownStock: product?.ownStock || 0,
    deliveryStock: product?.deliveryStock || 0,
    deliveryTime: product?.deliveryTime || '',
    supplierName: product?.supplierName || '',
    published: product?.published !== false,
    imageGallery: product?.imageGallery || [],
  });

  const handleImageGalleryChange = (images: any[]) => {
    setFormData(prev => ({
      ...prev,
      imageGallery: images,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (English) *</label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: { ...prev.name, en: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name (Bulgarian) *</label>
              <input
                type="text"
                value={formData.name.bg}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: { ...prev.name, bg: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Stock Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Own Stock</label>
              <input
                type="number"
                value={formData.ownStock}
                onChange={(e) => setFormData(prev => ({ ...prev, ownStock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Stock</label>
              <input
                type="number"
                value={formData.deliveryStock}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryStock: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <CompactImageGallery
            value={formData.imageGallery}
            onChange={handleImageGalleryChange}
          />
        </div>

        {/* Publish Status */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Published (visible on website)
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 