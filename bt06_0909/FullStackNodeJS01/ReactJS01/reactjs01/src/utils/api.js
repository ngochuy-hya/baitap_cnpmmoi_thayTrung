import axios from 'axios';

// Base URL cho API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Tạo axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

// ===========================================
// AUTH API
// ===========================================

export const authAPI = {
  // Đăng ký
  register: (userData) => api.post('/auth/register', userData),
  
  // Đăng nhập
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Quên mật khẩu
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset mật khẩu
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Resend verification
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// ===========================================
// USER API
// ===========================================

export const userAPI = {
  // Lấy profile
  getProfile: () => api.get('/users/profile'),
  
  // Cập nhật profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Đổi mật khẩu
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
};

// ===========================================
// PRODUCT API
// ===========================================

export const productAPI = {
  // Lấy danh sách sản phẩm
  getProducts: (params = {}) => api.get('/products', { params }),
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (categorySlug, params = {}) => 
    api.get(`/products/category/${categorySlug}`, { params }),
  
  // Load more products (cho lazy loading)
  loadMoreProducts: (categorySlug = null, params = {}) => {
    const endpoint = categorySlug 
      ? `/products/category/${categorySlug}/load-more`
      : '/products/load-more';
    return api.get(endpoint, { params });
  },
  
  // Lấy chi tiết sản phẩm
  getProductDetail: (identifier) => api.get(`/products/${identifier}`),
  
  // Lấy sản phẩm nổi bật
  getFeaturedProducts: (limit = 8) => api.get('/products/featured', { 
    params: { limit } 
  }),
  
  // Lấy sản phẩm mới nhất
  getLatestProducts: (limit = 8) => api.get('/products/latest', { 
    params: { limit } 
  }),
  
  // Tìm kiếm sản phẩm
  searchProducts: (query, params = {}) => api.get('/products/search', { 
    params: { q: query, ...params } 
  }),

  // Advanced search with Elasticsearch
  advancedSearch: (params = {}) => api.get('/products/advanced-search', { params }),

  // Filter products
  filterProducts: (params = {}) => api.get('/products/filter', { params }),

  // Get search suggestions
  getSearchSuggestions: (query, limit = 10) => api.get('/products/suggestions', {
    params: { q: query, limit }
  }),

  // Get popular search terms
  getPopularSearchTerms: (days = 7, limit = 20) => api.get('/products/popular-terms', {
    params: { days, limit }
  }),

  // Get popular products
  getPopularProducts: (params = {}) => api.get('/products/popular', { params }),

  // Get trending products
  getTrendingProducts: (params = {}) => api.get('/products/trending', { params }),

  // Track product view
  trackProductView: (productId) => api.post(`/products/${productId}/track-view`),
};

// ===========================================
// CATEGORY API
// ===========================================

export const categoryAPI = {
  // Lấy tất cả danh mục
  getCategories: () => api.get('/categories'),
  
  // Lấy cây danh mục
  getCategoryTree: () => api.get('/categories/tree'),
  
  // Lấy danh mục cha
  getRootCategories: () => api.get('/categories/root'),
  
  // Lấy chi tiết danh mục
  getCategoryDetail: (identifier) => api.get(`/categories/${identifier}`),
  
  // Lấy danh mục con
  getChildCategories: (parentId) => api.get(`/categories/${parentId}/children`),
  
  // Tìm kiếm danh mục
  searchCategories: (query, params = {}) => api.get('/categories/search', { 
    params: { q: query, ...params } 
  }),
};

// ===========================================
// HOME API
// ===========================================

export const homeAPI = {
  // Lấy dữ liệu trang chủ
  getHomeData: () => api.get('/home'),
  
  // Lấy sản phẩm theo section
  getSectionProducts: (section, limit = 8) => 
    api.get(`/home/sections/${section}`, { params: { limit } }),
  
  // Lấy menu categories
  getMenuCategories: () => api.get('/home/menu-categories'),
  
  // Tìm kiếm nhanh
  quickSearch: (query, limit = 5) => api.get('/home/search', { 
    params: { q: query, limit } 
  }),
  
  // Health check
  healthCheck: () => api.get('/health'),
  
  // API info
  getApiInfo: () => api.get('/info'),
};

// ===========================================
// UTILITIES
// ===========================================

// Format tiền tệ VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format ngày tháng
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

// Tính phần trăm giảm giá
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Debounce function cho search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Default export
export default api;
