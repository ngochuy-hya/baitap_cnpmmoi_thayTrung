import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  theme,
  Typography,
  Space,
  Badge
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BellOutlined
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Menu items
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    ...(isAdmin() ? [{
      key: '/admin',
      icon: <UsergroupAddOutlined />,
      label: 'Quản lý',
      children: [
        {
          key: '/admin/users',
          label: 'Quản lý Users',
        },
      ],
    }] : []),
  ]

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
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
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
    if (isMobile) {
      setCollapsed(true)
    }
  }

  const getSelectedKeys = () => {
    const pathname = location.pathname
    if (pathname.startsWith('/admin/users')) return ['/admin/users']
    if (pathname.startsWith('/admin')) return ['/admin']
    return [pathname]
  }

  const siderStyle = isMobile ? {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
    transition: 'transform 0.3s ease',
  } : {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
  }

  const layoutStyle = isMobile ? {
    marginLeft: 0
  } : {
    marginLeft: collapsed ? 80 : 200,
    transition: 'all 0.2s'
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}

      <AntLayout style={{ minHeight: '100vh' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={siderStyle}
          width={200}
          collapsedWidth={isMobile ? 0 : 80}
        >
          <div className="logo" style={{
            height: '64px',
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {collapsed && !isMobile ? 'FS' : 'FullStack'}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        
        <AntLayout style={layoutStyle}>
          <Header
            style={{
              padding: '0 24px',
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            
            <Space size="middle">
              {!isMobile && (
                <Text style={{ color: '#666' }}>
                  Xin chào, <Text strong>{user?.fullName || user?.email}</Text>!
                </Text>
              )}
              
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ fontSize: '16px' }}
                />
              </Badge>
              
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                />
              </Dropdown>
            </Space>
          </Header>
          
          <Content
            style={{
              margin: isMobile ? '16px 8px 0' : '24px 16px 0',
              overflow: 'initial',
            }}
          >
            <div
              style={{
                padding: isMobile ? 16 : 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: '8px',
              }}
            >
              <Outlet />
            </div>
          </Content>
        </AntLayout>
      </AntLayout>
    </>
  )
}

export default Layout