import { useContext } from 'react';
import AuthContext from '../components/context/AuthContext';

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// Helper function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};
