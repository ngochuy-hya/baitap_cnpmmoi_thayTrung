import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, Space, Divider } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import OTPInput from '../components/common/OTPInput'
import LoadingSpinner from '../components/common/LoadingSpinner'

const { Title, Text, Paragraph } = Typography

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendOTP, loading } = useAuth()

  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem('registrationEmail')

  useEffect(() => {
    if (!email) {
      navigate('/register')
      return
    }

    // Start countdown for resend OTP
    setCountdown(60)
  }, [email, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyOTP = async (otpValue) => {
    if (otpValue.length !== 6) return

    setIsVerifying(true)
    try {
      await verifyEmail(email, otpValue)
      localStorage.removeItem('registrationEmail')
      navigate('/login', { 
        state: { 
          message: 'Xác thực email thành công! Vui lòng đăng nhập.',
          type: 'success'
        }
      })
    } catch (error) {
      console.error('Verify email error:', error)
      setOtp('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      await resendOTP(email, 'email_verification')
      setCountdown(60)
      setOtp('')
    } catch (error) {
      console.error('Resend OTP error:', error)
    }
  }

  const handleBackToRegister = () => {
    localStorage.removeItem('registrationEmail')
    navigate('/register')
  }

  if (!email) {
    return <LoadingSpinner />
  }

  if (loading || isVerifying) {
    return <LoadingSpinner />
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 500,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <MailOutlined style={{ fontSize: 60, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>Xác thực Email</Title>
          <Paragraph type="secondary">
            Chúng tôi đã gửi mã OTP 6 số đến email của bạn
          </Paragraph>
          <Text strong style={{ color: '#1890ff' }}>{email}</Text>
        </div>

        <div style={{ marginBottom: 30 }}>
          <Text style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
            Nhập mã OTP:
          </Text>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleVerifyOTP}
            disabled={isVerifying}
          />
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            size="large"
            block
            onClick={() => handleVerifyOTP(otp)}
            disabled={otp.length !== 6 || isVerifying}
            icon={<CheckCircleOutlined />}
          >
            {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
          </Button>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Không nhận được mã OTP?</Text>
            <br />
            {countdown > 0 ? (
              <Text type="secondary">
                Gửi lại sau {countdown}s
              </Text>
            ) : (
              <Button 
                type="link" 
                onClick={handleResendOTP}
                disabled={loading}
              >
                Gửi lại mã OTP
              </Button>
            )}
          </div>

          <Button 
            type="default" 
            block 
            onClick={handleBackToRegister}
          >
            Quay lại đăng ký
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default VerifyEmailPage
