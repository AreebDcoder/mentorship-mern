import React from 'react'
import Layout from './../components/Layout'
import { Form, Input, Col, Row, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const { TextArea } = Input

const ApplyMentor = () => {
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const handleFinish = async (values) => {
        try {
            dispatch(showLoading())
            
            // Format availability if provided
            let availability = {}
            if (values.availability) {
                availability = values.availability
            }
            
            const payload = {
                skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
                industry: values.industry || '',
                languages: values.languages ? values.languages.split(',').map(l => l.trim()) : [],
                tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
                experience: values.experience,
                availability: availability,
                bio: values.bio,
                linkedin: values.linkedin,
                github: values.github,
                company: values.company,
                currentPosition: values.currentPosition,
                graduationYear: values.graduationYear,
                profile: {
                    phone: values.phone,
                    address: values.address,
                },
                userId: user._id
            }
            
            const res = await axios.post("/api/v1/user/apply-mentor",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            dispatch(hideLoading());
            if (res.data.success) {
                message.success(res.data.message)
                navigate("/")
            }
            else {
                message.error(res.data.message || "Failed to apply")
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            const errorMessage = error.response?.data?.message || error.message || "Something went wrong"
            message.error(errorMessage)
        }
    }
    return (
        <Layout>
            <h1 className='text-center'>Apply to Become a Mentor</h1>
            <Form layout='vertical' onFinish={handleFinish} className='m-3'>
                <h4>Contact Information</h4>
                <Row gutter={20}>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Phone' name='phone' rules={[{ required: true }]}>
                            <Input type='text' placeholder='Phone number' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Address' name='address'>
                            <Input type='text' placeholder='Your address' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='LinkedIn' name='linkedin'>
                            <Input type='text' placeholder='LinkedIn profile URL' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='GitHub' name='github'>
                            <Input type='text' placeholder='GitHub profile URL' />
                        </Form.Item>
                    </Col>
                </Row>
                <h4>Professional Details</h4>
                <Row gutter={20}>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Skills (comma-separated)' name='skills' rules={[{ required: true }]}>
                            <Input placeholder='e.g., JavaScript, React, Node.js, Python' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Industry' name='industry'>
                            <Input placeholder='e.g., Software, Finance, Healthcare' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Experience' name='experience' rules={[{ required: true }]}>
                            <Input placeholder='e.g., 5 years in Software Development' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Languages (comma-separated)' name='languages'>
                            <Input placeholder='e.g., English, Spanish, French' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Current Position' name='currentPosition'>
                            <Input placeholder='e.g., Senior Software Engineer' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Company' name='company'>
                            <Input placeholder='Current company name' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={12}>
                        <Form.Item label='Graduation Year' name='graduationYear'>
                            <Input placeholder='e.g., 2020' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={24}>
                        <Form.Item label='Tags (comma-separated)' name='tags'>
                            <Input placeholder='e.g., Frontend, Backend, Career Coaching' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={24}>
                        <Form.Item label='Bio' name='bio'>
                            <TextArea rows={4} placeholder='Tell us about yourself and your expertise...' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={24}>
                        <button className='btn btn-primary form-btn' type='submit'>Submit Application</button>
                    </Col>
                </Row>
            </Form>
        </Layout>
    )
}

export default ApplyMentor