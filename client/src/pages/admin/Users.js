import React, { useEffect, useState } from 'react'
import Layout from './../../components/Layout'
import axios from 'axios'
import { Table, Tag, Button, message } from 'antd'
import '../../styles/Admin.css'

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const getUsers = async () => {
        try {
            setLoading(true)
            console.log('Fetching users list...')
            const res = await axios.get('/api/v1/admin/getAllUsers', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
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
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
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
                // Capture the record ID in a const to ensure closure works correctly
                const userId = String(record._id)
                const userName = record.name
                const userEmail = record.email
                
                console.log('Rendering actions for:', userName, 'ID:', userId, 'Role:', record.role, 'Status:', record.mentorStatus)
                
                return (
                    <div className='d-flex gap-2'>
                        {record.role === 'mentor' && record.mentorStatus === 'pending' && (
                            <>
                                <Button
                                    type="primary"
                                    size="small"
                                    className="admin-action-btn"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log('=== APPROVE BUTTON CLICKED ===')
                                        console.log('User name:', userName)
                                        console.log('User email:', userEmail)
                                        console.log('User ID (captured):', userId)
                                        console.log('User ID (from record):', record._id)
                                        console.log('==============================')
                                        handleApproveMentor(userId, 'approved')
                                    }}
                                >
                                    ✓ Approve
                                </Button>
                                <Button
                                    danger
                                    size="small"
                                    className="admin-action-btn"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log('Reject button clicked for:', userName, userId)
                                        handleApproveMentor(userId, 'rejected')
                                    }}
                                >
                                    ✗ Reject
                                </Button>
                            </>
                        )}
                        {record.role === 'mentor' && record.mentorStatus === 'approved' && (
                            <Button
                                danger
                                size="small"
                                className="admin-action-btn"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('Revoke button clicked for:', userName, userId)
                                    handleApproveMentor(userId, 'rejected')
                                }}
                            >
                                ✗ Revoke
                            </Button>
                        )}
                        {record.role === 'mentor' && record.mentorStatus === 'rejected' && (
                            <Button
                                type="primary"
                                size="small"
                                className="admin-action-btn"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('Re-approve button clicked for:', userName, userId)
                                    handleApproveMentor(userId, 'approved')
                                }}
                            >
                                ✓ Approve
                            </Button>
                        )}
                    </div>
                )
            }
        }
    ]
    return (
        <Layout>
            <div className="admin-page-header">
                <h1 className="admin-page-title">⚙️ Mentor Approval</h1>
                <p className="admin-page-subtitle">Approve or reject mentor applications. Mentees are automatically approved upon registration.</p>
            </div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '20px'
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
        </Layout>
    )
}

export default Users;