'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  sku: string;
  name: {
    en: string;
    bg: string;
  };
  description?: {
    en: string;
    bg: string;
  };
  price: number;
  ownStock?: number;
  deliveryStock?: number;
  deliveryTime?: string;
  supplierName?: string;
  categories?: any[];
  published: boolean;
  brandingOptions?: boolean;
  imageGallery?: Array<{
    image: {
      url: string;
      filename: string;
    };
  }>;
  updatedAt?: string;
  createdAt?: string;
  syncUpdatedAt?: string;
}

export default function CompactProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    sku: true,
    price: true,
    ownStock: true,
    deliveryStock: true,
    published: true,
    nameBg: true,
    mainImage: true,
    actions: true,
    // Additional fields from original Payload CMS
    id: false,
    nameEn: false,
    descriptionEn: false,
    descriptionBg: false,
    deliveryTime: false,
    supplierName: false,
    categories: false,
    imageGallery: false,
    brandingOptions: false,
    updatedAt: false,
    createdAt: false,
    syncUpdatedAt: false
  });
  const [filters, setFilters] = useState({
    publishedStatus: '',
    stockLevel: '',
    priceMin: '',
    priceMax: ''
  });

  // Refs for dropdown menus
  const columnsDropdownRef = useRef<HTMLDivElement>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.docs || data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle clicks outside dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setShowColumns(false);
      }
      if (filtersDropdownRef.current && !filtersDropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.bg.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Published status filter
    if (filters.publishedStatus && filters.publishedStatus !== '') {
      if (filters.publishedStatus === 'true' && !product.published) return false;
      if (filters.publishedStatus === 'false' && product.published) return false;
    }
    
    // Stock level filter
    if (filters.stockLevel && filters.stockLevel !== '') {
      const ownStock = product.ownStock || 0;
      const deliveryStock = product.deliveryStock || 0;
      const totalStock = ownStock + deliveryStock;
      
      if (filters.stockLevel === 'in-stock' && totalStock <= 0) return false;
      if (filters.stockLevel === 'low-stock' && totalStock > 10) return false;
      if (filters.stockLevel === 'out-of-stock' && totalStock > 0) return false;
    }
    
    // Price range filter
    if (filters.priceMin && product.price < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax && product.price > parseFloat(filters.priceMax)) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="payload-admin-layout">
        <div className="payload-content">
          <div className="payload-loading">
            <div className="payload-loading__spinner"></div>
            <p className="payload-loading__text">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payload-admin-layout">
      {/* Sidebar */}
      <aside className="nav nav--nav-open nav--nav-animate nav--nav-hydrated">
        <div className="nav__scroll" style={{ overscrollBehavior: 'auto' }}>
          <nav className="nav__wrap">
            <div className="nav-group Collections" id="nav-group-Collections">
              <button className="nav-group__toggle nav-group__toggle--open" tabIndex={0} type="button">
                <div className="nav-group__label">Collections</div>
                <div className="nav-group__indicator">
                  <svg className="icon icon--chevron nav-group__indicator" height="100%" style={{ transform: 'rotate(180deg)' }} viewBox="0 0 20 20" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <path className="stroke" d="M14 8L10 12L6 8" strokeLinecap="square"></path>
                  </svg>
                </div>
              </button>
              <div aria-hidden="false" className="rah-static rah-static--height-auto" style={{ transition: 'height 0ms ease' }}>
                <div>
                  <div className="nav-group__content">
                    <a className="nav__link" id="nav-users" href="/admin/collections/users">
                      <span className="nav__link-label">Users</span>
                    </a>
                    <a className="nav__link" id="nav-media" href="/admin/collections/media">
                      <span className="nav__link-label">Media</span>
                    </a>
                    <a className="nav__link nav__link--active" id="nav-products" href="/admin/collections/products">
                      <span className="nav__link-label">Products</span>
                    </a>
                    <a className="nav__link" id="nav-categories" href="/admin/collections/categories">
                      <span className="nav__link-label">Categories</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="nav__controls">
              <a aria-label="Log out" className="nav__log-out" tabIndex={0} title="Log out" href="/admin/logout">
                <svg className="icon icon--logout" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path className="stroke" d="M12 16H14.6667C15.0203 16 15.3594 15.8595 15.6095 15.6095C15.8595 15.3594 16 15.0203 16 14.6667V5.33333C16 4.97971 15.8595 4.64057 15.6095 4.39052C15.3594 4.14048 15.0203 4 14.6667 4H12M7.33333 13.3333L4 10M4 10L7.33333 6.66667M4 10H12" strokeLinecap="square"></path>
                </svg>
              </a>
            </div>
          </nav>
          <div className="nav__header">
            <div className="nav__header-content">
              <button className="nav__mobile-close" type="button">
                <div className="hamburger">
                  <div aria-label="Close" className="hamburger__close-icon" title="Close">
                    <svg className="icon icon--close-menu" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path className="stroke" d="M14 6L6 14M6 6L14 14" strokeLinecap="square"></path>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="payload-content">
        {/* Header */}
        <div className="payload-header">
          <div className="payload-header__content">
            <div className="payload-header__breadcrumbs">
              <div className="payload-breadcrumb">
                <svg className="payload-breadcrumb__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="payload-breadcrumb__text">/ Products</span>
              </div>
            </div>
            <div className="payload-header__actions">
              <button
                onClick={() => router.push('/admin/collections/products')}
                className="payload-button payload-button--style-secondary"
              >
                Standard Admin
              </button>
              <button
                onClick={() => router.push('/admin/compact-product-edit')}
                className="payload-button payload-button--style-primary"
              >
                Compact Gallery Editor
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="payload-page">
          {/* Page Header */}
          <div className="payload-page__header">
            <div className="payload-page__title">
              <h1 className="payload-page__title-text">Products</h1>
              <p className="payload-page__title-subtitle">Compact Gallery Editor</p>
            </div>
            <div className="payload-page__actions">
              <button
                onClick={() => router.push('/admin/collections/products/create')}
                className="payload-button payload-button--style-primary"
              >
                Create New
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="payload-filters">
            <div className="payload-filters__content">
              <div className="payload-filters__search">
                <div className="payload-search">
                  <div className="payload-search__icon">
                    <svg className="payload-search__icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Sku"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="payload-search__input"
                  />
                </div>
              </div>
              <div className="payload-filters__actions">
                <div className="payload-dropdown" ref={columnsDropdownRef}>
                  <button 
                    className="payload-button payload-button--style-secondary"
                    onClick={() => setShowColumns(!showColumns)}
                  >
                    Columns
                  </button>
                  {showColumns && (
                    <div className="payload-dropdown__menu payload-columns-menu">
                      <div className="payload-columns-grid">
                        {/* Currently visible columns */}
                        <div className="payload-columns-section">
                          <h4 className="payload-columns-section-title">Visible Columns</h4>
                          <div className="payload-columns-buttons">
                            {visibleColumns.id && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, id: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                ID
                              </button>
                            )}
                            {visibleColumns.sku && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, sku: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Sku
                              </button>
                            )}
                            {visibleColumns.nameEn && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, nameEn: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Name {'>'} En
                              </button>
                            )}
                            {visibleColumns.nameBg && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, nameBg: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Name {'>'} Bg
                              </button>
                            )}
                            {visibleColumns.descriptionEn && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, descriptionEn: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Description {'>'} En
                              </button>
                            )}
                            {visibleColumns.descriptionBg && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, descriptionBg: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Description {'>'} Bg
                              </button>
                            )}
                            {visibleColumns.price && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, price: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Price
                              </button>
                            )}
                            {visibleColumns.ownStock && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, ownStock: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Own Stock
                              </button>
                            )}
                            {visibleColumns.deliveryStock && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, deliveryStock: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Delivery Stock
                              </button>
                            )}
                            {visibleColumns.deliveryTime && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, deliveryTime: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Delivery Time
                              </button>
                            )}
                            {visibleColumns.supplierName && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, supplierName: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Supplier Name
                              </button>
                            )}
                            {visibleColumns.categories && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, categories: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Categories
                              </button>
                            )}
                            {visibleColumns.imageGallery && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, imageGallery: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Image Gallery
                              </button>
                            )}
                            {visibleColumns.brandingOptions && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, brandingOptions: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Branding Options
                              </button>
                            )}
                            {visibleColumns.published && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, published: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Published
                              </button>
                            )}
                            {visibleColumns.mainImage && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, mainImage: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Main Image
                              </button>
                            )}
                            {visibleColumns.updatedAt && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, updatedAt: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Updated At
                              </button>
                            )}
                            {visibleColumns.createdAt && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, createdAt: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Created At
                              </button>
                            )}
                            {visibleColumns.syncUpdatedAt && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, syncUpdatedAt: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Sync Updated At
                              </button>
                            )}
                            {visibleColumns.actions && (
                              <button 
                                className="payload-column-button payload-column-button--active"
                                onClick={() => setVisibleColumns({ ...visibleColumns, actions: false })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Actions
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Available columns to add */}
                        <div className="payload-columns-section">
                          <h4 className="payload-columns-section-title">Available Columns</h4>
                          <div className="payload-columns-buttons">
                            {!visibleColumns.id && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, id: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                ID
                              </button>
                            )}
                            {!visibleColumns.sku && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, sku: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Sku
                              </button>
                            )}
                            {!visibleColumns.nameEn && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, nameEn: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Name {'>'} En
                              </button>
                            )}
                            {!visibleColumns.nameBg && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, nameBg: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Name {'>'} Bg
                              </button>
                            )}
                            {!visibleColumns.descriptionEn && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, descriptionEn: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Description {'>'} En
                              </button>
                            )}
                            {!visibleColumns.descriptionBg && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, descriptionBg: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Description {'>'} Bg
                              </button>
                            )}
                            {!visibleColumns.price && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, price: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Price
                              </button>
                            )}
                            {!visibleColumns.ownStock && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, ownStock: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Own Stock
                              </button>
                            )}
                            {!visibleColumns.deliveryStock && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, deliveryStock: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Delivery Stock
                              </button>
                            )}
                            {!visibleColumns.deliveryTime && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, deliveryTime: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Delivery Time
                              </button>
                            )}
                            {!visibleColumns.supplierName && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, supplierName: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Supplier Name
                              </button>
                            )}
                            {!visibleColumns.categories && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, categories: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Categories
                              </button>
                            )}
                            {!visibleColumns.imageGallery && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, imageGallery: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Image Gallery
                              </button>
                            )}
                            {!visibleColumns.brandingOptions && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, brandingOptions: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Branding Options
                              </button>
                            )}
                            {!visibleColumns.published && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, published: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Published
                              </button>
                            )}
                            {!visibleColumns.mainImage && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, mainImage: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Main Image
                              </button>
                            )}
                            {!visibleColumns.updatedAt && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, updatedAt: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Updated At
                              </button>
                            )}
                            {!visibleColumns.createdAt && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, createdAt: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Created At
                              </button>
                            )}
                            {!visibleColumns.syncUpdatedAt && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, syncUpdatedAt: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Sync Updated At
                              </button>
                            )}
                            {!visibleColumns.actions && (
                              <button 
                                className="payload-column-button"
                                onClick={() => setVisibleColumns({ ...visibleColumns, actions: true })}
                              >
                                <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Actions
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="payload-dropdown" ref={filtersDropdownRef}>
                  <button 
                    className="payload-button payload-button--style-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </button>
                  {showFilters && (
                    <div className="payload-dropdown__menu">
                      <div className="payload-dropdown__item">
                        <label className="payload-dropdown__label">Published Status</label>
                        <select 
                          className="payload-select"
                          value={filters.publishedStatus}
                          onChange={(e) => setFilters({ ...filters, publishedStatus: e.target.value })}
                        >
                          <option value="">All</option>
                          <option value="true">Published</option>
                          <option value="false">Unpublished</option>
                        </select>
                      </div>
                      <div className="payload-dropdown__item">
                        <label className="payload-dropdown__label">Stock Level</label>
                        <select 
                          className="payload-select"
                          value={filters.stockLevel}
                          onChange={(e) => setFilters({ ...filters, stockLevel: e.target.value })}
                        >
                          <option value="">All</option>
                          <option value="in-stock">In Stock</option>
                          <option value="low-stock">Low Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                      <div className="payload-dropdown__item">
                        <label className="payload-dropdown__label">Price Range</label>
                        <div className="payload-range">
                          <input 
                            type="number" 
                            className="payload-input" 
                            placeholder="Min" 
                            value={filters.priceMin}
                            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                          />
                          <span>-</span>
                          <input 
                            type="number" 
                            className="payload-input" 
                            placeholder="Max" 
                            value={filters.priceMax}
                            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="payload-dropdown__item">
                        <button 
                          className="payload-button payload-button--style-primary payload-button--size-small"
                          onClick={() => setFilters({ publishedStatus: '', stockLevel: '', priceMin: '', priceMax: '' })}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="payload-table">
            <div className="payload-table__header">
              <div className="payload-table__header-row">
                <div className="payload-table__header-cell">
                  <input type="checkbox" className="payload-checkbox" />
                </div>
                {visibleColumns.mainImage && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Main Image</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.id && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>ID</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.sku && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Sku</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.nameEn && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Name {'>'} En</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.nameBg && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Name {'>'} Bg</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.descriptionEn && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Description {'>'} En</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.descriptionBg && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Description {'>'} Bg</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.price && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Price</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.ownStock && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Own Stock</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.deliveryStock && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Delivery Stock</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.deliveryTime && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Delivery Time</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.supplierName && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Supplier Name</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.categories && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Categories</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.imageGallery && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Image Gallery</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.brandingOptions && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Branding Options</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.published && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Published</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.updatedAt && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Updated At</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.createdAt && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Created At</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.syncUpdatedAt && (
                  <div className="payload-table__header-cell payload-table__header-cell--sortable">
                    <span>Sync Updated At</span>
                    <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                )}
                {visibleColumns.actions && (
                  <div className="payload-table__header-cell">
                    <span>Actions</span>
                  </div>
                )}
              </div>
            </div>
            <div className="payload-table__body">
              {filteredProducts.map((product) => (
                <div key={product.id} className="payload-table__row">
                  <div className="payload-table__cell">
                    <input type="checkbox" className="payload-checkbox" />
                  </div>
                  {visibleColumns.mainImage && (
                    <div className="payload-table__cell">
                      <div 
                        className="payload-table__image payload-table__image--clickable"
                        onClick={() => router.push(`/admin/compact-product-edit/${product.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {product.imageGallery && product.imageGallery.length > 0 ? (
                          <img
                            className="payload-table__image-thumbnail"
                            src={product.imageGallery[0].image.url}
                            alt={product.imageGallery[0].image.filename}
                          />
                        ) : (
                          <div className="payload-table__image-placeholder">
                            <svg className="payload-table__image-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {visibleColumns.id && (
                    <div className="payload-table__cell">
                      {product.id}
                    </div>
                  )}
                  {visibleColumns.sku && (
                    <div className="payload-table__cell">
                      <button
                        onClick={() => router.push(`/admin/compact-product-edit/${product.id}`)}
                        className="payload-table__link"
                      >
                        {product.sku}
                      </button>
                    </div>
                  )}
                  {visibleColumns.nameEn && (
                    <div className="payload-table__cell">
                      {product.name?.en || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.nameBg && (
                    <div className="payload-table__cell">
                      {product.name?.bg || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.descriptionEn && (
                    <div className="payload-table__cell">
                      {product.description?.en || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.descriptionBg && (
                    <div className="payload-table__cell">
                      {product.description?.bg || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.price && (
                    <div className="payload-table__cell">
                      {product.price?.toFixed(2) || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.ownStock && (
                    <div className="payload-table__cell">
                      {product.ownStock || 0}
                    </div>
                  )}
                  {visibleColumns.deliveryStock && (
                    <div className="payload-table__cell">
                      {product.deliveryStock || 0}
                    </div>
                  )}
                  {visibleColumns.deliveryTime && (
                    <div className="payload-table__cell">
                      {product.deliveryTime || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.supplierName && (
                    <div className="payload-table__cell">
                      {product.supplierName || 'N/A'}
                    </div>
                  )}
                  {visibleColumns.categories && (
                    <div className="payload-table__cell">
                      {product.categories ? product.categories.length : 0} categories
                    </div>
                  )}
                  {visibleColumns.imageGallery && (
                    <div className="payload-table__cell">
                      {product.imageGallery ? product.imageGallery.length : 0} images
                    </div>
                  )}
                  {visibleColumns.brandingOptions && (
                    <div className="payload-table__cell">
                      {product.brandingOptions ? 'Yes' : 'No'}
                    </div>
                  )}
                  {visibleColumns.published && (
                    <div className="payload-table__cell">
                      <span className={`payload-badge ${product.published ? 'payload-badge--success' : 'payload-badge--default'}`}>
                        {product.published ? 'true' : 'false'}
                      </span>
                    </div>
                  )}
                  {visibleColumns.updatedAt && (
                    <div className="payload-table__cell">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.createdAt && (
                    <div className="payload-table__cell">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.syncUpdatedAt && (
                    <div className="payload-table__cell">
                      {product.syncUpdatedAt ? new Date(product.syncUpdatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.actions && (
                    <div className="payload-table__cell">
                      <button
                        onClick={() => router.push(`/admin/compact-product-edit/${product.id}`)}
                        className="payload-button payload-button--style-primary payload-button--size-small"
                      >
                        Edit with Compact Gallery
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="payload-pagination">
            <div className="payload-pagination__info">
              Showing <span className="payload-pagination__current">1</span> to <span className="payload-pagination__total">{filteredProducts.length}</span> of{' '}
              <span className="payload-pagination__total">{filteredProducts.length}</span> results
            </div>
            <div className="payload-pagination__controls">
              <span className="payload-pagination__label">Per Page:</span>
              <select className="payload-select">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 