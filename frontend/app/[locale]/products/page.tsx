'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import ProductList from '../../ProductList';

export default function ProductsPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {locale === 'bg' ? 'Всички продукти' : 'All Products'}
        </h1>
        <p className="text-gray-600 text-lg">
          {locale === 'bg' 
            ? 'Разгледайте нашия пълен каталог с качествени продукти'
            : 'Browse our complete catalog of quality products'
          }
        </p>
      </div>

      {/* Products List */}
      <ProductList products={[]} locale={locale} />
    </div>
  );
} 