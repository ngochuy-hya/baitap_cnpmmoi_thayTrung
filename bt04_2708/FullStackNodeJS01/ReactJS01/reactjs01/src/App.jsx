import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'

// Public Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyForgotOTPPage from './pages/VerifyForgotOTPPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Protected Pages
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import UsersManagementPage from './pages/UsersManagementPage'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Theme configuration - moved outside component to prevent recreation
const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      triggerBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#001529',
    },
  },
}

function App() {
  const { isInitialized, loading } = useAuth()

  // Show loading while initializing authentication
  if (!isInitialized || loading) {
    return <LoadingSpinner />
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="App">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-forgot-otp" element={<VerifyForgotOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Main Pages */}
            <Route index element={<HomePage />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="dashboard" element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Admin Routes */}
            <Route path="admin">
              <Route path="users" element={
                <AdminRoute requiredRoles={['admin']}>
                  <UsersManagementPage />
                </AdminRoute>
              } />
            </Route>
          </Route>

          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}

export default App