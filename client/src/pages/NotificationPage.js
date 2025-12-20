import React from 'react'
import Layout from '../components/Layout'
import { message, Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import { setUser } from '../redux/features/userSlice'
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
                dispatch(setUser(res.data.data))
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
    const handleDeleteAllRead = async () => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/delete-all-notification', { userId: user._id }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            }
            )
            dispatch(hideLoading());
            if (res.data.success) {
                dispatch(setUser(res.data.data))
                message.success(res.data.message)
            }
            else {
                message.error(res.data.message)

            }

        } catch (error) {
            console.log(error)
            message.error('something went wrong in notifications')

        }
    }
    const tabItems = [
        {
            key: '1',
            label: 'Unread',
            children: (
                <>
                    <div className='d-flex justify-content-end'>
                        <h5 className='p-2 text-primary' style={{ cursor: 'pointer' }} onClick={handleMarkAllRead}>Mark All Read</h5>
                    </div>
                    {(user?.notifcation || []).map((notification, index) => (
                        <div key={index} className="card p-2 m-2">
                            {notification.message}
                        </div>
                    ))}
                </>
            ),
        },
        {
            key: '2',
            label: 'Read',
            children: (
                <>
                    <div className='d-flex justify-content-end'>
                        <h5 className='p-2 text-primary' style={{ cursor: 'pointer' }} onClick={handleDeleteAllRead}>Delete All Read</h5>
                    </div>
                    {(user?.seennotification || []).map((notificationMsg, index) => (
                        <div key={index} className="card p-2 m-2" >
                            <div className="card-text" onClick={() => navigate(notificationMsg.data?.onClickPath || '/')}>{notificationMsg.message}</div>
                        </div>
                    ))}
                </>
            ),
        },
    ];

    return (
        <Layout>
            <h4 className='p-4 text-center'>NotificationPage</h4>
            <Tabs items={tabItems} />
        </Layout>
    )
}

export default NotificationPage