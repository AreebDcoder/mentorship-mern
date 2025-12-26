import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Tabs, Tag } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { TabPane } = Tabs;

const Workshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [userWorkshops, setUserWorkshops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { user } = useSelector((state) => state.user);

    const fetchAllWorkshops = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/v1/user/workshops', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                setWorkshops(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch workshops');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserWorkshops = async () => {
        try {
            const res = await axios.get('/api/v1/user/user-workshops', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                setUserWorkshops(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAllWorkshops();
        fetchUserWorkshops();
    }, []);

    const handleCreateWorkshop = async (values) => {
        try {
            const res = await axios.post('/api/v1/user/workshops', {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                message.success('Workshop created successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchAllWorkshops();
                fetchUserWorkshops();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to create workshop');
        }
    };

    const handleJoinWorkshop = async (workshopId) => {
        try {
            const res = await axios.post('/api/v1/user/join-workshop', { workshopId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                message.success('Joined workshop successfully');
                fetchAllWorkshops();
                fetchUserWorkshops();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to join workshop');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div style={{ fontWeight: 'bold' }}>{text}</div>
            )
        },
        {
            title: 'Mentor',
            dataIndex: 'mentorId',
            key: 'mentor',
            render: (mentor) => mentor?.name || 'N/A',
        },
        {
            title: 'Date & Time',
            key: 'dateTime',
            render: (_, record) => (
                <span>{moment(record.date).format('DD MMM YYYY')} at {record.time}</span>
            ),
        },
        {
            title: 'Seats',
            key: 'seats',
            render: (_, record) => (
                <Tag color={record.enrolledMentees.length >= record.maxSeats ? 'red' : 'green'}>
                    {record.enrolledMentees.length} / {record.maxSeats}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const isEnrolled = record.enrolledMentees.includes(user?._id);
                const isMentor = record.mentorId?._id === user?._id;
                const isFull = record.enrolledMentees.length >= record.maxSeats;

                if (isMentor) return <Tag color="blue">Your Workshop</Tag>;
                if (isEnrolled) return <Tag color="cyan">Enrolled</Tag>;
                
                return (
                    <Button 
                        type="primary" 
                        disabled={isFull}
                        onClick={() => handleJoinWorkshop(record._id)}
                    >
                        {isFull ? 'Full' : 'Join'}
                    </Button>
                );
            },
        },
    ];

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Workshops</h1>
                    {user?.role === 'mentor' && (
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            Create Workshop
                        </Button>
                    )}
                </div>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="Available Workshops" key="1">
                        <Table 
                            columns={columns} 
                            dataSource={workshops} 
                            loading={loading} 
                            rowKey="_id"
                            expandable={{
                                expandedRowRender: record => (
                                    <div style={{ padding: '10px' }}>
                                        <p><strong>Description:</strong> {record.description}</p>
                                        <p><strong>Duration:</strong> {record.duration} minutes</p>
                                    </div>
                                ),
                            }}
                        />
                    </TabPane>
                    <TabPane tab="My Workshops" key="2">
                        <Table 
                            columns={columns} 
                            dataSource={userWorkshops} 
                            rowKey="_id"
                            expandable={{
                                expandedRowRender: record => (
                                    <div style={{ padding: '10px' }}>
                                        <p><strong>Description:</strong> {record.description}</p>
                                        <p><strong>Meeting Link:</strong> <a href={record.meetingLink} target="_blank" rel="noopener noreferrer">{record.meetingLink}</a></p>
                                    </div>
                                ),
                            }}
                        />
                    </TabPane>
                </Tabs>

                <Modal
                    title="Create New Workshop"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form form={form} layout="vertical" onFinish={handleCreateWorkshop}>
                        <Form.Item name="title" label="Workshop Title" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Introduction to System Design" />
                        </Form.Item>
                        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                            <Input.TextArea rows={4} placeholder="What will mentees learn?" />
                        </Form.Item>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="time" label="Time" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <Input placeholder="e.g. 10:00 AM" />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Form.Item name="duration" label="Duration (mins)" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <InputNumber min={15} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="maxSeats" label="Max Seats" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                        <Form.Item name="meetingLink" label="Meeting Link" rules={[{ required: true }]}>
                            <Input placeholder="Zoom/Google Meet link" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Create Workshop
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default Workshops;
