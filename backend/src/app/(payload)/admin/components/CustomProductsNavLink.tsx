import React from 'react';

const CustomProductsNavLink: React.FC = () => {
  return (
    <a
      className="nav__link"
      href="/admin/compact-product-edit"
      style={{ display: 'block', padding: '0.5rem 1rem', color: '#374151', textDecoration: 'none' }}
    >
      Products
    </a>
  );
};

export default CustomProductsNavLink; 