'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CartPreviewProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CartPreview({ isVisible, onClose }: CartPreviewProps) {
  const params = useParams();
  const locale = params?.locale as string;
  const { state, removeFromCart, getCartTotal, getCartCount } = useCart();

  // Add a small delay to prevent flickering
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  if (!shouldShow || state.items.length === 0) {
    return null;
  }

  const getStockStatusText = (item: any) => {
    switch (item.stockStatus) {
      case 'available':
        return locale === 'bg' ? 'Наличен в склада' : 'Available in warehouse';
      case 'delivery':
        return locale === 'bg' 
          ? `Доставка от ${item.supplierName || 'европейски доставчик'} (${item.deliveryTime || '5-7 работни дни'})`
          : `Delivery from ${item.supplierName || 'European supplier'} (${item.deliveryTime || '5-7 working days'})`;
      case 'unavailable':
        return locale === 'bg' ? 'Не е наличен' : 'Out of stock';
      default:
        return '';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'delivery':
        return 'text-orange-600';
      case 'unavailable':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Invisible bridge to prevent gap */}
      <div 
        className="absolute top-0 right-0 w-80 h-2 bg-transparent"
        style={{ 
          opacity: shouldShow ? 1 : 0,
          pointerEvents: shouldShow ? 'auto' : 'none'
        }}
      />
      <div 
        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transform transition-all duration-200 ease-in-out opacity-0 scale-95"
        style={{ 
          opacity: shouldShow ? 1 : 0, 
          transform: shouldShow ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)' 
        }}
      >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {locale === 'bg' ? 'Моята поръчка' : 'My shopping cart'}, {getCartCount()} {locale === 'bg' ? 'артикула' : 'articles'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-64 overflow-y-auto">
        {state.items.slice(0, 5).map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start space-x-3">
              {/* Product Image */}
              {item.imageUrl && (
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={`http://127.0.0.1:3000${item.imageUrl}`}
                    alt={item.name?.[locale as keyof typeof item.name] || item.sku}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name?.[locale as keyof typeof item.name] || item.sku}
                </h4>
                <p className="text-xs text-gray-500 mb-1">SKU: {item.sku}</p>
                <p className={`text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
                  {getStockStatusText(item)}
                </p>
                
                {/* Quantity and Price */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-600">
                    {locale === 'bg' ? 'Количество:' : 'Quantity:'} {item.quantity}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {((item.discountedPrice || item.price) * item.quantity).toFixed(2)} лв.
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {state.items.length > 5 && (
          <div className="p-3 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {locale === 'bg' 
                ? `+${state.items.length - 5} още артикула` 
                : `+${state.items.length - 5} more items`
              }
            </p>
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">
            {locale === 'bg' ? 'Междинна сума:' : 'Products subtotal:'}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {getCartTotal().toFixed(2)} лв.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            href={`/${locale}/cart`}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition text-center"
          >
            {locale === 'bg' ? 'Виж поръчката' : 'See shopping cart'}
          </Link>
          <Link
            href={`/${locale}/checkout`}
            className="flex-1 bg-black text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition text-center"
          >
            {locale === 'bg' ? 'Към плащане' : 'Go to checkout'}
          </Link>
        </div>
      </div>
    </div>
    </>
  );
} 