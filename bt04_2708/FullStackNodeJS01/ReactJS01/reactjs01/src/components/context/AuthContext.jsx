import React, { createContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authAPI, userAPI } from '../../utils/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
                      setIsAuthenticated(true)
          
          // Verify token is still valid by fetching profile
          await refreshUserProfile()
        } catch (error) {
          console.error('Error initializing auth:', error)
          logout()
        }
      }
      setIsInitialized(true)
    }

    initializeAuth()
  }, [])

  const refreshUserProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      if (response.data.success) {
        const userData = response.data.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
    }
  }

  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authAPI.login(credentials.email, credentials.password)
      
      if (response.data.success) {
        const { user: userData, accessToken } = response.data.data
        
        setUser(userData)
        setIsAuthenticated(true)
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        toast.success(response.data.message || 'Đăng nhập thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Đăng nhập thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await authAPI.register(userData)
      if (response.data.success) {
        toast.success(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Đăng ký thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (email, otpCode) => {
    setLoading(true)
    try {
      const response = await authAPI.verifyEmail({ email, otpCode })
      if (response.data.success) {
        toast.success(response.data.message || 'Xác thực email thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Xác thực email thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    setLoading(true)
    try {
      const response = await authAPI.forgotPassword(email)
      if (response.data.success) {
        toast.success(response.data.message || 'Mã OTP đã được gửi đến email của bạn')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Có lỗi xảy ra'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const verifyForgotOTP = async (email, otpCode) => {
    setLoading(true)
    try {
      const response = await authAPI.verifyForgotOTP({ email, otpCode })
      if (response.data.success) {
        toast.success(response.data.message || 'Xác thực OTP thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Xác thực OTP thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (resetToken, newPassword) => {
    setLoading(true)
    try {
      const response = await authAPI.resetPassword({ resetToken, newPassword })
      if (response.data.success) {
        toast.success(response.data.message || 'Đặt lại mật khẩu thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Đặt lại mật khẩu thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true)
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword })
      if (response.data.success) {
        toast.success(response.data.message || 'Đổi mật khẩu thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Đổi mật khẩu thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async (email, type = 'email_verification') => {
    setLoading(true)
    try {
      const response = await authAPI.resendOTP({ email, type })
      if (response.data.success) {
        toast.success(response.data.message || 'Mã OTP đã được gửi lại')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Gửi lại OTP thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      toast.success('Đăng xuất thành công!')
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true)
    try {
      const response = await userAPI.updateProfile(profileData)
      if (response.data.success) {
        const updatedUser = response.data.data
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        toast.success(response.data.message || 'Cập nhật thông tin thành công!')
        return response.data
      }
    } catch (error) {
      const errorMessage = error.message || 'Cập nhật thông tin thất bại'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (requiredRoles) => {
    if (!user) return false
    
    // If requiredRoles is a string, convert to array
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    
    return roles.includes(user.role)
  }

  const isAdmin = () => hasRole(['admin'])
  const isModerator = () => hasRole(['admin', 'moderator'])

  const value = {
    user,
    loading,
    isAuthenticated,
    isInitialized,
    login,
    register,
    verifyEmail,
    logout,
    forgotPassword,
    verifyForgotOTP,
    resetPassword,
    changePassword,
    resendOTP,
    updateProfile,
    refreshUserProfile,
    hasRole,
    isAdmin,
    isModerator
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}