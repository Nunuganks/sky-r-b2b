import React from 'react';

interface ProductImageFieldProps {
  value?: Array<{
    image: {
      url: string;
      filename: string;
    };
  }>;
  data?: any;
}

const ProductImageField: React.FC<ProductImageFieldProps> = ({ value, data }) => {
  // Get the image data from either the value or the data object
  const imageData = value || data?.imageGallery;
  
  if (!imageData || imageData.length === 0) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-200">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageData[0].image.url}
      alt={imageData[0].image.filename || 'Product image'}
      className="h-8 w-8 rounded object-contain border border-gray-200"
    />
  );
};

export default ProductImageField; 