import React from 'react'
import '../styles/Layout.css'
import { adminMenu, userMenu } from '../data/data'
import { message, Badge } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Layout = ({ children }) => {
    const { user } = useSelector(state => state.user)
    const location = useLocation()
    const navigate = useNavigate()
    const SliderBarMenu = user?.isAdmin ? adminMenu : userMenu
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
                            <h6>Doc App</h6>
                            <hr />
                        </div>
                        <div className='menu'>
                            {SliderBarMenu.map((menu) => {
                                const isActive = location.pathname === menu.path
                                return (
                                    <>
                                        <div key={menu.name} className={`menu-item ${isActive && "active"}`}>
                                            <i className={menu.icon} />
                                            <Link to={menu.path}>{menu.name}</Link>
                                        </div>

                                    </>
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
                            <div className='header-content' style={{ cursor: "pointer" }}>
                                <Badge count={user?.notification?.length || 0} onClick={() => {
                                    navigate('/notification')
                                }}>
                                    <i className="fa-solid fa-bell"></i>
                                </Badge>

                                <Link to="/profile">{user?.name}</Link>
                            </div>
                        </div>
                        <div className='body'>{children}</div>
                    </div>


                </div>
            </div>

        </>
    )
}

export default Layout