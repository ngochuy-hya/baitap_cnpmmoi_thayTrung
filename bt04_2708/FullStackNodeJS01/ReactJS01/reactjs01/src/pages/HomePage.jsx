import React, { useState, useEffect } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Badge, 
  Button, 
  Space, 
  Typography, 
  Avatar,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Alert
} from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  CrownOutlined, 
  SafetyCertificateOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { homeAPI, userAPI } from '../utils/api'

const { Title, Text } = Typography
const { confirm } = Modal

const HomePage = () => {
  const { user, hasRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    moderatorUsers: 0
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load dashboard data
      const dashboardResponse = await homeAPI.getDashboard()
      console.log('Dashboard Response:', dashboardResponse)
      
      // Mock data for now since we don't have user management API yet
      const mockUsers = [
        {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          email: 'moderator@example.com',
          firstName: 'Mod',
          lastName: 'User',
          role: 'moderator',
          status: 'active',
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          email: 'user@example.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          status: 'active',
          createdAt: '2024-01-03T00:00:00Z'
        }
      ]
      
      setUsers(mockUsers)
      
      // Calculate stats
      const totalUsers = mockUsers.length
      const activeUsers = mockUsers.filter(u => u.status === 'active').length
      const adminUsers = mockUsers.filter(u => u.role === 'admin').length
      const moderatorUsers = mockUsers.filter(u => u.role === 'moderator').length
      
      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        moderatorUsers
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      message.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      role: record.role,
      status: record.status
    })
    setEditModalVisible(true)
  }

  const handleDeleteUser = (record) => {
    confirm({
      title: 'Xác nhận xóa user',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa user ${record.firstName} ${record.lastName}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Mock delete action
        message.success('Đã xóa user thành công')
        loadDashboardData()
      }
    })
  }

  const handleUpdateUser = async (values) => {
    try {
      // Mock update action - trong thực tế sẽ gọi API với values
      console.log('Updating user with:', values)
      message.success(`Cập nhật user ${editingUser?.firstName} thành công`)
      setEditModalVisible(false)
      setEditingUser(null)
      form.resetFields()
      loadDashboardData()
    } catch (error) {
      console.error('Update user error:', error)
      message.error('Cập nhật user thất bại')
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

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_, record) => (
        <Avatar size="default" icon={<UserOutlined />}>
          {record.firstName?.charAt(0)?.toUpperCase()}
        </Avatar>
      )
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={status?.toUpperCase()} 
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {hasRole('moderator') && (
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            >
              Sửa
            </Button>
          )}
          {hasRole('admin') && record.role !== 'admin' && (
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record)}
            >
              Xóa
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="homepage">
      <div className="homepage-header">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">
          Chào mừng {user?.firstName} {user?.lastName} ({user?.role})
        </Text>
      </div>

      {/* Welcome Alert */}
      <Alert
        message={`Chào mừng ${user?.firstName}!`}
        description={`Bạn đang đăng nhập với quyền ${user?.role}. Hệ thống đang hoạt động bình thường.`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.activeUsers}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={stats.adminUsers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điều hành viên"
              value={stats.moderatorUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* User Management Table (Admin/Moderator only) */}
      {hasRole('moderator') && (
        <Card 
          title="Quản lý người dùng" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadDashboardData}
              loading={loading}
            >
              Tải lại
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} người dùng`
            }}
          />
        </Card>
      )}

      {/* User info for regular users */}
      {!hasRole('moderator') && (
        <Card title="Thông tin tài khoản">
          <Row gutter={[16, 16]}>
            <Col span={4}>
              <Avatar size={64} icon={<UserOutlined />}>
                {user?.firstName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Col>
            <Col span={20}>
              <Space direction="vertical">
                <Title level={4}>{user?.firstName} {user?.lastName}</Title>
                <Text>Email: {user?.email}</Text>
                <Space>
                  <Tag color={getRoleColor(user?.role)}>
                    {user?.role?.toUpperCase()}
                  </Tag>
                  <Badge 
                    status={getStatusColor(user?.status)} 
                    text={user?.status?.toUpperCase()} 
                  />
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal
        title={`Chỉnh sửa người dùng: ${editingUser?.firstName} ${editingUser?.lastName}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="moderator">Moderator</Select.Option>
              {hasRole('admin') && (
                <Select.Option value="admin">Admin</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="banned">Banned</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default HomePage