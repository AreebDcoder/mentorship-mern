import React, { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { Table, Tag, Button, Modal, Input, message } from 'antd'
import { useSelector } from 'react-redux'
import axios from 'axios'
import '../styles/Sessions.css'
// Using Date formatting instead of dayjs

const Sessions = () => {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [meetingLink, setMeetingLink] = useState('')
    const { user } = useSelector(state => state.user)

    const fetchSessions = useCallback(async () => {
        try {
            const res = await axios.post('/api/v1/user/get-sessions', { userId: user._id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                setSessions(res.data.data)
            }
        } catch (error) {
            console.log(error)
            message.error('Failed to fetch sessions')
        } finally {
            setLoading(false)
        }
    }, [user._id])

    useEffect(() => {
        if (user?._id) {
            fetchSessions()
        }
    }, [fetchSessions, user?._id])


    const handleUpdateSession = async (sessionId, status, link = '') => {
        try {
            const res = await axios.put('/api/v1/user/sessions', {
                sessionId,
                status,
                meetingLink: link
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                message.success('Session updated successfully')
                fetchSessions()
                setIsModalVisible(false)
            }
        } catch (error) {
            message.error('Failed to update session')
        }
    }

    const handleDeleteSession = async (sessionId) => {
        Modal.confirm({
            title: 'Delete Session',
            content: 'Are you sure you want to delete this rejected session?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const res = await axios.delete(`/api/v1/user/sessions/${sessionId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                    if (res.data.success) {
                        message.success('Session deleted successfully')
                        fetchSessions()
                    }
                } catch (error) {
                    message.error('Failed to delete session')
                }
            }
        })
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            accepted: 'green',
            rejected: 'red',
            completed: 'blue',
            cancelled: 'gray'
        }
        return colors[status] || 'default'
    }

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: user?.isMentor ? 'Mentee' : 'Mentor',
            key: 'other',
            render: (_, record) => (
                user?.isMentor ? record.menteeId?.name : record.mentorId?.name
            ),
        },
        {
            title: 'Date',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                if (user?.isMentor && record.status === 'pending') {
                    return (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                    setSelectedSession(record)
                                    setIsModalVisible(true)
                                }}
                                className="session-action-btn"
                                style={{ marginRight: '8px' }}
                            >
                                ✓ Accept
                            </Button>
                            <Button
                                danger
                                size="small"
                                onClick={() => handleUpdateSession(record._id, 'rejected')}
                                className="session-action-btn"
                            >
                                ✗ Reject
                            </Button>
                        </>
                    )
                }
                if (record.status === 'accepted' && record.meetingLink) {
                    return (
                        <a
                            href={record.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="join-meeting-link"
                        >
                            🔗 Join Meeting
                        </a>
                    )
                }
                // Allow both mentors and mentees to delete rejected sessions
                if (record.status === 'rejected') {
                    return (
                        <Button
                            danger
                            size="small"
                            onClick={() => handleDeleteSession(record._id)}
                            className="session-action-btn"
                        >
                            🗑️ Delete
                        </Button>
                    )
                }
                return null
            },
        },
    ]

    return (
        <Layout>
            <div className="sessions-header">
                <h2 className="sessions-title">📅 My Sessions</h2>
                <p className="sessions-subtitle">Manage your mentorship sessions</p>
            </div>
            <div className="session-table">
                <Table
                    columns={columns}
                    dataSource={sessions}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </div>
            <Modal
                title={
                    <span style={{
                        background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700
                    }}>
                        Accept Session
                    </span>
                }
                open={isModalVisible}
                onOk={() => {
                    if (meetingLink) {
                        handleUpdateSession(selectedSession?._id, 'accepted', meetingLink)
                    } else {
                        message.warning('Please enter a meeting link')
                    }
                }}
                onCancel={() => {
                    setIsModalVisible(false)
                    setMeetingLink('')
                }}
                okText="Accept"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600
                    }
                }}
            >
                <Input
                    placeholder="Enter meeting link (Zoom, Google Meet, etc.)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    style={{
                        borderRadius: '8px',
                        padding: '10px 16px',
                        marginTop: '10px'
                    }}
                />
            </Modal>
        </Layout>
    )
}

export default Sessions