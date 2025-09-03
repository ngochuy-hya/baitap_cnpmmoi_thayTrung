import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider,
  Alert,
  Progress,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth.jsx';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated } = useAuth();
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    return Math.min(score, 100);
  };

  const handlePasswordChange = (e) => {
    const password = e?.target?.value || '';
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return '#ff4d4f';
    if (passwordStrength < 60) return '#faad14';
    if (passwordStrength < 80) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Yếu';
    if (passwordStrength < 60) return 'Trung bình';
    if (passwordStrength < 80) return 'Khá mạnh';
    return 'Rất mạnh';
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      
      // Remove confirm_password from values
      const { confirm_password: _confirm_password, ...userData } = values;
      
      console.log('User data to submit:', userData);
      
      const result = await register(userData);
      
      console.log('Register result:', result);
      
      if (result && result.success) {
        // Redirect to login with success message
        navigate('/login', { 
          state: { 
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.' 
          }
        });
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#001529' }}>
            🛒 EcommerceShop
          </Title>
          <Text type="secondary">
            Tạo tài khoản mới
          </Text>
        </div>

        {error && (
          <Alert
            message="Đăng ký thất bại"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
              { max: 50, message: 'Họ và tên không được quá 50 ký tự!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại (tùy chọn)"
            rules={[
              { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' },
              { min: 10, message: 'Số điện thoại phải có ít nhất 10 số!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ (tùy chọn)"
            rules={[
              { max: 200, message: 'Địa chỉ không được quá 200 ký tự!' }
            ]}
          >
            <Input.TextArea
              prefix={<HomeOutlined />}
              placeholder="Nhập địa chỉ"
              rows={2}
              autoComplete="address"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </Form.Item>

          {/* Password Strength Indicator */}
          {form.getFieldValue('password') && (
            <div style={{ marginTop: -16, marginBottom: 16 }}>
              <Progress
                percent={passwordStrength}
                strokeColor={getPasswordStrengthColor()}
                showInfo={false}
                size="small"
              />
              <Text style={{ fontSize: '12px', color: getPasswordStrengthColor() }}>
                Độ mạnh mật khẩu: {getPasswordStrengthText()}
              </Text>
            </div>
          )}

          <Form.Item
            name="confirm_password"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue('password');
                  if (!value || !password || password === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            >
              Tôi đồng ý với{' '}
              <Link to="/terms" target="_blank">
                <Text strong>Điều khoản sử dụng</Text>
              </Link>
              {' '}và{' '}
              <Link to="/privacy" target="_blank">
                <Text strong>Chính sách bảo mật</Text>
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!agreedToTerms}
              block
              size="large"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc</Divider>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Text>
              Đã có tài khoản?{' '}
              <Link to="/login">
                <Text strong>Đăng nhập ngay</Text>
              </Link>
            </Text>
            
            <Link to="/">
              <Button type="default" block>
                Quay về trang chủ
              </Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Register;
