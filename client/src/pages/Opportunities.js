import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Tag, Button, message, Modal } from 'antd'
import { useSelector } from 'react-redux'
import axios from 'axios'
// Using Date formatting

const Opportunities = () => {
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useSelector(state => state.user)

    useEffect(() => {
        fetchOpportunities()
    }, [])

    const fetchOpportunities = async () => {
        try {
            const res = await axios.get('/api/v1/user/opportunities', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            if (res.data.success) {
                setOpportunities(res.data.data)
            }
        } catch (error) {
            console.log(error)
            message.error('Failed to fetch opportunities')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOpportunity = async (opportunityId) => {
        Modal.confirm({
            title: 'Delete Opportunity',
            content: 'Are you sure you want to delete this opportunity?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const res = await axios.delete(`/api/v1/user/opportunities/${opportunityId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                    if (res.data.success) {
                        message.success('Opportunity deleted successfully')
                        fetchOpportunities()
                    }
                } catch (error) {
                    message.error('Failed to delete opportunity')
                }
            }
        })
    }

    const getTypeColor = (type) => {
        return type === 'job' ? 'green' : 'blue'
    }

    return (
        <Layout>
            <h2 className='text-center mb-4'>Job & Internship Opportunities</h2>
            <div className='row'>
                {opportunities.map((opp) => (
                    <div key={opp._id} className='col-md-6 mb-4'>
                        <Card
                            title={opp.title}
                            loading={loading}
                            extra={<Tag color={getTypeColor(opp.type)}>{opp.type.toUpperCase()}</Tag>}
                        >
                            <p><strong>Company:</strong> {opp.company}</p>
                            {opp.location && <p><strong>Location:</strong> {opp.location}</p>}
                            <p>{opp.description}</p>
                            {opp.requirements && opp.requirements.length > 0 && (
                                <div>
                                    <strong>Requirements:</strong>
                                    <ul>
                                        {opp.requirements.map((req, idx) => (
                                            <li key={idx}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {opp.deadline && (
                                <p><strong>Deadline:</strong> {new Date(opp.deadline).toLocaleDateString()}</p>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                {opp.applicationLink && (
                                    <Button
                                        type="primary"
                                        href={opp.applicationLink}
                                        target="_blank"
                                    >
                                        Apply Now
                                    </Button>
                                )}
                                {/* Show delete button only if user is the mentor who created it */}
                                {user?.isMentor && opp.mentorId?._id === user?._id && (
                                    <Button
                                        danger
                                        onClick={() => handleDeleteOpportunity(opp._id)}
                                    >
                                        🗑️ Delete
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </Layout>
    )
}

export default Opportunities