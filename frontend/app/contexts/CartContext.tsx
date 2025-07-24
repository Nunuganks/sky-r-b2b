'use client';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Types
export interface CartItem {
  id: string;
  sku: string;
  name: { en: string; bg: string };
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
  stockStatus: 'available' | 'delivery' | 'unavailable';
  deliveryTime?: string;
  supplierName?: string;
}

export interface StockAlert {
  productId: string;
  sku: string;
  name: { en: string; bg: string };
  email: string;
  createdAt: Date;
}

interface CartState {
  items: CartItem[];
  stockAlerts: StockAlert[];
  isOpen: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_STOCK_ALERT'; payload: StockAlert }
  | { type: 'REMOVE_STOCK_ALERT'; payload: { productId: string } }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'LOAD_STOCK_ALERTS'; payload: StockAlert[] }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean };

// Initial state
const initialState: CartState = {
  items: [],
  stockAlerts: [],
  isOpen: false,
  isAuthenticated: false,
  isSyncing: false,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'ADD_STOCK_ALERT':
      return {
        ...state,
        stockAlerts: [...state.stockAlerts, action.payload],
      };
    case 'REMOVE_STOCK_ALERT':
      return {
        ...state,
        stockAlerts: state.stockAlerts.filter(alert => alert.productId !== action.payload.productId),
      };
    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };
    case 'LOAD_STOCK_ALERTS':
      return {
        ...state,
        stockAlerts: action.payload,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload,
      };
    default:
      return state;
  }
}

// Context
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: any, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  addStockAlert: (product: any, email: string) => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  isAuthenticated: boolean;
  isSyncing: boolean;
} | null>(null);

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Listen for authentication changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      const isAuthenticated = !!token;
      
      if (isAuthenticated && !state.isAuthenticated) {
        // User just logged in
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        mergeCartsOnLogin();
      } else if (!isAuthenticated && state.isAuthenticated) {
        // User just logged out
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        // Cart is already saved to localStorage by the save effect
      }
    };

    // Check on mount
    handleAuthChange();
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [state.isAuthenticated]);

  // Initialize cart state on mount
  useEffect(() => {
    // Load cart from localStorage first (for immediate availability)
    const savedCart = localStorage.getItem('cart');
    const savedAlerts = localStorage.getItem('stockAlerts');
    
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    if (savedAlerts) {
      try {
        const alerts = JSON.parse(savedAlerts);
        dispatch({ type: 'LOAD_STOCK_ALERTS', payload: alerts });
      } catch (error) {
        console.error('Error loading stock alerts from localStorage:', error);
      }
    }

    // Then check authentication and sync with database if needed
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    
    if (isAuthenticated) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      // Load from database in background
      loadUserCart();
    }
  }, []);



  // Load cart from localStorage (for guest users)
  const loadLocalCart = () => {
    const savedCart = localStorage.getItem('cart');
    const savedAlerts = localStorage.getItem('stockAlerts');
    
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    if (savedAlerts) {
      try {
        const alerts = JSON.parse(savedAlerts);
        dispatch({ type: 'LOAD_STOCK_ALERTS', payload: alerts });
      } catch (error) {
        console.error('Error loading stock alerts from localStorage:', error);
      }
    }
  };

  // Load cart from database (for authenticated users)
  const loadUserCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const dbItems = data.items || [];
        
        // Only update if database has items
        if (dbItems.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: dbItems });
        }
      } else {
        console.error('Failed to load user cart:', response.status);
      }
    } catch (error) {
      console.error('Error loading user cart:', error);
    }
  };

  // Sync cart to database (for authenticated users)
  const syncCartToDatabase = async (action: string, item?: any, quantity?: number) => {
    if (!state.isAuthenticated) {
      return;
    }

    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, item, quantity }),
      });

      if (!response.ok) {
        console.error('Failed to sync cart:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error('Failed to sync cart');
      }
      
      await response.json();
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const mergeCartsOnLogin = async () => {
    try {
      const localCart = localStorage.getItem('cart');
      if (!localCart) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ localCart: JSON.parse(localCart) }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOAD_CART', payload: data.items });
        // Clear local cart after successful merge
        localStorage.removeItem('cart');
      } else {
        console.error('Failed to merge cart:', response.status);
      }
    } catch (error) {
      console.error('Error merging carts:', error);
    }
  };



  // Save cart to localStorage for all users (to preserve during page reloads)
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } else if (state.items.length === 0) {
      // Clear localStorage when cart is empty
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  // Save stock alerts to localStorage
  useEffect(() => {
    localStorage.setItem('stockAlerts', JSON.stringify(state.stockAlerts));
  }, [state.stockAlerts]);

  // Check stock availability
  const checkStockAvailability = async (product: any, locale: string = 'bg'): Promise<{
    status: 'available' | 'delivery' | 'unavailable';
    deliveryTime?: string;
    supplierName?: string;
  }> => {
    try {
      const response = await fetch(`/api/stock-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sku: product.sku,
          locale 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check stock availability');
      }

      const data = await response.json();
      return {
        status: data.status,
        deliveryTime: data.deliveryTime,
        supplierName: data.supplierName,
      };
    } catch (error) {
      console.error('Error checking stock availability:', error);
      // Default to unavailable if check fails
      return { status: 'unavailable' };
    }
  };

  // Add to cart with stock checking
  const addToCart = async (product: any, quantity: number) => {
    const stockInfo = await checkStockAvailability(product);
    
    const cartItem: CartItem = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity,
      imageUrl: product.imageGallery?.[0]?.image?.url,
      stockStatus: stockInfo.status,
      deliveryTime: stockInfo.deliveryTime,
      supplierName: stockInfo.supplierName,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    
    // Sync to database for authenticated users
    if (state.isAuthenticated) {
      await syncCartToDatabase('add', cartItem, quantity);
    }
  };

  const removeFromCart = async (id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    
    // Sync to database for authenticated users
    if (state.isAuthenticated && item) {
      await syncCartToDatabase('remove', item);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
    } else {
      const item = state.items.find(item => item.id === id);
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      
      // Sync to database for authenticated users
      if (state.isAuthenticated && item) {
        await syncCartToDatabase('update', item, quantity);
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    
    // Sync to database for authenticated users
    if (state.isAuthenticated) {
      await syncCartToDatabase('clear');
    }
  };

  const addStockAlert = async (product: any, email: string) => {
    try {
      const response = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add stock alert');
      }

      const alert: StockAlert = {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        email,
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_STOCK_ALERT', payload: alert });
    } catch (error) {
      console.error('Error adding stock alert:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return state.items.length;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addStockAlert,
        getCartTotal,
        getCartCount,
        isAuthenticated: state.isAuthenticated,
        isSyncing: state.isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 