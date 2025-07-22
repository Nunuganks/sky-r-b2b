'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = `/${locale}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="bg-gray-100 text-gray-600 text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>+359 (0) 2 954 96 44</span>
            <span>+359 (0) 899 87 87 86</span>
            <span>order@sky-r.com</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href={`/${locale}/terms`} className="hover:text-primary transition">
              Общи условия
            </Link>
            <Link href={`/${locale}/gdpr`} className="hover:text-primary transition">
              GDPR
            </Link>
            <Link href={`/${locale}/delivery`} className="hover:text-primary transition">
              Доставка и плащане
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-primary transition">
              За нас
            </Link>
            <Link href={`/${locale}/contacts`} className="hover:text-primary transition">
              Контакти
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-xs">🇬🇧</span>
              <span className="text-xs">English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/${locale}`} className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  <span className="text-black">SKY</span>
                  <span className="text-red-500">-R</span>
                </div>
                <div className="text-xs text-gray-500 italic">Let your imagination fly</div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={locale === 'bg' ? 'Търсене' : 'Search'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* User and Cart Icons */}
            <div className="flex items-center space-x-6">
              {/* Account Icon */}
              <div className="flex flex-col items-center">
                {isLoggedIn ? (
                  <div className="relative group">
                    <button className="flex flex-col items-center">
                      <div className="w-6 h-6 text-gray-600 hover:text-primary transition">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{user?.firstName || 'Account'}</span>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                        <Link href={`/${locale}/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Profile
                        </Link>
                        <Link href={`/${locale}/orders`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/${locale}/login`} className="flex flex-col items-center">
                    <div className="w-6 h-6 text-gray-600 hover:text-primary transition">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">
                      {locale === 'bg' ? 'Вход' : 'Login'}
                    </span>
                  </Link>
                )}
              </div>

              {/* Cart Icon */}
              <div className="flex flex-col items-center">
                <Link href={`/${locale}/cart`} className="relative flex flex-col items-center">
                  <div className="w-6 h-6 text-gray-600 hover:text-primary transition">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </div>
                  )}
                  <span className="text-xs text-gray-600 mt-1">
                    {locale === 'bg' ? 'Поръчка' : 'Order'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 