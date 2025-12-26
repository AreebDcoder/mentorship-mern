import React from 'react'
import Layout from '../components/Layout'
import { Form, Input, Select, DatePicker, Button, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

const PostOpportunity = () => {
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleFinish = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post('/api/v1/user/opportunities', {
                userId: user._id,
                title: values.title,
                type: values.type,
                description: values.description,
                company: values.company,
                location: values.location,
                requirements: values.requirements ? values.requirements.split('\n').filter(r => r.trim()) : [],
                applicationLink: values.applicationLink,
                deadline: values.deadline ? values.deadline.toISOString() : null,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            dispatch(hideLoading())
            if (res.data.success) {
                message.success('Opportunity posted successfully!')
                navigate('/opportunities')
            } else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            message.error(error.response?.data?.message || 'Failed to post opportunity')
        }
    }

    return (
        <Layout>
            <h2 className='text-center mb-4'>Post Job/Internship Opportunity</h2>
            <Form layout='vertical' onFinish={handleFinish} className='m-3'>
                <Form.Item
                    label='Opportunity Type'
                    name='type'
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Option value='job'>Job</Option>
                        <Option value='internship'>Internship</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label='Title'
                    name='title'
                    rules={[{ required: true }]}
                >
                    <Input placeholder='e.g., Software Engineer Intern' />
                </Form.Item>
                <Form.Item
                    label='Company'
                    name='company'
                    rules={[{ required: true }]}
                >
                    <Input placeholder='Company name' />
                </Form.Item>
                <Form.Item
                    label='Location'
                    name='location'
                >
                    <Input placeholder='e.g., Remote, New York, NY' />
                </Form.Item>
                <Form.Item
                    label='Description'
                    name='description'
                    rules={[{ required: true }]}
                >
                    <TextArea rows={6} placeholder='Describe the opportunity...' />
                </Form.Item>
                <Form.Item
                    label='Requirements (one per line)'
                    name='requirements'
                >
                    <TextArea rows={4} placeholder='List the requirements, one per line...' />
                </Form.Item>
                <Form.Item
                    label='Application Link'
                    name='applicationLink'
                >
                    <Input placeholder='URL to apply' />
                </Form.Item>
                <Form.Item
                    label='Application Deadline'
                    name='deadline'
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Button type='primary' htmlType='submit' size='large'>Post Opportunity</Button>
            </Form>
        </Layout>
    )
}

export default PostOpportunity

