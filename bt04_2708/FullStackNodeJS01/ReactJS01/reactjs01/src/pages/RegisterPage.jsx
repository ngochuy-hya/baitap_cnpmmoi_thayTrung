import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Divider, Alert, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

const RegisterPage = () => {
  const [form] = Form.useForm()
  const { register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onFinish = async (values) => {
    try {
      setRegisterError('')
      const { confirmPassword: _confirmPassword, acceptTerms: _acceptTerms, ...registerData } = values
      
      // Store email for verification redirect
      localStorage.setItem('registrationEmail', registerData.email)
      
      await register(registerData)
      
      // Redirect to email verification page
      navigate('/verify-email', { 
        state: { email: registerData.email }
      })
    } catch (error) {
      setRegisterError(error.message || 'Đăng ký thất bại')
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  if (registerSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <Title level={2} className="auth-title">
                Đăng ký thành công!
              </Title>
            </div>
            
            <Alert
              message="Đăng ký thành công"
              description="Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div className="auth-footer">
              <Text>
                Đã xác thực email?{' '}
                <Link to="/login" className="auth-link">
                  Đăng nhập ngay
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <Title level={2} className="auth-title">
              Đăng ký
            </Title>
            <Text type="secondary">
              Tạo tài khoản mới để bắt đầu sử dụng ứng dụng.
            </Text>
          </div>

          {registerError && (
            <Alert
              message="Lỗi đăng ký"
              description={registerError}
              type="error"
              showIcon
              closable
              onClose={() => setRegisterError('')}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập họ và tên!'
                },
                {
                  min: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự!'
                },
                {
                  max: 50,
                  message: 'Họ và tên không được quá 50 ký tự!'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Nhập họ và tên đầy đủ"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ!'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Nhập số điện thoại (tùy chọn)"
                autoComplete="tel"
              />
            </Form.Item>

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
                prefix={<MailOutlined className="site-form-item-icon" />}
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
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu!'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng chấp nhận điều khoản sử dụng!'))
                }
              ]}
            >
              <Checkbox>
                Tôi đồng ý với{' '}
                <Link to="/terms" target="_blank">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" target="_blank">
                  Chính sách bảo mật
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-button"
                loading={loading}
                block
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <Divider>hoặc</Divider>

          <div className="auth-footer">
            <Text>
              Đã có tài khoản?{' '}
              <Link to="/login" className="auth-link">
                Đăng nhập ngay
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage