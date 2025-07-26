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
  tags?: string[];
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

interface Category {
  id: string;
  title: string;
  name: {
    en: string;
    bg: string;
  };
  slug: string;
}

export default function CompactProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  
  // Navigation state management
  const [navOpen, setNavOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  
  // Selection state management
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Bulk actions state
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [currentBulkAction, setCurrentBulkAction] = useState<string>('');
  const [bulkActionData, setBulkActionData] = useState<any>({});
  
  // Data for bulk actions
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Selected categories for bulk update
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  
  const [visibleColumns, setVisibleColumns] = useState({
    sku: true,
    price: true,
    ownStock: true,
    deliveryStock: true,
    published: true,
    nameBg: true,
    mainImage: true,
    createdAt: true,
    // Additional fields from original Payload CMS
    actions: false,
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
    syncUpdatedAt: false
  });
  const [filters, setFilters] = useState({
    publishedStatus: '',
    stockLevel: '',
    priceMin: '',
    priceMax: '',
    visibility: '',
    tag: '',
    supplier: '',
    category: ''
  });

  // Sorting state
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Refs for dropdown menus
  const columnsDropdownRef = useRef<HTMLDivElement>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);

  // Function to toggle published status
  const togglePublishedStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentStatus,
        }),
      });

      if (response.ok) {
        // Update the local state
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, published: !currentStatus }
            : product
        ));
      } else {
        console.error('Failed to update published status');
      }
    } catch (error) {
      console.error('Error updating published status:', error);
    }
  };

  // Selection functions
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
      setSelectAll(true);
    }
  };

  // Bulk action functions
  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedProducts.size === 0) return;

    setBulkActionLoading(true);
    try {
      let response;
      
      if (action === 'duplicate') {
        // Use the duplicate API endpoint
        response = await fetch('/api/admin/duplicate-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productIds: Array.from(selectedProducts),
          }),
        });
      } else {
        // Use the bulk update API endpoint for other actions
        response = await fetch('/api/admin/bulk-update-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productIds: Array.from(selectedProducts),
            action,
            data,
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        // Refresh products list
        fetchProducts();
        
        // Clear selection
        setSelectedProducts(new Set());
        setSelectAll(false);
        
        // Show success message (you can implement a toast notification here)
        alert(result.message);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    } finally {
      setBulkActionLoading(false);
      setShowBulkActionModal(false);
    }
  };

  const openBulkActionModal = (action: string) => {
    setCurrentBulkAction(action);
    setBulkActionData({});
    setSelectedCategories(new Set()); // Reset selected categories
    setShowBulkActionModal(true);
  };

  const confirmBulkAction = () => {
    // For category updates, use selectedCategories instead of bulkActionData
    if (currentBulkAction === 'updateCategory') {
      handleBulkAction(currentBulkAction, { categoryIds: Array.from(selectedCategories) });
    } else {
      handleBulkAction(currentBulkAction, bulkActionData);
    }
  };

  // Fetch data for bulk actions
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/admin/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchProducts = async (
    currentPage = page, 
    currentPageSize = pageSize,
    searchOverride?: string,
    filtersOverride?: typeof filters,
    sortFieldOverride?: string,
    sortDirectionOverride?: 'asc' | 'desc'
  ) => {
    console.log('=== FRONTEND FETCH PRODUCTS START ===');
    console.log('Current state:', { currentPage, currentPageSize, sortField, sortDirection });
    console.log('Overrides:', { searchOverride, filtersOverride, sortFieldOverride, sortDirectionOverride });
    
    // Use override values if provided, otherwise use state values
    const effectiveSearchTerm = searchOverride !== undefined ? searchOverride : searchTerm;
    const effectiveFilters = filtersOverride !== undefined ? filtersOverride : filters;
    const effectiveSortField = sortFieldOverride !== undefined ? sortFieldOverride : sortField;
    const effectiveSortDirection = sortDirectionOverride !== undefined ? sortDirectionOverride : sortDirection;
    
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        includeUnpublished: 'true',
        page: currentPage.toString(),
        limit: currentPageSize.toString(),
      });

      // Add search parameter if it has a value
      if (effectiveSearchTerm) {
        params.append('search', effectiveSearchTerm);
      }

      // Add filter parameters if they have values
      if (effectiveFilters.visibility) {
        params.append('visibility', effectiveFilters.visibility);
      }
      if (effectiveFilters.tag) {
        params.append('tag', effectiveFilters.tag);
      }
      if (effectiveFilters.supplier) {
        params.append('supplier', effectiveFilters.supplier);
      }
      if (effectiveFilters.category) {
        params.append('category', effectiveFilters.category);
      }

      // Add sorting parameters if they have values
      if (effectiveSortField) {
        params.append('sort', effectiveSortField);
        params.append('sortDirection', effectiveSortDirection);
        console.log('Adding sort params:', { sort: effectiveSortField, sortDirection: effectiveSortDirection });
      } else {
        console.log('No sort field, not adding sort params');
      }

      const url = `/api/products?${params.toString()}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', {
          totalDocs: data.totalDocs,
          totalPages: data.totalPages,
          docsCount: data.docs?.length || 0
        });
        
        if (data.docs && data.docs.length > 0) {
          console.log('First 3 products received:', data.docs.slice(0, 3).map((p: any) => ({
            id: p.id,
            sku: p.sku,
            published: p.published,
            createdAt: p.createdAt
          })));
        }
        
        console.log('Setting products state with', data.docs?.length || 0, 'products');
        setProducts(data.docs || []);
        setTotalPages(data.totalPages || 1);
        setTotalDocs(data.totalDocs || 0);
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedProducts(new Set()); // Clear selection when changing pages
    setSelectAll(false);
    // Explicitly call fetchProducts with new page
    fetchProducts(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
    setSelectedProducts(new Set()); // Clear selection
    setSelectAll(false);
    // Explicitly call fetchProducts with new page size
    fetchProducts(1, newPageSize);
  };

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    setSelectedProducts(new Set()); // Clear selection
    setSelectAll(false);
    // Explicitly call fetchProducts with new filter values
    fetchProducts(1, pageSize, undefined, newFilters);
  };

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle search submission (when Enter is pressed)
  const handleSearchSubmit = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when search changes
    setSelectedProducts(new Set()); // Clear selection
    setSelectAll(false);
    // Explicitly call fetchProducts to trigger search, passing the new search term
    fetchProducts(1, pageSize, value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      publishedStatus: '',
      stockLevel: '',
      priceMin: '',
      priceMax: '',
      visibility: '',
      tag: '',
      supplier: '',
      category: ''
    };
    setSearchTerm('');
    setFilters(clearedFilters);
    setSortField('');
    setSortDirection('asc');
    setPage(1);
    setSelectedProducts(new Set());
    setSelectAll(false);
    // Explicitly fetch all products after clearing filters, passing the cleared values
    fetchProducts(1, pageSize, '', clearedFilters, '', 'asc');
  };

  // Handle sorting
  const handleSort = (field: string) => {
    console.log('=== HANDLE SORT CALLED ===');
    console.log('Sort field clicked:', field);
    console.log('Current sort state:', { sortField, sortDirection });
    
    let newSortField: string;
    let newSortDirection: 'asc' | 'desc';
    
    if (sortField === field) {
      // If clicking the same field, toggle direction
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      newSortField = field;
      console.log('Toggling direction from', sortDirection, 'to', newSortDirection);
      setSortDirection(newSortDirection);
    } else {
      // If clicking a new field, set it as sort field with ascending direction
      newSortField = field;
      newSortDirection = 'asc';
      console.log('Setting new sort field:', field, 'with direction: asc');
      setSortField(newSortField);
      setSortDirection(newSortDirection);
    }
    setPage(1); // Reset to first page when sorting changes
    setSelectedProducts(new Set()); // Clear selection
    setSelectAll(false);
    
    // Explicitly call fetchProducts with new sort values
    fetchProducts(1, pageSize, undefined, undefined, newSortField, newSortDirection);
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <svg className="payload-table__sort-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="payload-table__sort-icon payload-table__sort-icon--active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="payload-table__sort-icon payload-table__sort-icon--active" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  useEffect(() => {
    fetchProducts(page, pageSize);
    fetchCategories();
    fetchSuppliers();
    fetchTags();
  }, [page, pageSize, filters.visibility, filters.tag, filters.supplier, filters.category, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
    setSelectedProducts(new Set());
    setSelectAll(false);
  }, [filters]);



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

  // Update showBulkActions based on selection
  useEffect(() => {
    setShowBulkActions(selectedProducts.size > 0);
  }, [selectedProducts]);

  // Log products state changes
  useEffect(() => {
    console.log('Products state updated:', products);
  }, [products]);



  if (loading) {
    return (
      <div className="payload-admin-layout">
        <div className="payload-content">
          <div className="payload-loading">
            <div className="payload-loading__spinner"></div>
            <div className="payload-loading__text">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Helper function to render pagination controls
  const renderPaginationControls = () => {
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="payload-pagination">
        <div className="payload-pagination__content">
          <div className="payload-pagination__info">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalDocs)} of {totalDocs} products
          </div>
          
          {totalPages > 1 && (
            <div className="payload-pagination__controls">
              <button
                className="payload-button payload-button--style-secondary payload-button--size-small"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              
              <div className="payload-pagination__pages">
                {pageNumbers.map((pageNum, index) => {
                  // Show ellipsis before first page if needed
                  if (index === 0 && pageNum > 1) {
                    return (
                      <React.Fragment key={`ellipsis-start`}>
                        <button
                          className="payload-button payload-button--style-secondary payload-button--size-small"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                        {pageNum > 2 && (
                          <span className="payload-pagination__ellipsis">...</span>
                        )}
                      </React.Fragment>
                    );
                  }
                  
                  // Show ellipsis after last page if needed
                  if (index === pageNumbers.length - 1 && pageNum < totalPages) {
                    return (
                      <React.Fragment key={`ellipsis-end`}>
                        {pageNum < totalPages - 1 && (
                          <span className="payload-pagination__ellipsis">...</span>
                        )}
                        <button
                          className="payload-button payload-button--style-secondary payload-button--size-small"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`payload-button payload-button--size-small ${
                        pageNum === page 
                          ? 'payload-button--style-primary' 
                          : 'payload-button--style-secondary'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                className="payload-button payload-button--style-secondary payload-button--size-small"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render page size selector
  const renderPageSizeSelector = () => {
    return (
      <div className="payload-page-size-selector">
        <span>Show:</span>
        <select
          className="payload-select"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>per page</span>
      </div>
    );
  };

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

          {/* Bulk Actions Bar - Always rendered to prevent layout shifts */}
          <div className={`payload-bulk-actions ${showBulkActions ? 'payload-bulk-actions--visible' : 'payload-bulk-actions--hidden'}`}>
            <div className="payload-bulk-actions__content">
              <div className="payload-bulk-actions__info">
                <span>
                  {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setSelectAll(false);
                  }}
                >
                  Clear Selection
                </button>
              </div>
              <div className="payload-bulk-actions__actions">
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => handleBulkAction('publish')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Processing...' : 'Bulk Publish'}
                </button>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => handleBulkAction('unpublish')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Processing...' : 'Bulk Hide'}
                </button>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => openBulkActionModal('addTags')}
                  disabled={bulkActionLoading}
                >
                  Add Tags
                </button>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => openBulkActionModal('updateCategory')}
                  disabled={bulkActionLoading}
                >
                  Change Category
                </button>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => openBulkActionModal('updateSupplier')}
                  disabled={bulkActionLoading}
                >
                  Change Supplier
                </button>
                <button
                  className="payload-bulk-actions__button"
                  onClick={() => handleBulkAction('duplicate')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Processing...' : 'Duplicate'}
                </button>
                <button
                  className="payload-bulk-actions__button payload-bulk-actions__button--danger"
                  onClick={() => openBulkActionModal('delete')}
                  disabled={bulkActionLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Floating Selection Indicator */}
          {selectedProducts.size > 0 && !showBulkActions && (
            <div className="payload-selection-indicator">
              <div className="payload-selection-indicator__content">
                <span className="payload-selection-indicator__text">
                  {selectedProducts.size} selected
                </span>
                <button
                  className="payload-selection-indicator__button"
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setSelectAll(false);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="payload-filters">
            <div className="payload-filters__content">
              <div className="payload-filters__search">
                <div className="payload-search">
                  <div className="payload-search__icon">
                    <svg className="payload-search__icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="payload-search__input"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e.currentTarget.value);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="payload-search__button"
                    onClick={() => handleSearchSubmit(searchTerm)}
                    title="Search products"
                  >
                    <svg className="payload-search__button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="payload-filters__actions">
                <select
                  className="payload-select"
                  value={filters.stockLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockLevel: e.target.value }))}
                >
                  <option value="">All Stock Levels</option>
                  <option value="inStock">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
                <select
                  className="payload-select"
                  value={filters.visibility}
                  onChange={(e) => handleFilterChange('visibility', e.target.value)}
                >
                  <option value="">Visibility</option>
                  <option value="shown">Shown</option>
                  <option value="hidden">Hidden</option>
                </select>
                <select
                  className="payload-select"
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                >
                  <option value="">Tags</option>
                  {tags.map((tag, index) => (
                    <option key={index} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <select
                  className="payload-select"
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                >
                  <option value="">Suppliers</option>
                  {suppliers.map((supplier, index) => (
                    <option key={index} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
                <select
                  className="payload-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="payload-button payload-button--secondary"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Top Pagination Controls */}
          <div className="payload-top-pagination">
            <div className="payload-top-pagination__left">
              {renderPageSizeSelector()}
              {renderPaginationControls()}
            </div>
            <div className="payload-top-pagination__right">
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
                      <div className="payload-columns-section">
                        <h3 className="payload-columns-section-title">Basic Information</h3>
                        <div className="payload-columns-buttons">
                          {Object.entries(visibleColumns).map(([key, visible]) => (
                            <button
                              key={key}
                              className={`payload-column-button ${visible ? 'payload-column-button--active' : ''}`}
                              onClick={() => setVisibleColumns(prev => ({ ...prev, [key]: !visible }))}
                            >
                              <svg className="payload-column-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {key}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className={`payload-table ${selectedProducts.size > 0 ? 'payload-table--has-selection' : ''}`}>
            <div className="payload-table__header">
              <div className="payload-table__header-row">
                <div className="payload-table__header-cell">
                  <input 
                    type="checkbox" 
                    className="payload-checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  {selectedProducts.size > 0 && (
                    <span className="payload-table__selection-count">
                      {selectedProducts.size}
                    </span>
                  )}
                </div>
                {visibleColumns.mainImage && (
                  <div className="payload-table__header-cell">
                    <span>Main Image</span>
                  </div>
                )}
                {visibleColumns.id && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('id')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>ID</span>
                    {getSortIcon('id')}
                  </div>
                )}
                {visibleColumns.sku && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('sku')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Sku</span>
                    {getSortIcon('sku')}
                  </div>
                )}
                {visibleColumns.nameEn && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('nameEn')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Name {'>'} En</span>
                    {getSortIcon('nameEn')}
                  </div>
                )}
                {visibleColumns.nameBg && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('nameBg')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Name {'>'} Bg</span>
                    {getSortIcon('nameBg')}
                  </div>
                )}
                {visibleColumns.descriptionEn && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('descriptionEn')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Description {'>'} En</span>
                    {getSortIcon('descriptionEn')}
                  </div>
                )}
                {visibleColumns.descriptionBg && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('descriptionBg')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Description {'>'} Bg</span>
                    {getSortIcon('descriptionBg')}
                  </div>
                )}
                {visibleColumns.price && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('price')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Price</span>
                    {getSortIcon('price')}
                  </div>
                )}
                {visibleColumns.ownStock && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('ownStock')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Own Stock</span>
                    {getSortIcon('ownStock')}
                  </div>
                )}
                {visibleColumns.deliveryStock && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('deliveryStock')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Delivery Stock</span>
                    {getSortIcon('deliveryStock')}
                  </div>
                )}
                {visibleColumns.deliveryTime && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('deliveryTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Delivery Time</span>
                    {getSortIcon('deliveryTime')}
                  </div>
                )}
                {visibleColumns.supplierName && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('supplierName')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Supplier Name</span>
                    {getSortIcon('supplierName')}
                  </div>
                )}
                {visibleColumns.categories && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('categories')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Categories</span>
                    {getSortIcon('categories')}
                  </div>
                )}
                {visibleColumns.imageGallery && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('imageGallery')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Image Gallery</span>
                    {getSortIcon('imageGallery')}
                  </div>
                )}
                {visibleColumns.brandingOptions && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('brandingOptions')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Branding Options</span>
                    {getSortIcon('brandingOptions')}
                  </div>
                )}
                {visibleColumns.createdAt && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('createdAt')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Created At</span>
                    {getSortIcon('createdAt')}
                  </div>
                )}
                {visibleColumns.updatedAt && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('updatedAt')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Updated At</span>
                    {getSortIcon('updatedAt')}
                  </div>
                )}
                {visibleColumns.syncUpdatedAt && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('syncUpdatedAt')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Sync Updated At</span>
                    {getSortIcon('syncUpdatedAt')}
                  </div>
                )}
                {visibleColumns.published && (
                  <div 
                    className="payload-table__header-cell payload-table__header-cell--sortable"
                    onClick={() => handleSort('published')}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Published</span>
                    {getSortIcon('published')}
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
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`payload-table__row ${selectedProducts.has(product.id) ? 'payload-table__row--selected' : ''}`}
                  onClick={(e) => {
                    // Prevent row click when clicking on checkbox or action buttons
                    const target = e.target as HTMLElement;
                    if (target instanceof HTMLInputElement || 
                        target instanceof HTMLButtonElement || 
                        target.closest('button') || 
                        target.closest('.payload-table__link')) {
                      return;
                    }
                    handleSelectProduct(product.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="payload-table__cell">
                    <input 
                      type="checkbox" 
                      className="payload-checkbox" 
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking checkbox
                        handleSelectProduct(product.id);
                      }}
                    />
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
                      <span className={`payload-badge ${product.brandingOptions ? 'payload-badge--success' : 'payload-badge--default'}`}>
                        {product.brandingOptions ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {visibleColumns.createdAt && (
                    <div className="payload-table__cell">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.updatedAt && (
                    <div className="payload-table__cell">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.syncUpdatedAt && (
                    <div className="payload-table__cell">
                      {product.syncUpdatedAt ? new Date(product.syncUpdatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {visibleColumns.published && (
                    <div className="payload-table__cell">
                      <button
                        onClick={() => togglePublishedStatus(product.id, product.published)}
                        className={`payload-badge payload-badge--clickable ${product.published ? 'payload-badge--success' : 'payload-badge--default'}`}
                        title={product.published ? 'Click to hide' : 'Click to show'}
                      >
                        {product.published ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        )}
                        {product.published ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  )}
                  {visibleColumns.actions && (
                    <div className="payload-table__cell">
                      <button
                        onClick={() => router.push(`/admin/compact-product-edit/${product.id}`)}
                        className="payload-button payload-button--style-secondary payload-button--size-small"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="payload-top-pagination">
            <div className="payload-top-pagination__left">
              {renderPageSizeSelector()}
              {renderPaginationControls()}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="payload-modal-overlay">
          <div className="payload-modal">
            <h3 className="payload-modal__title">
              {currentBulkAction === 'delete' && 'Confirm Delete'}
              {currentBulkAction === 'addTags' && 'Add Tags'}
              {currentBulkAction === 'updateCategory' && 'Change Category'}
              {currentBulkAction === 'updateSupplier' && 'Change Supplier'}
            </h3>
            
            <div className="payload-modal__content">
              {currentBulkAction === 'delete' && (
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Are you sure you want to delete {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
              )}
              
              {currentBulkAction === 'addTags' && (
                <div className="payload-modal__field">
                  <label className="payload-modal__label">
                    Tags (comma-separated):
                  </label>
                  <input
                    type="text"
                    className="payload-modal__input"
                    placeholder="tag1, tag2, tag3"
                    value={bulkActionData.tagsInput || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setBulkActionData({ tags, tagsInput: e.target.value });
                    }}
                  />
                </div>
              )}
              
              {currentBulkAction === 'updateCategory' && (
                <div className="payload-modal__field">
                  <label className="payload-modal__label">
                    Select Categories (multiple selection):
                  </label>
                  <div className="payload-modal__categories-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px' }}>
                    {categories.map(category => (
                      <label key={category.id} className="payload-modal__category-item" style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(category.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedCategories);
                            if (e.target.checked) {
                              newSelected.add(category.id);
                            } else {
                              newSelected.delete(category.id);
                            }
                            setSelectedCategories(newSelected);
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        <span>{category.name?.en || category.title}</span>
                      </label>
                    ))}
                  </div>
                  {selectedCategories.size > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                      Selected: {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'}
                    </div>
                  )}
                </div>
              )}
              
              {currentBulkAction === 'updateSupplier' && (
                <div className="payload-modal__field">
                  <label className="payload-modal__label">
                    Select Supplier:
                  </label>
                  <select
                    className="payload-modal__select"
                    value={bulkActionData.supplierName || ''}
                    onChange={(e) => setBulkActionData({ supplierName: e.target.value })}
                  >
                    <option value="">Select a supplier...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="payload-modal__actions">
              <button
                className="payload-button payload-button--style-secondary"
                onClick={() => setShowBulkActionModal(false)}
                disabled={bulkActionLoading}
              >
                Cancel
              </button>
              <button
                className="payload-button payload-button--style-primary"
                onClick={confirmBulkAction}
                disabled={bulkActionLoading || (currentBulkAction === 'updateCategory' && selectedCategories.size === 0)}
              >
                {bulkActionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 