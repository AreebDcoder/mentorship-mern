import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Rate, Button, message, Space, Avatar, Input, Select, Switch } from 'antd'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getProfilePicture } from '../utils/profilePicture'
import '../styles/Mentors.css'

const Mentors = () => {
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)
    const [favoriteIds, setFavoriteIds] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        skills: '',
        industry: '',
        language: '',
        tags: '',
        showFavoritesOnly: false,
    })
    const { user } = useSelector(state => state.user)
    const navigate = useNavigate()

    useEffect(() => {
        fetchFavorites()
        fetchMentors()
    }, [])

    const fetchFavorites = async () => {
        try {
            const res = await axios.get('/api/v1/user/favorites', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            if (res.data.success) {
                setFavoriteIds(res.data.data.ids || [])
            }
        } catch (error) {
            console.error('Error fetching favorite mentors:', error)
        }
    }

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
                    _t: new Date().getTime(), // Add timestamp to prevent caching
                    search: filters.search || undefined,
                    skills: filters.skills || undefined,
                    industry: filters.industry || undefined,
                    language: filters.language || undefined,
                    tags: filters.tags || undefined,
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

    const handleToggleFavorite = async (mentorId) => {
        try {
            const res = await axios.post(`/api/v1/user/favorites/${mentorId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (res.data.success) {
                setFavoriteIds(res.data.data.ids || [])
                message.success(res.data.message)
            } else {
                message.error(res.data.message || 'Failed to update favorites')
            }
        } catch (error) {
            console.error('Error toggling favorite mentor:', error)
            message.error('Failed to update favorites')
        }
    }

    const filteredMentors = useMemo(() => {
        if (!filters.showFavoritesOnly) return mentors
        if (!favoriteIds.length) return []
        const favSet = new Set(favoriteIds)
        return mentors.filter(m => favSet.has(m._id))
    }, [mentors, favoriteIds, filters.showFavoritesOnly])

    const recommendedMentors = useMemo(() => {
        if (!mentors.length) return []
        // Take top 3 mentors by rating (already sorted server-side), excluding those not having a user
        return mentors
            .filter(m => m.userId)
            .slice(0, 3)
    }, [mentors])

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

                <div className="mentors-filters" style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <Input.Search
                        placeholder="Search by name, skills, company..."
                        allowClear
                        value={filters.search}
                        onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onSearch={fetchMentors}
                        style={{ maxWidth: 260 }}
                    />
                    <Input
                        placeholder="Skills (comma-separated)"
                        allowClear
                        value={filters.skills}
                        onChange={e => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                        style={{ maxWidth: 220 }}
                    />
                    <Input
                        placeholder="Industry"
                        allowClear
                        value={filters.industry}
                        onChange={e => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        style={{ maxWidth: 180 }}
                    />
                    <Input
                        placeholder="Language"
                        allowClear
                        value={filters.language}
                        onChange={e => setFilters(prev => ({ ...prev, language: e.target.value }))}
                        style={{ maxWidth: 180 }}
                    />
                    <Input
                        placeholder="Tags (comma-separated)"
                        allowClear
                        value={filters.tags}
                        onChange={e => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                        style={{ maxWidth: 220 }}
                    />
                    <Button onClick={fetchMentors}>
                        Apply Filters
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch
                            checked={filters.showFavoritesOnly}
                            onChange={(checked) => setFilters(prev => ({ ...prev, showFavoritesOnly: checked }))}
                        />
                        <span style={{ color: '#6C757D' }}>Show favorites only</span>
                    </div>
                </div>

                {recommendedMentors.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '12px', color: '#212529' }}>
                            ⭐ You might like these mentors
                        </h3>
                        <div className="row" style={{ margin: '0 -12px' }}>
                            {recommendedMentors.map((mentor, index) => (
                                <div
                                    key={mentor._id}
                                    className='col-md-4 mb-3'
                                    style={{ padding: '0 12px', animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both` }}
                                >
                                    <Card
                                        className="mentor-card"
                                        hoverable
                                        style={{ borderRadius: '16px' }}
                                        headStyle={{
                                            background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                        }}
                                        bodyStyle={{ padding: '18px' }}
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 700 }}>
                                                    {mentor.userId?.name || 'Mentor'}
                                                </span>
                                                <Rate disabled value={mentor.rating || 0} style={{ color: '#DC143C', fontSize: '1rem' }} />
                                            </div>
                                        }
                                    >
                                        <p style={{ marginBottom: 8, color: '#6C757D' }}>{mentor.experience}</p>
                                        {mentor.skills && mentor.skills.length > 0 && (
                                            <div style={{ marginBottom: 8 }}>
                                                {mentor.skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className="skill-tag">{skill}</span>
                                                ))}
                                                {mentor.skills.length > 3 && (
                                                    <span className="skill-tag">+{mentor.skills.length - 3} more</span>
                                                )}
                                            </div>
                                        )}
                                        <Button
                                            type="link"
                                            onClick={() => handleRequestSession(mentor._id)}
                                            style={{ padding: 0 }}
                                        >
                                            View details & request session
                                        </Button>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className='text-center' style={{ padding: '60px 0' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ marginTop: '20px', color: '#6C757D' }}>Loading mentors...</p>
                    </div>
                ) : filteredMentors.length === 0 ? (
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
                        {filteredMentors.map((mentor, index) => (
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
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => handleToggleFavorite(mentor._id)}
                                            style={{ padding: '0 4px' }}
                                        >
                                            <span style={{ fontSize: '1.3rem' }}>
                                                {favoriteIds.includes(mentor._id) ? '❤️' : '🤍'}
                                            </span>
                                        </Button>
                                    </div>
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

