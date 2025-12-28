import React, { useEffect, useState } from 'react'
import Layout from './../../components/Layout'
import axios from 'axios'
import { Table, Tag, Button, message, Modal, Form, Input, Select, Space, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import '../../styles/Admin.css'

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form] = Form.useForm();

    const getAuthHeaders = (overrides = {}) => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...overrides,
    });

    const getUsers = async () => {
        try {
            setLoading(true)
            console.log('Fetching users list...')
            const res = await axios.get('/api/v1/admin/getAllUsers', {
                headers: getAuthHeaders({
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                }),
                params: {
                    _t: new Date().getTime() // Add timestamp to prevent caching
                }
            })
            console.log('Users API response:', res.data)
            if (res.data.success) {
                console.log('✓ Fetched users:', res.data.data.length)
                console.log('Users:', res.data.data.map(u => `${u.name} (${u.mentorStatus})`))
                setUsers(res.data.data)
            } else {
                console.error('Failed to fetch users:', res.data.message)
                message.error(res.data.message || 'Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            message.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleApproveMentor = async (userId, status) => {
        try {
            console.log('Approving mentor:', userId, 'with status:', status)
            const res = await axios.put('/api/v1/admin/approve-mentor-by-user', {
                userId,
                status
            }, {
                headers: getAuthHeaders(),
            })
            console.log('Approval response:', res.data)
            
            if (res.data.success) {
                message.success(`Mentor ${status} successfully`)
                console.log('✓ Approval successful, refreshing list...')
                // Force refresh the users list - increased delay for DB to update
                setTimeout(() => {
                    console.log('Fetching updated users list...')
                    getUsers()
                }, 1500) // Increased from 500ms to 1500ms
            } else {
                console.error('Approval failed:', res.data.message)
                message.error(res.data.message || 'Failed to update mentor status')
            }
        } catch (error) {
            console.error('Error approving mentor:', error)
            console.error('Error details:', error.response?.data || error.message)
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update mentor status'
            message.error(errorMessage)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null);
        form.resetFields();
        form.setFieldsValue({ role: 'mentee' });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        form.resetFields();
        form.setFieldsValue({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'mentee',
            mentorStatus: user.mentorStatus || undefined,
            password: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleModalSubmit = async (values) => {
        try {
            setModalLoading(true);
            const payload = {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                role: values.role,
            };
            if (values.password) {
                payload.password = values.password;
            }
            if (values.mentorStatus) {
                payload.mentorStatus = values.mentorStatus;
            }

            const res = editingUser
                ? await axios.put(`/api/v1/admin/users/${editingUser._id}`, payload, { headers: getAuthHeaders() })
                : await axios.post('/api/v1/admin/users', payload, { headers: getAuthHeaders() });

            if (res.data.success) {
                message.success(res.data.message || (editingUser ? 'User updated successfully' : 'User created successfully'));
                closeModal();
                getUsers();
            } else {
                message.error(res.data.message || 'Unable to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unable to save user';
            message.error(errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setDeletingId(userId);
            const res = await axios.delete(`/api/v1/admin/users/${userId}`, {
                headers: getAuthHeaders(),
            });
            if (res.data.success) {
                message.success(res.data.message || 'User deleted successfully');
                getUsers();
            } else {
                message.error(res.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
            message.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        getUsers()
    }, [])

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email'
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (role, record) => {
                // Note: getAllUsersController filters out admins, so this should never show ADMIN
                // But if it does, it means there's a data inconsistency
                const isAdmin = record.isAdmin === true;
                if (isAdmin) {
                    console.warn('Admin user found in Users list (should be filtered out):', record);
                }
                return (
                    <Tag color={role === 'mentor' ? 'blue' : isAdmin ? 'red' : 'green'}>
                        {isAdmin ? 'ADMIN' : (role?.toUpperCase() || 'MENTEE')}
                    </Tag>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'mentorStatus',
            render: (status) => {
                if (!status) return <Tag>PENDING</Tag>
                const colors = {
                    pending: 'orange',
                    approved: 'green',
                    rejected: 'red'
                }
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const userId = String(record._id)
                const userName = record.name

                return (
                    <div className='d-flex flex-column gap-2'>
                        <Space wrap size='small'>
                            <Button
                                size='small'
                                type='default'
                                icon={<EditOutlined />}
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    openEditModal(record)
                                }}
                            >
                                Edit
                            </Button>
                            <Popconfirm
                                title={`Delete ${userName || 'this user'}?`}
                                okText='Delete'
                                cancelText='Cancel'
                                onConfirm={() => handleDeleteUser(userId)}
                            >
                                <Button
                                    danger
                                    size='small'
                                    icon={<DeleteOutlined />}
                                    loading={deletingId === userId}
                                >
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                        <div className='d-flex gap-2'>
                            {record.mentorStatus === 'pending' && (
                                <>
                                    <Button
                                        type='primary'
                                        size='small'
                                        className='admin-action-btn'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleApproveMentor(userId, 'approved')
                                        }}
                                    >
                                        ✓ Approve
                                    </Button>
                                    <Button
                                        danger
                                        size='small'
                                        className='admin-action-btn'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleApproveMentor(userId, 'rejected')
                                        }}
                                    >
                                        ✗ Reject
                                    </Button>
                                </>
                            )}
                            {record.mentorStatus === 'approved' && (
                                <Button
                                    danger
                                    size='small'
                                    className='admin-action-btn'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleApproveMentor(userId, 'rejected')
                                    }}
                                >
                                    ✗ Revoke
                                </Button>
                            )}
                            {record.mentorStatus === 'rejected' && (
                                <Button
                                    type='primary'
                                    size='small'
                                    className='admin-action-btn'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleApproveMentor(userId, 'approved')
                                    }}
                                >
                                    ✓ Approve
                                </Button>
                            )}
                        </div>
                    </div>
                )
            }
        }
    ]
    return (
        <Layout>
            <div className="admin-page-header">
                <h1 className="admin-page-title">⚙️ Mentor & User Management</h1>
                <p className="admin-page-subtitle">Approve mentors and perform CRUD operations on the user base from one place.</p>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
            }}>
                <Button
                    type="primary"
                    onClick={() => {
                        console.log('Manual refresh triggered')
                        getUsers()
                    }}
                    loading={loading}
                    className="refresh-btn"
                >
                    🔄 Refresh List
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} className="refresh-btn">
                    Add User
                </Button>
            </div>
            <div className="admin-table">
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </div>
            <Modal
                title={editingUser ? `Edit ${editingUser.name || 'User'}` : 'Create user'}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText={editingUser ? 'Save changes' : 'Create user'}
                confirmLoading={modalLoading}
                destroyOnClose
            >
                <Form form={form} layout='vertical' onFinish={handleModalSubmit}>
                    <Form.Item name='name' label='Full name' rules={[{ required: true, message: 'Please add a name' }]}>
                        <Input placeholder='Full name' />
                    </Form.Item>
                    <Form.Item
                        name='email'
                        label='Email'
                        rules={[{ type: 'email', required: true, message: 'Valid email is required' }]}
                    >
                        <Input placeholder='Email address' />
                    </Form.Item>
                    <Form.Item
                        name='role'
                        label='Role'
                        rules={[{ required: true, message: 'Role is required' }]}
                    >
                        <Select
                            options={[
                                { label: 'Mentee', value: 'mentee' },
                                { label: 'Mentor', value: 'mentor' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name='mentorStatus' label='Mentor status'>
                        <Select
                            allowClear
                            placeholder='Optional mentor status'
                            options={[
                                { label: 'Pending', value: 'pending' },
                                { label: 'Approved', value: 'approved' },
                                { label: 'Rejected', value: 'rejected' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        name='password'
                        label='Password'
                        rules={[
                            {
                                required: !editingUser,
                                message: 'Password is required for new users',
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder={editingUser ? 'Leave blank to keep current password' : 'Use a strong password'}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    )
}

export default Users;