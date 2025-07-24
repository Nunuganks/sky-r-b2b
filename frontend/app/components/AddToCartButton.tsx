'use client';
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useTranslations } from 'next-intl';
import Notification from './Notification';

interface AddToCartButtonProps {
  product: any;
  locale: string;
}

export default function AddToCartButton({ product, locale }: AddToCartButtonProps) {
  // Calculate max quantity based on available stock
  const totalAvailableStock = (product.ownStock || 0) + (product.deliveryStock || 0);
  
  // Update max quantity when component mounts or product changes
  React.useEffect(() => {
    setMaxQuantity(totalAvailableStock);
  }, [product, totalAvailableStock]);
  const t = useTranslations();
  const { addToCart, addStockAlert } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showStockAlertModal, setShowStockAlertModal] = useState(false);
  const [stockAlertEmail, setStockAlertEmail] = useState('');
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockData, setStockData] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Check stock availability first
      const response = await fetch('/api/stock-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sku: product.sku,
          locale,
          quantity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check stock availability');
      }

      const stockData = await response.json();
      
      if (stockData.status === 'available') {
        // Add to cart immediately
        await addToCart(product, quantity);
        setNotification({
          message: locale === 'bg' 
            ? 'Продуктът е добавен в поръчката!' 
            : 'Product added to cart!',
          type: 'success',
          isVisible: true,
        });
      } else if (stockData.status === 'partial') {
        // Show partial stock confirmation modal
        setStockData(stockData);
        setShowDeliveryModal(true);
      } else if (stockData.status === 'delivery' && stockData.requiresConfirmation) {
        // Show delivery confirmation modal
        setStockData(stockData);
        setShowDeliveryModal(true);
      } else if (stockData.status === 'insufficient') {
        // Show insufficient stock error
        setNotification({
          message: locale === 'bg' 
            ? `Налични са само ${stockData.availableQuantity} бр.`
            : `Only ${stockData.availableQuantity} pcs. available`,
          type: 'error',
          isVisible: true,
        });
      } else if (stockData.status === 'unavailable') {
        // Show stock alert modal
        setShowStockAlertModal(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        message: locale === 'bg' 
          ? 'Грешка при проверка на наличността!'
          : 'Error checking stock availability!',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryConfirmation = async () => {
    setLoading(true);
    try {
      await addToCart(product, quantity);
      setShowDeliveryModal(false);
      setNotification({
        message: locale === 'bg' 
          ? 'Продуктът е добавен в поръчката с доставка!' 
          : 'Product added to cart with delivery!',
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAlert = async () => {
    if (!stockAlertEmail) return;
    
    setStockAlertLoading(true);
    try {
      await addStockAlert(product, stockAlertEmail);
      setShowStockAlertModal(false);
      setStockAlertEmail('');
      setNotification({
        message: locale === 'bg' 
          ? 'Предупреждението за наличност е създадено!' 
          : 'Stock alert created successfully!',
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      console.error('Error adding stock alert:', error);
      setNotification({
        message: locale === 'bg' 
          ? 'Грешка при създаване на предупреждение!' 
          : 'Error creating stock alert!',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setStockAlertLoading(false);
    }
  };

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
      
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const newQuantity = Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1));
                setQuantity(newQuantity);
              }}
              className="w-16 text-center border-none focus:outline-none"
            />
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          {maxQuantity > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'bg' ? 'Макс. наличност:' : 'Max available:'} {maxQuantity}
            </p>
          )}
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={loading || maxQuantity === 0}
          className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {locale === 'bg' ? 'Добавяне...' : 'Adding...'}
            </span>
          ) : maxQuantity === 0 ? (
            locale === 'bg' ? 'Не е наличен' : 'Out of Stock'
          ) : (
            locale === 'bg' ? 'Добави в поръчката' : 'Add to Cart'
          )}
        </button>
      </div>

      {/* Delivery Confirmation Modal - Screen Lock */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-6 py-4 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="text-xl font-bold">
                {locale === 'bg' ? 'Внимание!' : 'Attention!'}
              </h3>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-800 text-lg leading-relaxed mb-6">
                {stockData?.status === 'partial' 
                  ? (locale === 'bg' 
                      ? `Налични са само ${stockData.ownStock} бр. на склад. Остатъкът от ${stockData.missingQuantity} бр. ще бъде доставен. Потвърдете, че ще изчакате доставката.`
                      : `Only ${stockData.ownStock} pcs. available in warehouse. The remaining ${stockData.missingQuantity} pcs. will be delivered. Confirm that you will wait for delivery.`
                    )
                  : (locale === 'bg' 
                      ? 'Стоката, която добавяте, не е налична на склад в София! Потвърдете, че ще изчакате доставката в посочения период.'
                      : 'The item you are adding is not available in stock in Sofia! Confirm that you will wait for delivery within the specified period.'
                    )
                }
              </p>
              
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  {product.imageGallery?.[0]?.image?.url && (
                    <img
                      src={`http://127.0.0.1:3000${product.imageGallery[0].image.url}`}
                      alt={product.name?.[locale as keyof typeof product.name] || product.sku}
                      className="w-16 h-16 object-contain rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {product.name?.[locale as keyof typeof product.name] || product.sku}
                    </h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">
                      {locale === 'bg' ? 'Доставка' : 'Delivery'}: 2-3 {locale === 'bg' ? 'работни дни' : 'working days'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  {locale === 'bg' ? 'Отказвам' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeliveryConfirmation}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {locale === 'bg' ? 'Добавяне...' : 'Adding...'}
                    </span>
                  ) : (
                    locale === 'bg' ? 'Потвърждавам' : 'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alert Modal - Screen Lock */}
      {showStockAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-orange-600 text-white px-6 py-4 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-bold">
                {locale === 'bg' ? 'Продуктът не е наличен' : 'Product Not Available'}
              </h3>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-800 text-lg leading-relaxed mb-6">
                {locale === 'bg'
                  ? 'Този продукт в момента не е наличен. Въведете вашия имейл, за да получите известие, когато продуктът стане наличен.'
                  : 'This product is currently out of stock. Enter your email to be notified when the product becomes available.'
                }
              </p>
              
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  {product.imageGallery?.[0]?.image?.url && (
                    <img
                      src={`http://127.0.0.1:3000${product.imageGallery[0].image.url}`}
                      alt={product.name?.[locale as keyof typeof product.name] || product.sku}
                      className="w-16 h-16 object-contain rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {product.name?.[locale as keyof typeof product.name] || product.sku}
                    </h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm text-red-600 font-medium">
                      {locale === 'bg' ? 'Не е наличен' : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'bg' ? 'Вашият имейл' : 'Your email'}
                </label>
                <input
                  type="email"
                  value={stockAlertEmail}
                  onChange={(e) => setStockAlertEmail(e.target.value)}
                  placeholder={locale === 'bg' ? 'example@email.com' : 'example@email.com'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowStockAlertModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  {locale === 'bg' ? 'Отказвам' : 'Cancel'}
                </button>
                <button
                  onClick={handleStockAlert}
                  disabled={stockAlertLoading || !stockAlertEmail}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stockAlertLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {locale === 'bg' ? 'Добавяне...' : 'Adding...'}
                    </span>
                  ) : (
                    locale === 'bg' ? 'Добави предупреждение' : 'Add Alert'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 