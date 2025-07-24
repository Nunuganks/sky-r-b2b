'use client';
import React from 'react';

interface StockDisplayProps {
  ownStock: number;
  deliveryStock: number;
  deliveryTime?: string;
  locale: string;
}

export default function StockDisplay({ 
  ownStock, 
  deliveryStock, 
  deliveryTime = '2-3', 
  locale 
}: StockDisplayProps) {
  const formatQuantity = (quantity: number) => {
    return `${quantity} ${locale === 'bg' ? 'бр.' : 'pcs.'}`;
  };

  const getDeliveryText = () => {
    if (locale === 'bg') {
      return `Доставка ${deliveryTime} р. дни:`;
    }
    return `Delivery ${deliveryTime} working days:`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-3">
        {locale === 'bg' ? 'Наличност на стоката:' : 'Product Availability:'}
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Sofia Warehouse Stock */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700">
            {locale === 'bg' ? 'На склад в София:' : 'In stock in Sofia:'}
          </span>
          <span className={`font-medium ${ownStock > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {formatQuantity(ownStock)}
          </span>
        </div>

        {/* Delivery Stock */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700">
            {getDeliveryText()}
          </span>
          <span className={`font-medium ${deliveryStock > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            {formatQuantity(deliveryStock)}
          </span>
        </div>
      </div>

      {/* Stock Status Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {ownStock > 0 && (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {locale === 'bg' 
              ? `${ownStock} бр. налични на склад`
              : `${ownStock} pcs. available in warehouse`
            }
          </div>
        )}
        
        {deliveryStock > 0 && (
          <div className="flex items-center text-orange-600 text-sm mt-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {locale === 'bg' 
              ? `${deliveryStock} бр. за доставка ${deliveryTime} р. дни`
              : `${deliveryStock} pcs. for delivery ${deliveryTime} working days`
            }
          </div>
        )}

        {ownStock === 0 && deliveryStock === 0 && (
          <div className="flex items-center text-red-600 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {locale === 'bg' ? 'Не е наличен' : 'Out of stock'}
          </div>
        )}
      </div>
    </div>
  );
} 