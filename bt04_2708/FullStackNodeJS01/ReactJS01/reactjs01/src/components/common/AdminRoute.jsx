import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

const AdminRoute = ({ children, requiredRoles = ['admin'] }) => {
  const { isAuthenticated, user, loading, isInitialized } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  const hasRequiredRole = user && requiredRoles.includes(user.role)

  if (!hasRequiredRole) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      </div>
    )
  }

  return children
}

export default AdminRoute
