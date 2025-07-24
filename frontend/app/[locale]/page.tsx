'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProductsWithAuth from '../ProductsWithAuth';
import ProductShowcase from '../components/ProductShowcase';

export default function Home(props: { params: { locale: string } }) {
  const { params } = props;
  const locale = params?.locale || 'bg';
  const t = useTranslations();
  
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
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

        const products = await response.json();
        // Show first 6 products as featured (you can modify this logic)
        setFeaturedProducts(products.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [locale]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {locale === 'bg' ? 'Добре дошли в SKY-R' : 'Welcome to SKY-R'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {locale === 'bg' 
              ? 'Вашият надежден партньор за качествени продукти'
              : 'Your trusted partner for quality products'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/products`}
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {locale === 'bg' ? 'Разглеждай продуктите' : 'Browse Products'}
            </a>
            <a
              href={`/${locale}/cart`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              {locale === 'bg' ? 'Виж поръчката' : 'View Cart'}
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      {!loading && featuredProducts.length > 0 && (
        <ProductShowcase 
          products={featuredProducts}
          locale={locale}
          title={locale === 'bg' ? 'Най-продавани продукти' : 'Best-selling Products'}
        />
      )}

      {/* All Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {locale === 'bg' ? 'Всички продукти' : 'All Products'}
          </h2>
          <ProductsWithAuth locale={locale} />
        </div>
      </section>
    </div>
  );
} 