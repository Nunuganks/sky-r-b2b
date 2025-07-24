import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import Navigation from '../components/Navigation';
import { CartProvider } from '../contexts/CartContext';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  let messages;
  try {
    messages = require(`../../messages/${locale}.json`);
  } catch (error) {
    messages = require('../../messages/bg.json');
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <Navigation />
            <main>
              {children}
            </main>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 