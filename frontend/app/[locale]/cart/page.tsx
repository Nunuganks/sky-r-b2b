'use client';
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string;
  const { state, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

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

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {locale === 'bg' ? 'Вашата поръчка е празна' : 'Your cart is empty'}
          </h1>
          <p className="text-gray-600 mb-6">
            {locale === 'bg' 
              ? 'Добавете продукти към вашата поръчка, за да продължите.'
              : 'Add products to your cart to continue.'
            }
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            {locale === 'bg' ? 'Разглеждане на продукти' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'bg' ? 'Вашата поръчка' : 'Your Cart'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {locale === 'bg' ? 'Продукти' : 'Products'} ({getCartCount()})
              </h2>
              
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    {item.imageUrl && (
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={`http://127.0.0.1:3000${item.imageUrl}`}
                          alt={item.name?.[locale as keyof typeof item.name] || item.sku}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.name?.[locale as keyof typeof item.name] || item.sku}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">SKU: {item.sku}</p>
                      <p className={`text-sm font-medium ${getStockStatusColor(item.stockStatus)}`}>
                        {getStockStatusText(item)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {((item.discountedPrice || item.price) * item.quantity).toFixed(2)} лв.
                      </p>
                      {item.discountedPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {(item.price * item.quantity).toFixed(2)} лв.
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Clear Cart Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  {locale === 'bg' ? 'Изчисти поръчката' : 'Clear Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'bg' ? 'Обобщение на поръчката' : 'Order Summary'}
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'bg' ? 'Междинна сума' : 'Subtotal'}
                </span>
                <span className="font-medium">{getCartTotal().toFixed(2)} лв.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === 'bg' ? 'Доставка' : 'Shipping'}
                </span>
                <span className="font-medium">
                  {locale === 'bg' ? 'Безплатно' : 'Free'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">
                    {locale === 'bg' ? 'Общо' : 'Total'}
                  </span>
                  <span className="text-lg font-semibold text-primary">
                    {getCartTotal().toFixed(2)} лв.
                  </span>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-medium"
            >
              {locale === 'bg' ? 'Продължи към плащане' : 'Proceed to Checkout'}
            </button>

            <div className="mt-4 text-center">
              <Link
                href={`/${locale}`}
                className="text-primary hover:text-primary/80 text-sm"
              >
                {locale === 'bg' ? '← Продължи с пазаруването' : '← Continue Shopping'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'bg' ? 'Потвърди изчистване' : 'Confirm Clear Cart'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'bg' 
                ? 'Сигурни ли сте, че искате да изчистите всички продукти от поръчката?'
                : 'Are you sure you want to clear all items from your cart?'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearCart}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
              >
                {locale === 'bg' ? 'Да, изчисти' : 'Yes, Clear'}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
              >
                {locale === 'bg' ? 'Отказ' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 