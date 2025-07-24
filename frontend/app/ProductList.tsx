'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AddToCartButton from './components/AddToCartButton';
import StockDisplay from './components/StockDisplay';

export default function ProductList({ products: initialProducts, locale }: { products: any[]; locale: string }) {
  const t = useTranslations();
  const pathname = usePathname();
  const otherLocale = locale === 'bg' ? 'en' : 'bg';
  const toggleHref = `/${otherLocale}${pathname.slice(3)}`;
  
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    const fetchProducts = async () => {
      if (initialProducts.length > 0) {
        setProducts(initialProducts);
        return;
      }

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
          return;
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialProducts, locale]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('welcome')}</p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('products')}</h2>
        <Link 
          href={toggleHref} 
          prefetch={false} 
          locale={otherLocale}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {otherLocale === 'bg' ? 'Български' : 'English'}
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
        {products.map((p: any) => (
          <div key={p.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {p.imageGallery?.[0]?.image?.url && (
              <div className="aspect-square overflow-hidden">
                <img
                  src={`http://127.0.0.1:3000${p.imageGallery[0].image.url}`}
                  alt={p.imageGallery[0].image.alt || p.name?.[locale] || p.sku}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {p.name?.[locale] || p.sku}
              </h3>
              {p.description?.[locale] && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {p.description[locale]}
                </p>
              )}
                               <div className="space-y-1">
                   <p className="text-gray-500 text-sm">Price: {p.price?.toFixed(2)} лв.</p>
                   {p.discountedPrice !== undefined && (
                     <p className="text-primary font-semibold">Your price: {p.discountedPrice.toFixed(2)} лв.</p>
                   )}
                 </div>
                 
                 {/* Stock Display */}
                 <div className="mt-4">
                   <StockDisplay 
                     ownStock={p.ownStock || 0}
                     deliveryStock={p.deliveryStock || 0}
                     deliveryTime={p.deliveryTime || '2-3'}
                     locale={locale}
                   />
                 </div>
                 
                 {/* Add to Cart Button */}
                 <div className="mt-4">
                   <AddToCartButton product={p} locale={locale} />
                 </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 