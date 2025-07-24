'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import StockDisplay from '../../../components/StockDisplay';

export default function ProductDetailPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const sku = params?.sku as string;
  const t = useTranslations();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/products-pricing', {
          headers,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const products = await response.json();
        const foundProduct = products.find((p: any) => p.sku === sku);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (sku) {
      fetchProduct();
    }
  }, [sku]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {locale === 'bg' ? 'Продуктът не е намерен' : 'Product not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {locale === 'bg' 
              ? 'Продуктът, който търсите, не съществува или е премахнат.'
              : 'The product you are looking for does not exist or has been removed.'
            }
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            {locale === 'bg' ? '← Обратно към продуктите' : '← Back to Products'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href={`/${locale}`} className="hover:text-primary">
              {locale === 'bg' ? 'Начало' : 'Home'}
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href={`/${locale}/products`} className="hover:text-primary">
              {locale === 'bg' ? 'Продукти' : 'Products'}
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">
            {product.name?.[locale as keyof typeof product.name] || product.sku}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden">
            {product.imageGallery?.[selectedImage]?.image?.url ? (
              <img
                src={`http://127.0.0.1:3000${product.imageGallery[selectedImage].image.url}`}
                alt={product.name?.[locale as keyof typeof product.name] || product.sku}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.imageGallery && product.imageGallery.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.imageGallery.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`http://127.0.0.1:3000${image.image.url}`}
                    alt={`${product.name?.[locale as keyof typeof product.name] || product.sku} - ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Product Name and SKU */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name?.[locale as keyof typeof product.name] || product.sku}
            </h1>
            <p className="text-gray-500">
              {locale === 'bg' ? 'Код' : 'Code'}: {product.sku}
            </p>
          </div>

          {/* Description */}
          {product.description?.[locale] && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'bg' ? 'Описание' : 'Description'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description[locale]}
              </p>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-2">
              <p className="text-gray-500">
                {locale === 'bg' ? 'Цена' : 'Price'}: {product.price?.toFixed(2)} лв.
              </p>
              {product.discountedPrice !== undefined && (
                <p className="text-2xl font-bold text-primary">
                  {locale === 'bg' ? 'Ваша цена' : 'Your price'}: {product.discountedPrice.toFixed(2)} лв.
                </p>
              )}
            </div>
          </div>

          {/* Stock Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'bg' ? 'Наличност' : 'Availability'}
            </h3>
            <StockDisplay 
              ownStock={product.ownStock || 0}
              deliveryStock={product.deliveryStock || 0}
              deliveryTime={product.deliveryTime || '2-3'}
              locale={locale}
            />
          </div>

          {/* Add to Cart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'bg' ? 'Добави в поръчката' : 'Add to Cart'}
            </h3>
            <AddToCartButton product={product} locale={locale} />
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'bg' ? 'Детайли за продукта' : 'Product Details'}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{locale === 'bg' ? 'Категория' : 'Category'}:</span>
                <span>{product.categories?.[0]?.name?.[locale] || locale === 'bg' ? 'Не е зададена' : 'Not specified'}</span>
              </div>
              {product.supplierName && (
                <div className="flex justify-between">
                  <span>{locale === 'bg' ? 'Доставчик' : 'Supplier'}:</span>
                  <span>{product.supplierName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{locale === 'bg' ? 'Последна актуализация' : 'Last updated'}:</span>
                <span>{product.syncUpdatedAt ? new Date(product.syncUpdatedAt).toLocaleDateString() : locale === 'bg' ? 'Не е зададена' : 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 