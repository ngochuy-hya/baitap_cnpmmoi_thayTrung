import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Base URL
const BASE_URL = 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle backend response format and token refresh
api.interceptors.response.use(
  (response) => {
    // Check if response follows our backend format (EM, EC, DT)
    if (response.data && typeof response.data.EC !== 'undefined') {
      if (response.data.EC === 0) {
        // Success case
        return {
          ...response,
          data: {
            success: true,
            message: response.data.EM,
            data: response.data.DT
          }
        }
      } else {
        // Error case from backend
        const errorMessage = response.data.EM || 'Có lỗi xảy ra'
        toast.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        if (response.data.EC === 0) {
          const { accessToken } = response.data.DT
          localStorage.setItem('accessToken', accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other error responses with backend format
    if (error.response?.data?.EM) {
      toast.error(error.response.data.EM)
      return Promise.reject(new Error(error.response.data.EM))
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Không thể kết nối đến server')
      return Promise.reject(new Error('Không thể kết nối đến server'))
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyForgotOTP: (data) => api.post('/auth/verify-forgot-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getEmailStatus: (email) => api.get('/users/email-status', { params: { email } }),
}

// Home API
export const homeAPI = {
  getHome: () => api.get('/home'),
  getDashboard: () => api.get('/home/dashboard'),
  getHealth: () => api.get('/health'),
}

export default api