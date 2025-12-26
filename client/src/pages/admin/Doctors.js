import React, { useEffect, useState } from 'react'
import Layout from './../../components/Layout'
import axios from 'axios'
import { Table, Tag, Button, message } from 'antd'

const Mentors = () => {
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMentors()
    }, [])

    const fetchMentors = async () => {
        try {
            const res = await axios.get('/api/v1/admin/getAllMentors', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if (res.data.success) {
                setMentors(res.data.data)
            }
        } catch (error) {
            console.log(error)
            message.error('Failed to fetch mentors')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (mentorId, status) => {
        try {
            const res = await axios.put('/api/v1/admin/approve-mentor', {
                mentorId,
                status
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if (res.data.success) {
                message.success(`Mentor ${status} successfully`)
                fetchMentors()
            }
        } catch (error) {
            message.error('Failed to update mentor status')
        }
    }

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => record.userId?.name || 'N/A',
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => record.userId?.email || 'N/A',
        },
        {
            title: 'Experience',
            dataIndex: 'experience',
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            render: (skills) => (
                skills && skills.length > 0 ? (
                    <div>
                        {skills.slice(0, 3).map((skill, idx) => (
                            <Tag key={idx} color="blue">{skill}</Tag>
                        ))}
                        {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
                    </div>
                ) : 'N/A'
            ),
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            render: (rating) => rating ? rating.toFixed(1) : 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                const colors = {
                    pending: 'orange',
                    approved: 'green',
                    rejected: 'red'
                }
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className='d-flex gap-2'>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => handleApprove(record._id, 'approved')}
                            >
                                Approve
                            </Button>
                            <Button
                                danger
                                size="small"
                                onClick={() => handleApprove(record._id, 'rejected')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {record.status === 'approved' && (
                        <Button
                            danger
                            size="small"
                            onClick={() => handleApprove(record._id, 'rejected')}
                        >
                            Revoke
                        </Button>
                    )}
                    {record.status === 'rejected' && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => handleApprove(record._id, 'approved')}
                        >
                            Approve
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <Layout>
            <h1 className='text-center m-2'>Mentors List</h1>
            <Table
                columns={columns}
                dataSource={mentors}
                loading={loading}
                rowKey="_id"
            />
        </Layout>
    )
}

export default Mentors