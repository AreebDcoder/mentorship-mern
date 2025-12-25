import React from 'react';
import Layout from '../components/Layout';
import { Form, Input, Select, Button, message, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const Feedback = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const res = await axios.post('/api/v1/user/submit-feedback', values, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                message.success('Feedback submitted successfully! Thank you.');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to submit feedback');
        }
    };

    return (
        <Layout>
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <Card title="Report a Bug / Give Feedback" bordered={false} style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Found a bug? Have a suggestion? We'd love to hear from you. Your feedback helps us make SkillConnect better for everyone.
                    </p>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item 
                            name="type" 
                            label="Type" 
                            rules={[{ required: true, message: 'Please select a type' }]}
                        >
                            <Select placeholder="Select feedback type">
                                <Option value="bug">Bug Report</Option>
                                <Option value="feedback">General Feedback</Option>
                                <Option value="suggestion">Feature Suggestion</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item 
                            name="subject" 
                            label="Subject" 
                            rules={[{ required: true, message: 'Please enter a subject' }]}
                        >
                            <Input placeholder="Briefly describe the issue" />
                        </Form.Item>

                        <Form.Item 
                            name="message" 
                            label="Message" 
                            rules={[{ required: true, message: 'Please enter your message' }]}
                        >
                            <Input.TextArea rows={6} placeholder="Provide as much detail as possible..." />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" style={{ backgroundColor: '#DC143C', borderColor: '#DC143C' }}>
                                Submit Feedback
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </Layout>
    );
};

export default Feedback;
