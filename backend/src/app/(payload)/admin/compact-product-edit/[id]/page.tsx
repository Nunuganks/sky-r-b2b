'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: string;
  sku: string;
  name: {
    en: string;
    bg: string;
  };
  price: number;
  ownStock?: number;
  deliveryStock?: number;
  published: boolean;
  imageGallery?: Array<{
    image: {
      url: string;
      filename: string;
    };
  }>;
}

export default function CompactProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Navigation state management
  const [navOpen, setNavOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSave = async () => {
    if (!product) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (response.ok) {
        // Show success message
        alert('Product saved successfully!');
      } else {
        console.error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="payload-admin-layout">
        <div className="payload-content">
          <div className="payload-loading">
            <div className="payload-loading__spinner"></div>
            <p className="payload-loading__text">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="payload-admin-layout">
        <div className="payload-content">
          <div className="payload-error">
            <p>Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payload-admin-layout">
      {/* Sidebar with functional toggles */}
      <aside className={`nav ${navOpen ? 'nav--nav-open' : 'nav--nav-closed'} nav--nav-animate nav--nav-hydrated`}>
        <div className="nav__scroll" style={{ overscrollBehavior: 'auto' }}>
          <nav className="nav__wrap">
            <div className="nav-group Collections" id="nav-group-Collections">
              <button 
                className={`nav-group__toggle ${collectionsOpen ? 'nav-group__toggle--open' : 'nav-group__toggle--closed'}`} 
                tabIndex={0} 
                type="button"
                onClick={() => setCollectionsOpen(!collectionsOpen)}
              >
                <div className="nav-group__label">Collections</div>
                <div className="nav-group__indicator">
                  <svg 
                    className="icon icon--chevron nav-group__indicator" 
                    height="100%" 
                    style={{ transform: collectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                    viewBox="0 0 20 20" 
                    width="100%" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path className="stroke" d="M14 8L10 12L6 8" strokeLinecap="square"></path>
                  </svg>
                </div>
              </button>
              <div 
                aria-hidden={!collectionsOpen} 
                className={`rah-static ${collectionsOpen ? 'rah-static--height-auto' : 'rah-static--height-0'}`} 
                style={{ transition: 'height 0ms ease' }}
              >
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
                    <a className="nav__link" id="nav-product-variants" href="/admin/collections/product-variants">
                      <span className="nav__link-label">Product Variants</span>
                    </a>
                    <a className="nav__link" id="nav-variant-options" href="/admin/collections/variant-options">
                      <span className="nav__link-label">Variant Options</span>
                    </a>
                    <a className="nav__link" id="nav-categories" href="/admin/collections/categories">
                      <span className="nav__link-label">Categories</span>
                    </a>
                    <a className="nav__link" id="nav-carts" href="/admin/collections/carts">
                      <span className="nav__link-label">Carts</span>
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
              <button 
                className="nav__mobile-close" 
                type="button"
                onClick={() => setNavOpen(!navOpen)}
              >
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
        {/* Header with navigation toggle */}
        <div className="payload-header">
          <div className="payload-header__content">
            <div className="payload-header__left">
              <button 
                className="payload-header__nav-toggle"
                onClick={() => setNavOpen(!navOpen)}
                aria-label={navOpen ? "Close navigation" : "Open navigation"}
              >
                <svg className="payload-header__nav-toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="payload-header__breadcrumbs">
                <div className="payload-breadcrumb">
                  <svg className="payload-breadcrumb__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="payload-breadcrumb__text">/ Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="payload-page">
          {/* Page Header */}
          <div className="payload-page__header">
            <div className="payload-page__title">
              <h1 className="payload-page__title-text">Edit Product: {product.sku}</h1>
              <p className="payload-page__title-subtitle">Compact Gallery Editor</p>
            </div>
            <div className="payload-page__actions">
              <button
                onClick={() => router.push('/admin/compact-product-edit')}
                className="payload-button payload-button--style-secondary"
              >
                Back to List
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="payload-button payload-button--style-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Product Form */}
          <div className="payload-form">
            <div className="payload-form__section">
              <h2 className="payload-form__section-title">Basic Information</h2>
              <div className="payload-form__grid">
                <div className="payload-form__field">
                  <label className="payload-form__label">SKU</label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Name (English)</label>
                  <input
                    type="text"
                    value={product.name.en}
                    onChange={(e) => setProduct({ ...product, name: { ...product.name, en: e.target.value } })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Name (Bulgarian)</label>
                  <input
                    type="text"
                    value={product.name.bg}
                    onChange={(e) => setProduct({ ...product, name: { ...product.name, bg: e.target.value } })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Own Stock</label>
                  <input
                    type="number"
                    value={product.ownStock || 0}
                    onChange={(e) => setProduct({ ...product, ownStock: parseInt(e.target.value) })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Delivery Stock</label>
                  <input
                    type="number"
                    value={product.deliveryStock || 0}
                    onChange={(e) => setProduct({ ...product, deliveryStock: parseInt(e.target.value) })}
                    className="payload-form__input"
                  />
                </div>
                <div className="payload-form__field">
                  <label className="payload-form__label">Published</label>
                  <label className="payload-checkbox-label">
                    <input
                      type="checkbox"
                      checked={product.published}
                      onChange={(e) => setProduct({ ...product, published: e.target.checked })}
                      className="payload-checkbox"
                    />
                    <span>Published</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Compact Image Gallery */}
            <div className="payload-form__section">
              <h2 className="payload-form__section-title">Image Gallery</h2>
              <div className="compact-gallery">
                <div className="compact-gallery__grid">
                  {product.imageGallery && product.imageGallery.length > 0 ? (
                    product.imageGallery.map((item, index) => (
                      <div key={index} className="compact-gallery__item">
                        <div className="compact-gallery__image-container">
                          <img
                            src={item.image.url}
                            alt={item.image.filename}
                            className="compact-gallery__image"
                          />
                          {index === 0 && (
                            <div className="compact-gallery__main-label">Основен</div>
                          )}
                          <div className="compact-gallery__actions">
                            <button className="compact-gallery__action">
                              <svg className="compact-gallery__action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="compact-gallery__action">
                              <svg className="compact-gallery__action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="compact-gallery__filename">{item.image.filename}</div>
                      </div>
                    ))
                  ) : (
                    <div className="compact-gallery__empty">
                      <svg className="compact-gallery__empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No images uploaded</p>
                    </div>
                  )}
                </div>
                <button className="compact-gallery__add-button">
                  <svg className="compact-gallery__add-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Image
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 