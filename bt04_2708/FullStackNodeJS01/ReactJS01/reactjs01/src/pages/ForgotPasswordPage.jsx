import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Result } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

const ForgotPasswordPage = () => {
  const [form] = Form.useForm()
  const { forgotPassword, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onFinish = async (values) => {
    try {
      setError('')
      await forgotPassword(values.email)
      setEmail(values.email)
      setSuccess(true)
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi gửi email khôi phục')
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const handleRetry = () => {
    setSuccess(false)
    setError('')
    form.resetFields()
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="success"
              title="Email đã được gửi!"
              subTitle={
                <div>
                  <p>Chúng tôi đã gửi link đặt lại mật khẩu đến email:</p>
                  <strong>{email}</strong>
                  <p>Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.</p>
                </div>
              }
              extra={[
                <Button type="primary" key="login" onClick={() => navigate('/login')}>
                  Về trang đăng nhập
                </Button>,
                <Button key="retry" onClick={handleRetry}>
                  Gửi lại email
                </Button>
              ]}
            />
            
            <div className="auth-footer" style={{ textAlign: 'center', marginTop: 24 }}>
              <Text type="secondary">
                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                <Button type="link" onClick={handleRetry} style={{ padding: 0 }}>
                  thử lại
                </Button>
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
              Quên mật khẩu?
            </Title>
            <Text type="secondary">
              Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
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
            name="forgotPassword"
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
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Nhập email của bạn"
                autoComplete="email"
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
                Gửi link đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Link>
          </div>

          <div className="forgot-password-info">
            <Alert
              message="Lưu ý"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Link đặt lại mật khẩu có hiệu lực trong 15 phút</li>
                  <li>Kiểm tra cả thư mục spam nếu không thấy email</li>
                  <li>Chỉ có thể yêu cầu đặt lại mật khẩu 3 lần trong 1 giờ</li>
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

export default ForgotPasswordPage