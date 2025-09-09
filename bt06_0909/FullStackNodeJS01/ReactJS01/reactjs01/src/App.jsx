import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './components/context/AuthContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import AdvancedSearch from './pages/AdvancedSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const { Footer } = Layout;

// Loading component
const PageLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  }}>
    <Spin size="large" />
  </div>
);

// Footer component
const AppFooter = () => (
  <Footer style={{ 
    textAlign: 'center',
    backgroundColor: '#001529',
    color: '#fff',
    marginTop: 40
  }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ color: '#fff', marginBottom: 8 }}>🛒 EcommerceShop</h3>
        <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0 }}>
          Nền tảng mua sắm trực tuyến hàng đầu
        </p>
      </div>
      
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 16,
        color: 'rgba(255,255,255,0.65)'
      }}>
        © 2024 EcommerceShop. Tất cả quyền được bảo lưu.
        <br />
        Được xây dựng với ❤️ bởi React + Node.js
      </div>
    </div>
  </Footer>
);

// Ant Design theme config
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemHoverColor: '#fff',
      darkItemSelectedColor: '#fff',
      darkItemSelectedBg: '#1890ff',
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <AuthProvider>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header />
            
            <Layout style={{ paddingTop: 64 }}>
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/category/:categorySlug" element={<Products />} />
                  <Route path="/search" element={<AdvancedSearch />} />
                  <Route path="/advanced-search" element={<AdvancedSearch />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Product Detail Route */}
                  <Route 
                    path="/products/:slug" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Product Detail Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  {/* User Routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>User Profile Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/cart" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Shopping Cart Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/orders" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Orders Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  {/* Password Reset Routes */}
                  <Route 
                    path="/forgot-password" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Forgot Password Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/reset-password" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Reset Password Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  {/* Static Pages */}
                  <Route 
                    path="/about" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>About Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/contact" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Contact Page (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/terms" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Terms of Service (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/privacy" 
                    element={
                      <Suspense fallback={<PageLoading />}>
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          minHeight: '50vh',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <h2>Privacy Policy (Coming Soon)</h2>
                        </div>
                      </Suspense>
                    } 
                  />
                  
                  {/* 404 Page */}
                  <Route 
                    path="*" 
                    element={
                      <div style={{ 
                        padding: '20px',
                        textAlign: 'center',
                        minHeight: '50vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <h1 style={{ fontSize: '72px', margin: 0, color: '#ccc' }}>404</h1>
                        <h2>Trang không tìm thấy</h2>
                        <p>Trang bạn đang tìm kiếm không tồn tại.</p>
                        <a href="/" style={{ color: '#1890ff' }}>
                          Quay về trang chủ
        </a>
      </div>
                    } 
                  />
                </Routes>
              </Suspense>
            </Layout>
            
            <AppFooter />
          </Layout>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;