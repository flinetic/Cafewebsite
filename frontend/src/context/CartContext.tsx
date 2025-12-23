import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions: string;
  category: string;
  image?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: number | null;
  customerInfo: CustomerInfo | null;
  isRegistered: boolean;
  addItem: (item: Omit<CartItem, 'quantity' | 'specialInstructions'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: number) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  clearSession: () => void;
  checkAndCleanExpiredSession: () => boolean;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bookavibe_cart';
const CUSTOMER_STORAGE_KEY = 'bookavibe_customer';
const TABLE_STORAGE_KEY = 'bookavibe_table';
const CUSTOMER_EXPIRY_KEY = 'bookavibe_customer_expiry';
const CUSTOMER_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<number | null>(null);
  const [customerInfo, setCustomerInfoState] = useState<CustomerInfo | null>(null);

  // Check if customer data has expired
  const checkCustomerExpiry = (): boolean => {
    const expiryTime = localStorage.getItem(CUSTOMER_EXPIRY_KEY);
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      // Clear expired customer info
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      localStorage.removeItem(CUSTOMER_EXPIRY_KEY);
      console.log('Customer session expired - data cleared');
      return true; // Data was expired
    }
    return false; // Data is still valid
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedTable = localStorage.getItem(TABLE_STORAGE_KEY);

      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedTable) {
        setTableNumberState(parseInt(savedTable));
      }

      // Check if customer data has expired before loading
      if (!checkCustomerExpiry()) {
        const savedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
        if (savedCustomer) {
          setCustomerInfoState(JSON.parse(savedCustomer));
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Check if customer is registered
  const isRegistered = !!(customerInfo?.name && customerInfo?.phone && tableNumber);

  const addItem = (item: Omit<CartItem, 'quantity' | 'specialInstructions'>) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.menuItemId === item.menuItemId);

      if (existingIndex >= 0) {
        // Increase quantity of existing item
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += 1;
        return newItems;
      }

      // Add new item
      return [...prevItems, { ...item, quantity: 1, specialInstructions: '' }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const updateInstructions = (menuItemId: string, instructions: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItemId === menuItemId ? { ...item, specialInstructions: instructions } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const setTableNumber = (number: number) => {
    setTableNumberState(number);
    localStorage.setItem(TABLE_STORAGE_KEY, String(number));
  };

  const setCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfoState(info);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(info));
    // Set expiry 30 minutes from now
    localStorage.setItem(CUSTOMER_EXPIRY_KEY, String(Date.now() + CUSTOMER_EXPIRY_MS));
  };

  const clearSession = () => {
    setItems([]);
    setTableNumberState(null);
    setCustomerInfoState(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    localStorage.removeItem(TABLE_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_EXPIRY_KEY);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Check and clean expired session - returns true if session was expired
  const checkAndCleanExpiredSession = (): boolean => {
    if (checkCustomerExpiry()) {
      setCustomerInfoState(null);
      return true;
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        customerInfo,
        isRegistered,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        setTableNumber,
        setCustomerInfo,
        clearSession,
        checkAndCleanExpiredSession,
        getTotalAmount,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
