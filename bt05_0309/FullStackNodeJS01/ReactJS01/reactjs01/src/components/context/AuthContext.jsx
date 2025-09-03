import React, { createContext, useReducer, useEffect } from 'react';
import { authAPI, userAPI, storage } from '../../utils/api';
import { message } from 'antd';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
      
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = storage.get('accessToken');
        const savedUser = storage.get('user');
        
        if (token && savedUser) {
          // Verify token by fetching user profile
          const response = await userAPI.getProfile();
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear invalid token
        storage.remove('accessToken');
        storage.remove('user');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, accessToken } = response.data;
        
        // Save to localStorage
        storage.set('accessToken', accessToken);
        storage.set('user', user);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: user,
            token: accessToken,
          },
        });
        
        message.success('Đăng nhập thành công!');
        return { success: true, user };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.message || error?.data?.message || 'Đăng nhập thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error?.message || error?.data?.message || 'Đăng ký thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      storage.remove('accessToken');
      storage.remove('user');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      message.success('Đăng xuất thành công!');
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await userAPI.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        
        // Update localStorage
        storage.set('user', updatedUser);
        
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: updatedUser,
        });
        
        message.success('Cập nhật thông tin thành công!');
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.message || 'Cập nhật thông tin thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await userAPI.changePassword(passwordData);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        message.success('Đổi mật khẩu thành công!');
        return { success: true };
      }
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.message || 'Đổi mật khẩu thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        message.success('Email khôi phục mật khẩu đã được gửi!');
        return { success: true };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.message || 'Gửi email khôi phục thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.resetPassword(token, newPassword);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        message.success('Đặt lại mật khẩu thành công!');
        return { success: true };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.message || 'Đặt lại mật khẩu thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has role
  const hasRole = (roleName) => {
    return state.user?.role_name === roleName;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is staff
  const isStaff = () => {
    return hasRole('staff') || hasRole('admin');
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Functions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    
    // Utilities
    hasRole,
    isAdmin,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
