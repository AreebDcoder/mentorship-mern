import React from 'react'
import '../styles/Layout.css'
import { adminMenu, mentorMenu, menteeMenu } from '../data/data'
import { message, Badge, Alert, Avatar } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getProfilePicture } from '../utils/profilePicture'

const Layout = ({ children }) => {
    const { user } = useSelector(state => state.user)
    const location = useLocation()
    const navigate = useNavigate()
    
    let SliderBarMenu = menteeMenu
    if (user?.isAdmin) {
        SliderBarMenu = adminMenu
    } else if (user?.isMentor || user?.role === 'mentor') {
        // Show mentor menu for all mentors (pending or approved)
        SliderBarMenu = mentorMenu
    }
    const handleLogout = () => {
        localStorage.clear()
        message.success('Logout Successfully')
        navigate('/login')

    }
    return (
        <>
            <div className='main'>
                <div className='layout'>
                    <div className='sidebar'>
                        <div className='logo'>
                            <h6>SkillConnect</h6>
                            <hr />
                        </div>
                        <div className='menu'>
                            {SliderBarMenu.map((menu) => {
                                const isActive = location.pathname === menu.path
                                return (
                                    <div key={menu.name} className={`menu-item ${isActive && "active"}`}>
                                        <i className={menu.icon} />
                                        <Link to={menu.path}>{menu.name}</Link>
                                    </div>
                                )
                            })}
                            <div className={`menu-item `} onClick={handleLogout}>
                                <i className="fa-solid fa-arrow-right-from-bracket" />
                                <Link to="/login">Logout</Link>
                            </div>
                        </div>

                    </div >

                    <div className='content'>
                        <div className='header'>
                            <div className='header-content' style={{ cursor: "pointer", display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Badge count={user?.notifcation?.length || 0} onClick={() => {
                                    navigate('/notification')
                                }}>
                                    <i className="fa-solid fa-bell"></i>
                                </Badge>
                                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                                    <Avatar 
                                        size={40}
                                        src={getProfilePicture(user)}
                                        style={{ border: '2px solid #DC143C' }}
                                    >
                                        {!user?.profile?.profilePicture && user?.name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <span style={{ color: '#DC143C', fontWeight: 600 }}>{user?.name}</span>
                                </Link>
                            </div>
                        </div>
                        {/* Show pending approval banner for mentors */}
                        {(user?.role === 'mentor' || user?.isMentor) && user?.mentorStatus === 'pending' && (
                            <Alert
                                message="Mentor Application Pending"
                                description="Your mentor application is awaiting admin approval. You'll be notified once approved!"
                                type="warning"
                                showIcon
                                closable
                                style={{ margin: '10px 20px' }}
                            />
                        )}
                        <div className='body'>{children}</div>
                    </div>


                </div>
            </div>

        </>
    )
}

export default Layout