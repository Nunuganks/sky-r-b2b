'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import AddToCartButton from './AddToCartButton';
import StockDisplay from './StockDisplay';

interface ProductShowcaseProps {
  products: any[];
  locale: string;
  title?: string;
  showViewMore?: boolean;
}

export default function ProductShowcase({ 
  products, 
  locale, 
  title = 'Най-продавани продукти',
  showViewMore = true 
}: ProductShowcaseProps) {
  const t = useTranslations();

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {title}
          </h2>
          {showViewMore && (
            <Link
              href={`/${locale}/products`}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {locale === 'bg' ? 'Виж още продукти' : 'View more products'}
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <Link href={`/${locale}/product/${product.sku}`}>
                <div className="aspect-square overflow-hidden">
                  {product.imageGallery?.[0]?.image?.url ? (
                    <img
                      src={`http://127.0.0.1:3000${product.imageGallery[0].image.url}`}
                      alt={product.name?.[locale as keyof typeof product.name] || product.sku}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                {/* Product Name */}
                <Link href={`/${locale}/product/${product.sku}`}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {product.name?.[locale as keyof typeof product.name] || product.sku}
                  </h3>
                </Link>

                {/* Product Code */}
                <p className="text-xs text-gray-500 mb-2">
                  {locale === 'bg' ? 'Код' : 'Code'}: {product.sku}
                </p>

                {/* Pricing */}
                <div className="mb-3">
                  <p className="text-gray-500 text-sm">
                    {locale === 'bg' ? 'Цена' : 'Price'}: {product.price?.toFixed(2)} лв.
                  </p>
                  {product.discountedPrice !== undefined && (
                    <p className="text-primary font-semibold text-sm">
                      {locale === 'bg' ? 'Ваша цена' : 'Your price'}: {product.discountedPrice.toFixed(2)} лв.
                    </p>
                  )}
                </div>

                {/* Stock Information - Compact Version */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {locale === 'bg' ? 'На склад в София:' : 'In stock in Sofia:'}
                    </span>
                    <span className={`font-medium ${(product.ownStock || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {(product.ownStock || 0)} {locale === 'bg' ? 'бр.' : 'pcs.'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {locale === 'bg' ? 'Доставка 2-3 р. дни:' : 'Delivery 2-3 working days:'}
                    </span>
                    <span className={`font-medium ${(product.deliveryStock || 0) > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {(product.deliveryStock || 0)} {locale === 'bg' ? 'бр.' : 'pcs.'}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="mt-auto">
                  <AddToCartButton product={product} locale={locale} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'bg' ? 'Няма налични продукти' : 'No products available'}
            </h3>
            <p className="text-gray-600">
              {locale === 'bg' 
                ? 'В момента няма продукти за показване.'
                : 'There are currently no products to display.'
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 