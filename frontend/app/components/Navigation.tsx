'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import CartPreview from './CartPreview';

type CountryFlagProps = {
  countryCode: string; // e.g., 'us', 'bg', 'de'
  size?: number;
};

const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, size = 16 }) => {
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      alt={`Flag of ${countryCode}`}
      width={size}
      height={size}
      className="rounded-sm"
    />
  );
};

export default function Navigation() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [cartPreviewTimeout, setCartPreviewTimeout] = useState<NodeJS.Timeout | null>(null);
  const { getCartCount } = useCart();

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
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="tel:+359029549644" 
              className="hover:text-primary transition-colors"
              title="Call us"
            >
              +359 (0) 2 954 96 44
            </a>
            <a 
              href="tel:+359899878786" 
              className="hover:text-primary transition-colors"
              title="Call us"
            >
              +359 (0) 899 87 87 86
            </a>
            <a 
              href="mailto:order@sky-r.com" 
              className="hover:text-primary transition-colors"
              title="Send us an email"
            >
              order@sky-r.com
            </a>
          </div>
          <div className="flex items-center space-x-6">
            {/* Nav links - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6">
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
            </div>
            {/* Language toggle - always visible */}
            <Link 
              href={locale === 'bg' ? '/en' : '/bg'} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <CountryFlag countryCode={locale === 'bg' ? 'gb' : 'bg'} size={16} />
              <span className="text-sm font-medium">
                {locale === 'bg' ? 'English' : 'Български'}
              </span>
            </Link>
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
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
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

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  // TODO: Implement mobile search modal or expand search bar
                  console.log('Mobile search clicked');
                }}
                className="p-2 text-gray-600 hover:text-primary transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* User and Cart Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
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
              <div 
                className="flex flex-col items-center relative"
                onMouseEnter={() => {
                  if (cartPreviewTimeout) clearTimeout(cartPreviewTimeout);
                  setShowCartPreview(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => setShowCartPreview(false), 300);
                  setCartPreviewTimeout(timeout);
                }}
              >
                <div 
                  className="relative flex flex-col items-center cursor-pointer"
                  onClick={() => router.push(`/${locale}/cart`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/${locale}/cart`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={locale === 'bg' ? 'Поръчка' : 'Cart'}
                >
                  <div className="w-6 h-6 text-gray-600 hover:text-primary transition">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                    </svg>
                  </div>
                  {getCartCount() > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartCount()}
                    </div>
                  )}
                  <span className="text-xs text-gray-600 mt-1">
                    {locale === 'bg' ? 'Поръчка' : 'Order'}
                  </span>
                </div>
                
                {/* Cart Preview */}
                <CartPreview 
                  isVisible={showCartPreview} 
                  onClose={() => setShowCartPreview(false)} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 