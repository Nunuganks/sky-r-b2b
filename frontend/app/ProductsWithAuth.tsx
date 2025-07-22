'use client';
import { useEffect, useState } from 'react';
import ProductList from './ProductList';

export default function ProductsWithAuth({ locale }: { locale: string }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

           useEffect(() => {
           const fetchProducts = async () => {
             try {
               const token = localStorage.getItem('token');
               const headers: HeadersInit = {
                 'Content-Type': 'application/json',
               };
               
               if (token) {
                 headers['Authorization'] = `Bearer ${token}`;
               }

               const res = await fetch('/api/products-pricing', {
                 headers,
                 cache: 'no-store'
               });

               if (!res.ok) {
                 return;
               }

               const data = await res.json();
               setProducts(data);
             } catch (err) {
               console.error('Products fetch error:', err);
             } finally {
               setLoading(false);
             }
           };

           fetchProducts();
         }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <ProductList products={products} locale={locale} />;
} 