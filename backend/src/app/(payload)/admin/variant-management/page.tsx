'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VariantOption {
  id: string
  name: string
  type: 'color' | 'size' | 'material' | 'style'
  value: string
  colorCode?: string
  sortOrder: number
  active: boolean
}

interface Product {
  id: string
  sku: string
  name: { en: string; bg: string }
  hasVariants: boolean
  variantTypes?: Array<{ type: string }>
}

export default function VariantManagementPage() {
  const router = useRouter()
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'options' | 'products'>('options')
  
  // Form states
  const [newOption, setNewOption] = useState({
    name: '',
    type: 'color' as const,
    value: '',
    colorCode: '',
    sortOrder: 0,
    active: true,
  })

  useEffect(() => {
    fetchVariantOptions()
    fetchProducts()
  }, [])

  const fetchVariantOptions = async () => {
    try {
      const response = await fetch('/api/variant-options?active=true')
      if (response.ok) {
        const data = await response.json()
        setVariantOptions(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching variant options:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?includeUnpublished=true')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/variant-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOption),
      })

      if (response.ok) {
        setNewOption({
          name: '',
          type: 'color',
          value: '',
          colorCode: '',
          sortOrder: 0,
          active: true,
        })
        fetchVariantOptions()
      }
    } catch (error) {
      console.error('Error creating variant option:', error)
    }
  }

  const generateVariantsForProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Generated ${result.variants.length} variants for product`)
      }
    } catch (error) {
      console.error('Error generating variants:', error)
    }
  }

  if (loading) {
    return (
      <div className="payload-admin__content">
        <div className="payload-admin__loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="payload-admin__content">
      <div className="payload-admin__header">
        <h1 className="payload-admin__title">Variant Management</h1>
        <div className="payload-admin__header-actions">
          <button
            onClick={() => router.push('/admin/compact-product-edit')}
            className="payload-button payload-button--secondary"
          >
            Back to Products
          </button>
        </div>
      </div>

      <div className="payload-admin__tabs">
        <button
          className={`payload-admin__tab ${activeTab === 'options' ? 'payload-admin__tab--active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          Variant Options
        </button>
        <button
          className={`payload-admin__tab ${activeTab === 'products' ? 'payload-admin__tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Variants
        </button>
      </div>

      {activeTab === 'options' && (
        <div className="payload-admin__tab-content">
          <div className="payload-admin__section">
            <h2>Create New Variant Option</h2>
            <form onSubmit={handleCreateOption} className="payload-admin__form">
              <div className="payload-admin__field">
                <label className="payload-admin__label">Name</label>
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  className="payload-admin__input"
                  required
                />
              </div>
              
              <div className="payload-admin__field">
                <label className="payload-admin__label">Type</label>
                <select
                  value={newOption.type}
                  onChange={(e) => setNewOption({ ...newOption, type: e.target.value as any })}
                  className="payload-admin__select"
                >
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  <option value="material">Material</option>
                  <option value="style">Style</option>
                </select>
              </div>
              
              <div className="payload-admin__field">
                <label className="payload-admin__label">Value</label>
                <input
                  type="text"
                  value={newOption.value}
                  onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  className="payload-admin__input"
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              {newOption.type === 'color' && (
                <div className="payload-admin__field">
                  <label className="payload-admin__label">Color Code</label>
                  <input
                    type="text"
                    value={newOption.colorCode}
                    onChange={(e) => setNewOption({ ...newOption, colorCode: e.target.value })}
                    className="payload-admin__input"
                    placeholder="#FF0000"
                  />
                </div>
              )}
              
              <div className="payload-admin__field">
                <label className="payload-admin__label">Sort Order</label>
                <input
                  type="number"
                  value={newOption.sortOrder}
                  onChange={(e) => setNewOption({ ...newOption, sortOrder: parseInt(e.target.value) })}
                  className="payload-admin__input"
                />
              </div>
              
              <div className="payload-admin__field">
                <label className="payload-admin__label">
                  <input
                    type="checkbox"
                    checked={newOption.active}
                    onChange={(e) => setNewOption({ ...newOption, active: e.target.checked })}
                    className="payload-admin__checkbox"
                  />
                  Active
                </label>
              </div>
              
              <button type="submit" className="payload-button payload-button--primary">
                Create Option
              </button>
            </form>
          </div>

          <div className="payload-admin__section">
            <h2>Existing Variant Options</h2>
            <div className="payload-admin__table-container">
              <table className="payload-admin__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Color Code</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {variantOptions.map((option) => (
                    <tr key={option.id}>
                      <td>{option.name}</td>
                      <td>{option.type}</td>
                      <td>{option.value}</td>
                      <td>
                        {option.colorCode && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: option.colorCode,
                                border: '1px solid #ccc',
                                borderRadius: '3px',
                              }}
                            />
                            {option.colorCode}
                          </div>
                        )}
                      </td>
                      <td>{option.sortOrder}</td>
                      <td>
                        <span className={`payload-admin__status ${option.active ? 'payload-admin__status--active' : 'payload-admin__status--inactive'}`}>
                          {option.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="payload-admin__tab-content">
          <div className="payload-admin__section">
            <h2>Products with Variants</h2>
            <div className="payload-admin__table-container">
              <table className="payload-admin__table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Has Variants</th>
                    <th>Variant Types</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>{product.name.en}</td>
                      <td>
                        <span className={`payload-admin__status ${product.hasVariants ? 'payload-admin__status--active' : 'payload-admin__status--inactive'}`}>
                          {product.hasVariants ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        {product.variantTypes?.map((vt, index) => (
                          <span key={index} className="payload-admin__badge">
                            {vt.type}
                          </span>
                        ))}
                      </td>
                      <td>
                        <div className="payload-admin__actions">
                          <button
                            onClick={() => router.push(`/admin/compact-product-edit/${product.id}`)}
                            className="payload-button payload-button--small payload-button--secondary"
                          >
                            Edit
                          </button>
                          {product.hasVariants && (
                            <button
                              onClick={() => generateVariantsForProduct(product.id)}
                              className="payload-button payload-button--small payload-button--primary"
                            >
                              Generate Variants
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 