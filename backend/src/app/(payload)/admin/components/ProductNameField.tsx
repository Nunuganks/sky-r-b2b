import React from 'react';

interface ProductNameFieldProps {
  value?: {
    en: string;
    bg: string;
  };
  data?: {
    sku: string;
    name: {
      en: string;
      bg: string;
    };
  };
}

const ProductNameField: React.FC<ProductNameFieldProps> = ({ value, data }) => {
  if (!value && !data?.name) {
    return <span className="text-gray-400">No name</span>;
  }

  const name = value || data?.name;
  const sku = data?.sku;

  return (
    <div className="space-y-1">
      <div className="font-medium text-gray-900 text-sm">{name?.en}</div>
      <div className="text-gray-500 text-xs">{name?.bg}</div>
      {sku && (
        <div className="text-gray-400 text-xs font-mono">{sku}</div>
      )}
    </div>
  );
};

export default ProductNameField; 