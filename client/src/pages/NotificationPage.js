import React from 'react'
import Layout from '../components/Layout'
import { message, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const NotificationPage = () => {
    const { user } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleMarkAllRead = async () => {
        try {
            dispatch(showLoading())
            const res = await axios.post('/api/v1/user/get-all-notification', { userId: user._id }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            }
            )
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message)
            }
            else {
                message.error(res.data.message)

            }

        } catch (error) {
            console.log(error)
            message.error('something went wrong')

        }
    }
    const handleDeleteAllRead = () => { }
    return (
        <Layout>
            <h4 className='p-4 text-center'>NotificationPage</h4>
            <Tabs>
                <Tabs.TabPane tab="Unread" key="1">
                    <div className='d-flex justify-content-end'>
                        <h5 className='p-2' onClick={handleMarkAllRead}>Mark All Read</h5>
                    </div>
                    {(user?.notification || []).map((notification, index) => (
                        <div key={index} className="card p-2 m-2">
                            {notification.message}
                        </div>
                    ))}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Read" key="2">
                    <div className='d-flex justify-content-end'>
                        <h5 className='p-2' onClick={handleDeleteAllRead}>Delete All Read</h5>
                    </div>
                    {(user?.seenNotification || []).map((notificationMsg) => (
                        <div className="card p-2 m-2" >

                            <div className="card-text" onClick={() => navigate(notificationMsg.onClickPath)}>{notificationMsg.message}</div>
                        </div>
                    ))}
                </Tabs.TabPane>
            </Tabs>
        </Layout>
    )
}

export default NotificationPage