import React, { useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/Layout'
import { useSelector } from 'react-redux'
import { Card, Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import '../styles/HomePage.css'

const HomePage = () => {
    const { user } = useSelector(state => state.user)
    const navigate = useNavigate()
    
    const getUserData = async () => {
        try {
            await axios.post('/api/v1/user/getUserData', {},
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem('token')
                    }
                }
            )
        } catch (error) {
            console.log(error)
        }
    }
    
    useEffect(() => {
        getUserData()
    }, [])
    
    const DashboardCard = ({ icon, title, description, onClick, gradient, delay = 0 }) => (
        <Col xs={24} sm={12} lg={6} style={{ marginBottom: '20px' }}>
            <Card
                className="dashboard-card"
                hoverable
                style={{
                    background: gradient || 'white',
                    border: 'none',
                    borderRadius: '16px',
                    height: '100%',
                    animation: `fadeInUp 0.6s ease-out ${delay}s both`,
                    boxShadow: gradient ? '0 10px 30px rgba(220, 20, 60, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
                bodyStyle={{ padding: '30px' }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div className="card-icon" style={{ 
                        fontSize: '3.5rem', 
                        marginBottom: '20px',
                        color: gradient ? 'white' : '#DC143C'
                    }}>
                        {icon}
                    </div>
                    <h3 style={{ 
                        color: gradient ? 'white' : '#212529',
                        marginBottom: '15px',
                        fontWeight: 700,
                        fontSize: '1.4rem'
                    }}>
                        {title}
                    </h3>
                    <p style={{ 
                        color: gradient ? 'rgba(255,255,255,0.9)' : '#6C757D',
                        marginBottom: '25px',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        minHeight: '48px'
                    }}>
                        {description}
                    </p>
                    <Button
                        type={gradient ? 'default' : 'primary'}
                        size="large"
                        onClick={onClick}
                        style={{
                            borderRadius: '10px',
                            height: '45px',
                            padding: '0 30px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: gradient ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        Get Started
                    </Button>
                </div>
            </Card>
        </Col>
    )
    
    return (
        <Layout>
            <div className="homepage-container">
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
                    </h1>
                    <p className="welcome-subtitle">
                        {user?.isAdmin 
                            ? 'Manage and monitor the SkillConnect platform'
                            : (user?.role === 'mentor' || user?.isMentor) && user?.mentorStatus !== 'rejected'
                            ? 'Help students grow and share your expertise'
                            : 'Connect with mentors and accelerate your career growth'
                        }
                    </p>
                </div>
                
                {user?.isAdmin ? (
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Card className="admin-welcome-card" style={{ 
                                background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                                border: 'none',
                                borderRadius: '20px',
                                color: 'white'
                            }}>
                                <div style={{ textAlign: 'center', padding: '50px 40px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚙️</div>
                                    <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '2.2rem', fontWeight: 700 }}>
                                        Admin Dashboard
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '30px', fontSize: '1.2rem' }}>
                                        Manage users, approve mentors, and monitor platform activity
                                    </p>
                                    <Button 
                                        type="default" 
                                        size="large"
                                        onClick={() => navigate('/admin/dashboard')}
                                        style={{
                                            borderRadius: '10px',
                                            height: '50px',
                                            padding: '0 40px',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            background: '#FFB800',
                                            border: 'none',
                                            color: '#0D0D0D'
                                        }}
                                    >
                                        Go to Dashboard
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                ) : (user?.role === 'mentor' || user?.isMentor) && user?.mentorStatus !== 'rejected' ? (
                    <Row gutter={[24, 24]}>
                        <DashboardCard
                            icon="📅"
                            title="My Sessions"
                            description="View and manage your mentorship sessions with students"
                            onClick={() => navigate('/sessions')}
                            delay={0.1}
                        />
                        <DashboardCard
                            icon="💬"
                            title="Messages"
                            description="Communicate with your mentees and answer their questions"
                            onClick={() => navigate('/messages')}
                            delay={0.2}
                        />
                        <DashboardCard
                            icon="💼"
                            title="Post Opportunities"
                            description="Share job and internship opportunities with students"
                            onClick={() => navigate('/post-opportunity')}
                            delay={0.3}
                        />
                        <DashboardCard
                            icon="🏫"
                            title="Workshops"
                            description="Host group learning sessions for multiple mentees"
                            onClick={() => navigate('/workshops')}
                            delay={0.4}
                        />
                        <DashboardCard
                            icon="�"
                            title="Feedback"
                            description="Report bugs or suggest new features to the admin"
                            onClick={() => navigate('/feedback')}
                            delay={0.5}
                        />
                        <DashboardCard
                            icon="👤"
                            title="My Profile"
                            description="Update your profile, skills, and experience"
                            onClick={() => navigate('/profile')}
                            delay={0.6}
                        />
                    </Row>
                ) : (
                    <Row gutter={[24, 24]}>
                        <DashboardCard
                            icon="🔍"
                            title="Find Mentors"
                            description="Browse and connect with experienced alumni mentors"
                            onClick={() => navigate('/mentors')}
                            gradient="linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)"
                            delay={0.1}
                        />
                        <DashboardCard
                            icon="📅"
                            title="My Sessions"
                            description="View your scheduled mentorship sessions"
                            onClick={() => navigate('/sessions')}
                            delay={0.2}
                        />
                        <DashboardCard
                            icon="💬"
                            title="Messages"
                            description="Chat with your mentors and get guidance"
                            onClick={() => navigate('/messages')}
                            delay={0.3}
                        />
                        <DashboardCard
                            icon="💼"
                            title="Opportunities"
                            description="Explore job and internship opportunities"
                            onClick={() => navigate('/opportunities')}
                            delay={0.4}
                        />
                        <DashboardCard
                            icon="🏫"
                            title="Workshops"
                            description="Join group learning sessions hosted by mentors"
                            onClick={() => navigate('/workshops')}
                            delay={0.5}
                        />
                        <DashboardCard
                            icon="💬"
                            title="Feedback"
                            description="Report bugs or suggest new features to the admin"
                            onClick={() => navigate('/feedback')}
                            delay={0.6}
                        />
                    </Row>
                )}
            </div>
        </Layout>
    )
}

export default HomePage