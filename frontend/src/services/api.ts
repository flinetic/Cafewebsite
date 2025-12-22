import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokensStr = localStorage.getItem('tokens');
    if (tokensStr) {
      try {
        const tokens = JSON.parse(tokensStr);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokensStr = localStorage.getItem('tokens');
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);
          
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: tokens.refreshToken,
          });

          const { accessToken } = response.data.data;
          
          // Update stored tokens
          const newTokens = { ...tokens, accessToken };
          localStorage.setItem('tokens', JSON.stringify(newTokens));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== Table API ====================
export const tableApi = {
  // Get all tables
  getAllTables: () => api.get('/tables'),
  
  // Create a new table
  createTable: (tableNumber: number) => 
    api.post('/tables', { tableNumber }),
  
  // Get table by ID
  getTableById: (id: string) => api.get(`/tables/${id}`),
  
  // Update table
  updateTable: (id: string, data: any) => 
    api.put(`/tables/${id}`, data),
  
  // Delete table
  deleteTable: (id: string) => api.delete(`/tables/${id}`),
  
  // Toggle table active status
  toggleActive: (id: string) => api.patch(`/tables/${id}/toggle`),
  
  // Regenerate QR code
  regenerateQR: (id: string) => 
    api.post(`/tables/${id}/regenerate-qr`),
  
  // Get QR code PNG URL
  getQRPngUrl: (id: string) => 
    `${API_URL}/tables/${id}/qr/png`,
  
  // Get QR code SVG URL
  getQRSvgUrl: (id: string) => 
    `${API_URL}/tables/${id}/qr/svg`,
};

// ==================== Config API ====================
export const configApi = {
  // Get cafe configuration
  getConfig: () => api.get('/config'),
  
  // Get public configuration
  getPublicConfig: () => api.get('/config/public'),
  
  // Update configuration
  updateConfig: (data: any) => api.put('/config', data),
  
  // Update location
  updateLocation: (latitude: number, longitude: number, address?: string) =>
    api.put('/config/location', { latitude, longitude, address }),
  
  // Update allowed radius
  updateRadius: (radius: number) => 
    api.put('/config/radius', { radius }),
  
  // Update theme
  updateTheme: (theme: any) => api.put('/config/theme', theme),
  
  // Update operating hours
  updateHours: (hours: any) => api.put('/config/hours', hours),
};

// ==================== Menu API ====================
export interface MenuItemData {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  preparationTime?: number;
  tags?: string[];
  sortOrder?: number;
}

export const menuApi = {
  // ===== Public Routes =====
  // Get available menu items (for customers)
  getAvailableItems: () => api.get('/menu'),
  
  // Get menu grouped by category
  getMenuGrouped: () => api.get('/menu/grouped'),
  
  // Get categories with counts
  getCategories: () => api.get('/menu/categories'),
  
  // Search menu items
  searchItems: (query: string) => api.get(`/menu/search?q=${encodeURIComponent(query)}`),
  
  // Get items by category
  getItemsByCategory: (category: string) => api.get(`/menu/category/${category}`),
  
  // Get single item
  getItemById: (id: string) => api.get(`/menu/${id}`),
  
  // ===== Admin Routes =====
  // Get all items (including unavailable)
  getAllItems: () => api.get('/menu/admin/all'),
  
  // Create new item
  createItem: (data: MenuItemData) => api.post('/menu', data),
  
  // Update item
  updateItem: (id: string, data: Partial<MenuItemData>) => api.put(`/menu/${id}`, data),
  
  // Delete item
  deleteItem: (id: string) => api.delete(`/menu/${id}`),
  
  // Toggle availability
  toggleAvailability: (id: string) => api.patch(`/menu/${id}/toggle`),
  
  // Update sort order
  updateSortOrder: (items: { id: string; sortOrder: number }[]) => 
    api.put('/menu/sort-order', { items }),
};

// ==================== Order API ====================
export interface OrderItemData {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateOrderData {
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderItemData[];
  notes?: string;
}

export const orderApi = {
  // ===== Public Routes =====
  // Create new order (customer)
  createOrder: (data: CreateOrderData) => api.post('/orders', data),
  
  // Verify table exists
  verifyTable: (tableNumber: number) => api.get(`/orders/verify-table/${tableNumber}`),
  
  // Get orders for table (customer view)
  getTableOrders: (tableNumber: number, phone: string) => 
    api.get(`/orders/table/${tableNumber}?phone=${phone}`),
  
  // ===== Admin Routes =====
  // Get all orders
  getAllOrders: (params?: { status?: string; tableNumber?: number; startDate?: string; endDate?: string }) => 
    api.get('/orders', { params }),
  
  // Get today's orders
  getTodaysOrders: (status?: string) => 
    api.get('/orders/today', { params: { status } }),
  
  // Get pending orders
  getPendingOrders: () => api.get('/orders/pending'),
  
  // Get completed orders
  getCompletedOrders: () => api.get('/orders/completed'),
  
  // Get history orders by date
  getHistoryOrders: (date?: string) => 
    api.get('/orders/history', { params: { date } }),
  
  // Get today's stats
  getTodaysStats: () => api.get('/orders/stats'),
  
  // Get single order
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  
  // Mark order as completed
  markAsCompleted: (id: string) => api.patch(`/orders/${id}/complete`),
  
  // Mark order as paid (move to history)
  markAsPaid: (id: string) => api.patch(`/orders/${id}/paid`),
  
  // Cancel order
  cancelOrder: (id: string) => api.delete(`/orders/${id}`),
};

export default api;
