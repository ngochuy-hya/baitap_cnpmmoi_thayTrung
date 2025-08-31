import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Result } from 'antd'
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

const ResetPasswordPage = () => {
  const [form] = Form.useForm()
  const { resetPassword, loading, isAuthenticated } = useAuth()
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
    
    // Kiểm tra token có tồn tại không
    if (!token) {
      setTokenValid(false)
    }
  }, [isAuthenticated, navigate, token])

  const onFinish = async (values) => {
    try {
      setError('')
      await resetPassword(token, values.password)
      setSuccess(true)
    } catch (error) {
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        setTokenValid(false)
      } else {
        setError(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu')
      }
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  // Token không hợp lệ hoặc hết hạn
  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="error"
              title="Link không hợp lệ"
              subTitle="Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới."
              extra={[
                <Button type="primary" key="forgot" onClick={() => navigate('/forgot-password')}>
                  Yêu cầu link mới
                </Button>,
                <Button key="login" onClick={() => navigate('/login')}>
                  Về trang đăng nhập
                </Button>
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  // Đặt lại mật khẩu thành công
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="success"
              title="Đặt lại mật khẩu thành công!"
              subTitle="Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới."
              extra={[
                <Button type="primary" key="login" onClick={() => navigate('/login')}>
                  Đăng nhập ngay
                </Button>
              ]}
            />
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
              Đặt lại mật khẩu
            </Title>
            <Text type="secondary">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Text>
          </div>

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="resetPassword"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu mới!'
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
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu mới!'
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
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-button"
                loading={loading}
                block
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <Link to="/login">
              Quay lại đăng nhập
            </Link>
          </div>

          <div className="password-requirements">
            <Alert
              message="Yêu cầu mật khẩu"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Ít nhất 6 ký tự</li>
                  <li>Chứa ít nhất 1 chữ cái viết hoa</li>
                  <li>Chứa ít nhất 1 chữ cái viết thường</li>
                  <li>Chứa ít nhất 1 chữ số</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage