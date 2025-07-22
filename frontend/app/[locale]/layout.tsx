import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';
import Navigation from '../components/Navigation';

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
          <Navigation />
          <main>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 