import React, { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Upload, 
  message, 
  Row, 
  Col, 
  Divider,
  Tag,
  Badge,
  Space,
  Modal,
  Typography
} from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EditOutlined,
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography
const { confirm } = Modal

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const handleEditProfile = () => {
    setEditMode(true)
    form.setFieldsValue({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: user?.phone || ''
    })
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    form.resetFields()
  }

  const handleSaveProfile = async (values) => {
    setLoading(true)
    try {
      // Mock API call - in real app, call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local user data
      const updatedUser = { ...user, ...values }
      updateUser(updatedUser)
      
      message.success('Cập nhật thông tin thành công!')
      setEditMode(false)
    } catch (error) {
      message.error('Cập nhật thông tin thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values) => {
    setLoading(true)
    try {
      // Mock API call - in real app, call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('Đổi mật khẩu thành công!')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error) {
      message.error('Đổi mật khẩu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('Cập nhật ảnh đại diện thành công!')
    } else if (info.file.status === 'error') {
      message.error('Cập nhật ảnh đại diện thất bại!')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red'
      case 'moderator': return 'blue'
      case 'user': return 'green'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'banned': return 'error'
      default: return 'default'
    }
  }

  const uploadProps = {
    name: 'avatar',
    action: '/api/upload/avatar',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`
    },
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('Chỉ có thể upload file JPG/PNG!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('Kích thước ảnh phải nhỏ hơn 2MB!')
        return false
      }
      return true
    },
    onChange: handleAvatarChange
  }

  return (
    <div className="profile-page" style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2}>Thông tin cá nhân</Title>
      
      {/* Avatar and Basic Info Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />}
                src={user?.avatar}
                style={{ border: '4px solid #f0f0f0' }}
              >
                {user?.firstName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Upload {...uploadProps} showUploadList={false}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    border: '2px solid white'
                  }}
                />
              </Upload>
            </div>
          </Col>
          
          <Col xs={24} sm={16} md={18}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {user?.firstName} {user?.lastName}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {user?.email}
              </Text>
              <Space>
                <Tag color={getRoleColor(user?.role)}>
                  {user?.role?.toUpperCase()}
                </Tag>
                <Badge 
                  status={getStatusColor(user?.status)} 
                  text={user?.status?.toUpperCase()} 
                />
              </Space>
              <Text type="secondary">
                Tham gia từ: {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Profile Information Form */}
      <Card 
        title="Thông tin chi tiết"
        extra={
          !editMode ? (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEditProfile}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          disabled={!editMode}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ"
                name="firstName"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ!' },
                  { min: 1, max: 25, message: 'Họ phải từ 1-25 ký tự!' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên"
                name="lastName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên!' },
                  { min: 1, max: 25, message: 'Tên phải từ 1-25 ký tự!' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Nhập email"
              disabled // Email usually shouldn't be editable
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
          </Form.Item>

          {editMode && (
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Lưu thay đổi
                </Button>
                <Button onClick={handleCancelEdit}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Card>

      {/* Security Settings */}
      <Card title="Bảo mật">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Mật khẩu</Text>
              <br />
              <Text type="secondary">Đổi mật khẩu để bảo mật tài khoản</Text>
            </div>
            <Button 
              icon={<LockOutlined />}
              onClick={() => setPasswordModalVisible(true)}
            >
              Đổi mật khẩu
            </Button>
          </div>
          
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Xác thực hai yếu tố</Text>
              <br />
              <Text type="secondary">Tăng cường bảo mật cho tài khoản</Text>
            </div>
            <Button disabled>
              Sắp ra mắt
            </Button>
          </div>
        </Space>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                Đổi mật khẩu
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfilePage
