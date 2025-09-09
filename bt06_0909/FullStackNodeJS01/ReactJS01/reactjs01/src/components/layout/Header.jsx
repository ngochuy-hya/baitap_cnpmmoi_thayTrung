import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Input, 
  Badge, 
  Avatar, 
  Dropdown, 
  Button, 
  Space,
  Drawer,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/auth.jsx';
import { categoryAPI, debounce } from '../../utils/api';
import SearchSuggestions from '../SearchSuggestions';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Load categories for menu
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryAPI.getRootCategories();
        if (response.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    }
  }, 500);

  // Handle search
  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <AppstoreOutlined />,
      label: 'Đơn hàng của tôi',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  // Main menu items
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: <Link to="/products">Sản phẩm</Link>,
      children: categories.map(category => ({
        key: `category-${category.id}`,
        label: <Link to={`/products/category/${category.slug}`}>{category.name}</Link>,
      })),
    },
  ];

  // Get current menu key based on location
  const getCurrentMenuKey = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/products')) return 'products';
    return '';
  };

  return (
    <AntHeader className="header" style={{ 
      position: 'fixed', 
      zIndex: 1000, 
      width: '100%', 
      padding: '0 24px',
      backgroundColor: '#001529',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div className="header-content" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '64px'
      }}>
        {/* Logo */}
        <div className="logo" style={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: '200px'
        }}>
          <Link to="/" style={{ 
            color: '#fff', 
            fontSize: '24px', 
            fontWeight: 'bold',
            textDecoration: 'none' 
          }}>
            🛒 EcommerceShop
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ 
          display: 'none',
          flex: 1,
          justifyContent: 'center'
        }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[getCurrentMenuKey()]}
            items={menuItems}
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              minWidth: '300px'
            }}
          />
        </div>

        {/* Search Bar */}
        <div className="search-bar" style={{ 
          flex: 1,
          maxWidth: '400px',
          margin: '0 24px'
        }}>
          <SearchSuggestions
            placeholder="Tìm kiếm sản phẩm với gợi ý thông minh..."
            size="large"
            showPopular={true}
            style={{ width: '100%' }}
          />
        </div>

        {/* Right Actions */}
        <div className="header-actions" style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Shopping Cart */}
          <Badge count={0} showZero={false}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#fff' }} />}
              onClick={() => navigate('/cart')}
              style={{ 
                border: 'none',
                height: '40px',
                display: 'flex',
                alignItems: 'center'
              }}
            />
          </Badge>

          {/* User Menu */}
          {!loading && (
            <>
              {isAuthenticated ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    style={{ 
                      border: 'none',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#fff'
                    }}
                  >
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      src={user?.avatar}
                    />
                    <Text style={{ color: '#fff' }}>
                      {user?.full_name || 'User'}
                    </Text>
                  </Button>
                </Dropdown>
              ) : (
                <Space>
                  <Button
                    type="text"
                    icon={<LoginOutlined />}
                    onClick={() => navigate('/login')}
                    style={{ color: '#fff' }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate('/register')}
                    size="middle"
                  >
                    Đăng ký
                  </Button>
                </Space>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: '#fff' }} />}
            onClick={() => setMobileMenuVisible(true)}
            className="mobile-menu-button"
            style={{ 
              display: 'none',
              border: 'none',
              height: '40px'
            }}
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          onClick={() => setMobileMenuVisible(false)}
        />
        
        {!isAuthenticated && (
          <div style={{ padding: '16px 0', borderTop: '1px solid #f0f0f0', marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                icon={<LoginOutlined />}
                onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/login');
                }}
              >
                Đăng nhập
              </Button>
              <Button
                block
                onClick={() => {
                  setMobileMenuVisible(false);
                  navigate('/register');
                }}
              >
                Đăng ký
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-menu-button {
            display: flex !important;
          }
          
          .search-bar {
            max-width: 200px !important;
            margin: 0 12px !important;
          }
          
          .logo {
            min-width: 150px !important;
          }
          
          .header-content {
            padding: 0 12px !important;
          }
        }
        
        @media (max-width: 576px) {
          .search-bar {
            max-width: 150px !important;
            margin: 0 8px !important;
          }
          
          .logo {
            min-width: 120px !important;
            font-size: 18px !important;
          }
        }
      `}</style>
    </AntHeader>
  );
};

export default Header;
