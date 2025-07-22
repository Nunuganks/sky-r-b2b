import ProductsWithAuth from '../ProductsWithAuth';

export function generateStaticParams() {
  return [
    { locale: 'bg' },
    { locale: 'en' }
  ];
}

export default function Home(props: { params: { locale: string } }) {
  const { params } = props;
  const locale = params?.locale || 'bg';
  
  return <ProductsWithAuth locale={locale} />;
} 