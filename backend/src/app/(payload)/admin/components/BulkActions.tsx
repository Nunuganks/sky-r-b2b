'use client';

import React, { useState } from 'react';

interface BulkActionsProps {
  selectedIds: string[];
  onSuccess?: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedIds, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDuplicate = async () => {
    if (selectedIds.length === 0) {
      showMessage('Please select at least one product to duplicate', true);
      return;
    }

    setIsLoading(true);
    try {
      const promises = selectedIds.map(async (productId) => {
        const response = await fetch('/api/admin/duplicate-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to duplicate product ${productId}`);
        }

        return response.json();
      });

      await Promise.all(promises);
      showMessage(`Successfully duplicated ${selectedIds.length} product(s)`);
      onSuccess?.();
    } catch (error) {
      console.error('Error duplicating products:', error);
      showMessage('Failed to duplicate products', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpdate = async (action: 'publish' | 'unpublish') => {
    if (selectedIds.length === 0) {
      showMessage('Please select at least one product', true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/bulk-update-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedIds,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update products');
      }

      const result = await response.json();
      showMessage(result.message);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating products:', error);
      showMessage('Failed to update products', true);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('Failed') || message.includes('Please select') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex gap-2 p-4 bg-gray-50 border rounded-lg mb-4">
        <span className="text-sm text-gray-600 self-center">
          {selectedIds.length} product(s) selected
        </span>
        
        <button
          onClick={handleDuplicate}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded font-medium"
        >
          {isLoading ? 'Duplicating...' : 'Duplicate'}
        </button>
        
        <button
          onClick={() => handleBulkUpdate('publish')}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded font-medium"
        >
          {isLoading ? 'Updating...' : 'Publish'}
        </button>
        
        <button
          onClick={() => handleBulkUpdate('unpublish')}
          disabled={isLoading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded font-medium"
        >
          {isLoading ? 'Updating...' : 'Unpublish'}
        </button>
      </div>
    </div>
  );
};

export default BulkActions; 