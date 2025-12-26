import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Table, Tag, Button, Modal, Form, Select, Input, message, Space } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const FeedbackQueue = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [form] = Form.useForm();

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/v1/admin/getAllFeedback', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                setFeedbacks(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleUpdateStatus = async (values) => {
        try {
            const res = await axios.put('/api/v1/admin/updateFeedbackStatus', {
                feedbackId: selectedFeedback._id,
                ...values,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data.success) {
                message.success('Feedback updated successfully');
                setIsModalVisible(false);
                fetchFeedbacks();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to update feedback');
        }
    };

    const showModal = (record) => {
        setSelectedFeedback(record);
        form.setFieldsValue({
            status: record.status,
            adminNotes: record.adminNotes,
        });
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => moment(date).format('DD MMM YYYY, HH:mm'),
        },
        {
            title: 'User',
            dataIndex: 'userId',
            key: 'user',
            render: (user) => (
                <div>
                    <div>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{user?.email}</div>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const colors = {
                    bug: 'red',
                    feedback: 'blue',
                    suggestion: 'green',
                    other: 'orange',
                };
                return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    pending: 'gold',
                    'in-progress': 'blue',
                    resolved: 'green',
                    closed: 'gray',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => showModal(record)}>
                    Manage
                </Button>
            ),
        },
    ];

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 className="text-center m-2">Feedback & Bug Reports</h1>
                <Table 
                    columns={columns} 
                    dataSource={feedbacks} 
                    loading={loading} 
                    rowKey="_id"
                    expandable={{
                        expandedRowRender: record => (
                            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                <p><strong>Message:</strong> {record.message}</p>
                                {record.adminNotes && <p><strong>Admin Notes:</strong> {record.adminNotes}</p>}
                            </div>
                        ),
                    }}
                />

                <Modal
                    title="Manage Feedback"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    {selectedFeedback && (
                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>From:</strong> {selectedFeedback.userId?.name}</p>
                            <p><strong>Subject:</strong> {selectedFeedback.subject}</p>
                            <p><strong>Message:</strong> {selectedFeedback.message}</p>
                        </div>
                    )}
                    <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
                        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                            <Select>
                                <Option value="pending">Pending</Option>
                                <Option value="in-progress">In Progress</Option>
                                <Option value="resolved">Resolved</Option>
                                <Option value="closed">Closed</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="adminNotes" label="Admin Notes">
                            <Input.TextArea rows={4} placeholder="Internal notes or response to user..." />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Update Feedback
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default FeedbackQueue;
