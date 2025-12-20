import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { Card, Row, Col, Statistic, message } from 'antd'
import { UserOutlined, UserAddOutlined, CalendarOutlined, MessageOutlined, ShoppingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const res = await axios.get('/api/v1/admin/dashboard-stats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if (res.data.success) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.log(error)
            message.error('Failed to fetch dashboard statistics')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <h2 className='text-center mb-4'>Admin Dashboard</h2>
            {loading ? (
                <div className='text-center'>Loading...</div>
            ) : stats ? (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Users"
                                value={stats.totalUsers}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Mentors"
                                value={stats.totalMentors}
                                prefix={<UserAddOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Mentees"
                                value={stats.totalMentees}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Sessions"
                                value={stats.totalSessions}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Pending Sessions"
                                value={stats.pendingSessions}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Completed Sessions"
                                value={stats.completedSessions}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Active Opportunities"
                                value={stats.totalOpportunities}
                                prefix={<ShoppingOutlined />}
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Total Messages"
                                value={stats.totalMessages}
                                prefix={<MessageOutlined />}
                                valueStyle={{ color: '#eb2f96' }}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div className='text-center'>No data available</div>
            )}
        </Layout>
    )
}

export default Dashboard

