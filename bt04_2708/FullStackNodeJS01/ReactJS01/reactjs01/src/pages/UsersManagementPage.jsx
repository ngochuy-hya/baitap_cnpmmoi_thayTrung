import React, { useState, useEffect } from 'react'
import { 
  Table, Button, Card, Space, Typography, Input, Select, 
  Modal, Form, Tag, Popconfirm, message, Avatar, Tooltip
} from 'antd'
import { 
  UserOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, PlusOutlined, ReloadOutlined,
  EyeOutlined, MailOutlined
} from '@ant-design/icons'
import { userAPI } from '../utils/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

const { Title } = Typography
const { Option } = Select

const UsersManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  })
  const [searchText, setSearchText] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit'
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [pagination.current, pagination.pageSize, searchText])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userAPI.getAllUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText
      })

      if (response.data.success) {
        const { users: userList, pagination: paginationInfo } = response.data.data
        setUsers(userList)
        setPagination(prev => ({
          ...prev,
          total: paginationInfo.totalUsers,
          current: paginationInfo.currentPage
        }))
      }
    } catch (error) {
      console.error('Fetch users error:', error)
      message.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }))
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setModalType('view')
    setModalVisible(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setModalType('edit')
    form.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      role: user.role
    })
    setModalVisible(true)
  }

  const handleUpdateUser = async (values) => {
    try {
      const response = await userAPI.updateUser(selectedUser.id, values)
      if (response.data.success) {
        message.success('Cập nhật người dùng thành công')
        setModalVisible(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Update user error:', error)
      message.error('Cập nhật người dùng thất bại')
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await userAPI.deleteUser(userId)
      if (response.data.success) {
        message.success('Xóa người dùng thành công')
        fetchUsers()
      }
    } catch (error) {
      console.error('Delete user error:', error)
      message.error('Xóa người dùng thất bại')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'red'
      case 'pending': return 'orange'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động'
      case 'inactive': return 'Không hoạt động'
      case 'pending': return 'Chờ xác thực'
      default: return status
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'purple'
      case 'moderator': return 'blue'
      case 'user': return 'default'
      default: return 'default'
    }
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên'
      case 'moderator': return 'Điều hành viên'
      case 'user': return 'Người dùng'
      default: return role
    }
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (text, record, index) => (
        <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
      )
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (text, record) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.fullName || 'Chưa cập nhật'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined /> {record.email}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'Chưa cập nhật'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
        { text: 'Chờ xác thực', value: 'pending' },
      ]
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
      filters: [
        { text: 'Quản trị viên', value: 'admin' },
        { text: 'Điều hành viên', value: 'moderator' },
        { text: 'Người dùng', value: 'user' },
      ]
    },
    {
      title: 'Email đã xác thực',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'red'}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (text, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  if (loading && users.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <UserOutlined /> Quản lý người dùng
          </Title>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchUsers}
            loading={loading}
          >
            Tải lại
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên hoặc email..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* User Detail/Edit Modal */}
      <Modal
        title={modalType === 'view' ? 'Chi tiết người dùng' : 'Chỉnh sửa người dùng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalType === 'view' ? [
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Cập nhật
          </Button>
        ]}
        width={600}
      >
        {selectedUser && (
          <div>
            {modalType === 'view' ? (
              <div>
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <Avatar size={80} icon={<UserOutlined />} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Họ tên:</strong> {selectedUser.fullName || 'Chưa cập nhật'}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Số điện thoại:</strong> {selectedUser.phone || 'Chưa cập nhật'}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Trạng thái:</strong> 
                  <Tag color={getStatusColor(selectedUser.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedUser.status)}
                  </Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Vai trò:</strong> 
                  <Tag color={getRoleColor(selectedUser.role)} style={{ marginLeft: 8 }}>
                    {getRoleText(selectedUser.role)}
                  </Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Email đã xác thực:</strong> 
                  <Tag color={selectedUser.isEmailVerified ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                    {selectedUser.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Ngày tạo:</strong> {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateUser}
              >
                <Form.Item
                  label="Họ tên"
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Trạng thái"
                  name="status"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select>
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                    <Option value="pending">Chờ xác thực</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Vai trò"
                  name="role"
                  rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                  <Select>
                    <Option value="user">Người dùng</Option>
                    <Option value="moderator">Điều hành viên</Option>
                    <Option value="admin">Quản trị viên</Option>
                  </Select>
                </Form.Item>
              </Form>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UsersManagementPage
