import React, { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { Form, Input, DatePicker, InputNumber, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const RequestSession = () => {
    const { id } = useParams()
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [mentor, setMentor] = useState(null)

    const fetchMentor = useCallback(async () => {
        try {
            const res = await axios.get(`/api/v1/user/mentor/${id}`)
            if (res.data.success) {
                setMentor(res.data.data)
            }
        } catch (error) {
            message.error('Failed to fetch mentor details')
        }
    }, [id])

    useEffect(() => {
        fetchMentor()
    }, [fetchMentor])

    const handleFinish = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post('/api/v1/user/sessions', {
                userId: user._id,
                mentorId: id,
                title: values.title,
                description: values.description,
                scheduledDate: values.scheduledDate.toISOString(),
                duration: values.duration || 60,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            dispatch(hideLoading())
            if (res.data.success) {
                message.success('Session request sent successfully!')
                navigate('/sessions')
            } else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            message.error(error.response?.data?.message || 'Failed to send session request')
        }
    }

    return (
        <Layout>
            <h2 className='text-center mb-4'>Request Mentorship Session</h2>
            {mentor && (
                <div className='mb-4'>
                    <h4>Mentor: {mentor.userId?.name}</h4>
                    <p>Skills: {mentor.skills?.join(', ')}</p>
                </div>
            )}
            <Form layout='vertical' onFinish={handleFinish} className='m-3'>
                <Form.Item
                    label='Session Title'
                    name='title'
                    rules={[{ required: true }]}
                >
                    <Input placeholder='e.g., Career Guidance Session' />
                </Form.Item>
                <Form.Item
                    label='Description'
                    name='description'
                    rules={[{ required: true }]}
                >
                    <Input.TextArea rows={4} placeholder='Describe what you would like to discuss...' />
                </Form.Item>
                <Form.Item
                    label='Preferred Date & Time'
                    name='scheduledDate'
                    rules={[{ required: true }]}
                >
                    <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label='Duration (minutes)'
                    name='duration'
                >
                    <InputNumber min={15} max={120} defaultValue={60} style={{ width: '100%' }} />
                </Form.Item>
                <button className='btn btn-primary' type='submit'>Send Request</button>
            </Form>
        </Layout>
    )
}

export default RequestSession

