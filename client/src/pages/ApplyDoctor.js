import React from 'react'
import Layout from './../components/Layout'
import { Form, Input, Col, Row, TimePicker, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'
const ApplyDoctor = () => {
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleFinish = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post("api/v1/user/apply-doctor",
                { ...values, userId: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            dispatch.hideLoading();
            if (res.data.success) {
                message.success(res.data.success)
                navigate("/")
            }
            else {
                message.error(res.data.success)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error("Something went wrong")

        }


    }
    return (
        <Layout>
            <h1 className='text-center'>Apply Doctor</h1>
            <Form layout='vertical' onFinish={handleFinish} className='m-3'>
                <h4>Personal Details</h4>
                <Row gutter={20}>

                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='First Name' name='firstName' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Your first name' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Last Name' name='lastName' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Your last name' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Phone' name='phone' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Phone number' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Email' name='email' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Your email' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Website' name='website' >
                            <Input type='text' placeholder='Website link' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Address' name='address' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Your address' />
                        </Form.Item>
                    </Col>
                </Row>
                <h4>Personal Details</h4>
                <Row gutter={20}>

                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Specilization' name='specilization' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Mention Specilization' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Experience' name='experience' required rules={[{ required: true }]}>
                            <Input type='text' placeholder='Your Experience' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label='Timings' name='timings' required rules={[{ required: true }]}>
                            <TimePicker.RangePicker format="HH:mm" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={24} lg={8}></Col>
                    <Col xs={24} md={24} lg={8}><button className='btn btn-primary form-btn' type='submit'>Submit</button></Col>

                </Row>
                <div className='d-flex justify-content-end'>

                </div>

            </Form>

        </Layout>
    )
}

export default ApplyDoctor