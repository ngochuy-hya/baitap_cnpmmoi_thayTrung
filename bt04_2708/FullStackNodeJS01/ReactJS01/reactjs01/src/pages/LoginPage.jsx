import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Divider, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginError, setLoginError] = useState('')

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const onFinish = async (values) => {
    try {
      setLoginError('')
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      setLoginError(error.message || 'Đăng nhập thất bại')
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <Title level={2} className="auth-title">
              Đăng nhập
            </Title>
            <Text type="secondary">
              Chào mừng bạn trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
            </Text>
          </div>

          {loginError && (
            <Alert
              message="Lỗi đăng nhập"
              description={loginError}
              type="error"
              showIcon
              closable
              onClose={() => setLoginError('')}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập email!'
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ!'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Nhập email của bạn"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu!'
                },
                {
                  min: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự!'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <div className="auth-actions">
                <Link to="/forgot-password" className="forgot-password-link">
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-button"
                loading={loading}
                block
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider>hoặc</Divider>

          <div className="auth-footer">
            <Text>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-link">
                Đăng ký ngay
              </Link>
            </Text>
          </div>

          {/* Demo accounts */}
          <div className="demo-accounts">
            <Divider>Tài khoản demo</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                size="small" 
                type="dashed"
                block
                onClick={() => {
                  form.setFieldsValue({
                    email: 'admin@example.com',
                    password: 'admin123'
                  })
                }}
              >
                Admin Demo (admin@example.com / admin123)
              </Button>
              <Button 
                size="small" 
                type="dashed"
                block
                onClick={() => {
                  form.setFieldsValue({
                    email: 'user@example.com',
                    password: 'user123'
                  })
                }}
              >
                User Demo (user@example.com / user123)
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage