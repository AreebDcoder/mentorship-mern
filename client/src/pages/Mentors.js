import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Rate, Tag, Button, message, Space, Avatar } from 'antd'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getProfilePicture } from '../utils/profilePicture'
import '../styles/Mentors.css'

const Mentors = () => {
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useSelector(state => state.user)
    const navigate = useNavigate()

    useEffect(() => {
        fetchMentors()
    }, [])

    const fetchMentors = async () => {
        try {
            setLoading(true)
            console.log('Fetching mentors list...')
            const res = await axios.get('/api/v1/user/mentors', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                params: {
                    _t: new Date().getTime() // Add timestamp to prevent caching
                }
            })
            console.log('Mentors API response:', res.data)
            if (res.data.success) {
                console.log('✓ Fetched mentors:', res.data.data.length)
                console.log('Mentors:', res.data.data.map(m => m.userId?.name || 'Unknown'))
                setMentors(res.data.data)
            } else {
                console.error('Failed to fetch mentors:', res.data.message)
                message.error(res.data.message || 'Failed to fetch mentors')
            }
        } catch (error) {
            console.error('Error fetching mentors:', error)
            message.error('Failed to fetch mentors')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestSession = (mentorId) => {
        navigate(`/request-session/${mentorId}`)
    }

    const handleMessageMentor = (mentorUserId) => {
        // Navigate to messages page and start conversation with this mentor
        navigate(`/messages?userId=${mentorUserId}`)
    }

    return (
        <Layout>
            <div className="fade-in">
                <div className="mentors-page-header">
                    <div>
                        <h2 className="mentors-page-title">
                            🔍 Find Mentors
                        </h2>
                        <p style={{ color: '#6C757D', marginTop: '8px', marginBottom: 0, fontSize: '1.1rem' }}>
                            Connect with experienced alumni mentors
                        </p>
                    </div>
                    <Button 
                        type="primary" 
                        size="large"
                        onClick={() => {
                            console.log('Manual refresh triggered')
                            fetchMentors()
                        }}
                        loading={loading}
                        style={{ 
                            height: '48px',
                            borderRadius: '10px',
                            padding: '0 24px',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        🔄 Refresh
                    </Button>
                </div>
                {loading ? (
                    <div className='text-center' style={{ padding: '60px 0' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ marginTop: '20px', color: '#6C757D' }}>Loading mentors...</p>
                    </div>
                ) : mentors.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3 style={{ color: '#6C757D', marginBottom: '10px', fontSize: '1.5rem' }}>No mentors available</h3>
                        <p style={{ color: '#6C757D', marginBottom: '30px', fontSize: '1.1rem' }}>
                            No approved mentors available at the moment. Please check back later.
                        </p>
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={fetchMentors}
                            style={{
                                borderRadius: '10px',
                                height: '48px',
                                padding: '0 32px',
                                fontWeight: 600
                            }}
                        >
                            🔄 Try Again
                        </Button>
                    </div>
                ) : (
                    <div className='row' style={{ margin: '0 -12px' }}>
                        {mentors.map((mentor, index) => (
                            <div 
                                key={mentor._id} 
                                className='col-md-4 mb-4' 
                                style={{ 
                                    padding: '0 12px',
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <Card
                                    className="mentor-card"
                                    hoverable
                                    style={{ 
                                        height: '100%',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '2px solid transparent'
                                    }}
                                    headStyle={{ 
                                        background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '20px',
                                        position: 'relative'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Avatar 
                                                    size={45}
                                                    src={mentor.userId?.profile?.profilePicture 
                                                        ? mentor.userId.profile.profilePicture 
                                                        : getProfilePicture({ name: mentor.userId?.name || 'Mentor', profile: mentor.userId?.profile })}
                                                    style={{ border: '2px solid white', flexShrink: 0 }}
                                                >
                                                    {!mentor.userId?.profile?.profilePicture && mentor.userId?.name?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.3rem' }}>
                                                    {mentor.userId?.name || 'Mentor'}
                                                </span>
                                            </div>
                                            <Rate 
                                                disabled 
                                                value={mentor.rating || 0} 
                                                style={{ color: '#FFB800', fontSize: '1.1rem' }}
                                            />
                                        </div>
                                    }
                                >
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ color: '#DC143C', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>
                                            💼 Experience:
                                        </strong>
                                        <p style={{ margin: 0, color: '#6C757D', lineHeight: '1.6' }}>{mentor.experience}</p>
                                    </div>
                                    {mentor.skills && mentor.skills.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <strong style={{ color: '#DC143C', fontSize: '1rem', display: 'block', marginBottom: '10px' }}>
                                                🎯 Skills:
                                            </strong>
                                            <div style={{ marginTop: '10px' }}>
                                                {mentor.skills.map((skill, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="skill-tag"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {mentor.bio && (
                                        <div style={{ 
                                            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 184, 0, 0.05) 100%)',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            marginBottom: '20px',
                                            borderLeft: '4px solid #DC143C'
                                        }}>
                                            <p style={{ color: '#6C757D', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>
                                                "{mentor.bio}"
                                            </p>
                                        </div>
                                    )}
                                    {user?.role === 'mentee' && (
                                        <Space 
                                            className="mt-3" 
                                            style={{ 
                                                width: '100%', 
                                                display: 'flex',
                                                gap: '12px'
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                block
                                                onClick={() => handleRequestSession(mentor._id)}
                                                style={{ 
                                                    height: '45px', 
                                                    flex: 1,
                                                    borderRadius: '10px',
                                                    fontWeight: 600,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                📅 Request Session
                                            </Button>
                                            <Button
                                                block
                                                onClick={() => handleMessageMentor(mentor.userId._id)}
                                                style={{ 
                                                    height: '45px',
                                                    flex: 1,
                                                    background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)',
                                                    border: 'none',
                                                    color: '#0D0D0D',
                                                    fontWeight: 600,
                                                    borderRadius: '10px',
                                                    fontSize: '1rem',
                                                    boxShadow: '0 4px 15px rgba(255, 184, 0, 0.3)'
                                                }}
                                            >
                                                💬 Message
                                            </Button>
                                        </Space>
                                    )}
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Mentors

