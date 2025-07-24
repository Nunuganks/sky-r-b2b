'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DuplicateButtonProps {
  productId: string;
  productName: string;
}

const DuplicateButton: React.FC<DuplicateButtonProps> = ({ productId, productName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/duplicate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate product');
      }

      const result = await response.json();
      setMessage('Product duplicated successfully!');
      setTimeout(() => {
        // Redirect to the new product
        router.push(`/admin/collections/products/${result.product.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error duplicating product:', error);
      setMessage('Failed to duplicate product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('Failed') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleDuplicate}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded font-medium"
      >
        {isLoading ? 'Duplicating...' : `Duplicate "${productName}"`}
      </button>
    </div>
  );
};

export default DuplicateButton; 