import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Descriptions, Tag, Button, message, Form, Input, Upload, Avatar } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { setUser } from '../redux/features/userSlice'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import { getProfilePicture } from '../utils/profilePicture'
import '../styles/Profile.css'

const Profile = () => {
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [isEditing, setIsEditing] = useState(false)
    const [form] = Form.useForm()
    const [profilePicture, setProfilePicture] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                phone: user.profile?.phone || '',
                address: user.profile?.address || '',
                bio: user.profile?.bio || '',
                linkedin: user.profile?.linkedin || '',
                github: user.profile?.github || '',
            })
            setImagePreview(getProfilePicture(user))
        }
    }, [user, form])

    const handleImageChange = (info) => {
        if (info.file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result
                setProfilePicture(base64String)
                setImagePreview(base64String)
            }
            reader.readAsDataURL(info.file)
        }
    }

    const handleUpdate = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.put('/api/v1/user/update-profile', {
                userId: user._id,
                name: values.name,
                profile: {
                    phone: values.phone,
                    address: values.address,
                    bio: values.bio,
                    linkedin: values.linkedin,
                    github: values.github,
                    profilePicture: profilePicture || user?.profile?.profilePicture,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            dispatch(hideLoading())
            if (res.data.success) {
                dispatch(setUser(res.data.data))
                message.success('Profile updated successfully!')
                setIsEditing(false)
                setProfilePicture(null)
            } else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            message.error(error.response?.data?.message || 'Failed to update profile')
        }
    }

    return (
        <Layout>
            <div className="profile-header">
                <h2 className="profile-title">👤 My Profile</h2>
                <p className="sessions-subtitle">Manage your profile information</p>
            </div>
            <div className='row justify-content-center'>
                <div className='col-md-10'>
                    <Card
                        className="profile-card"
                        title={
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.3rem' }}>
                                Profile Information
                            </span>
                        }
                        headStyle={{ background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)' }}
                        extra={
                            <Button
                                type={isEditing ? 'default' : 'primary'}
                                className="profile-edit-btn"
                                onClick={() => {
                                    if (isEditing) {
                                        form.resetFields()
                                    }
                                    setIsEditing(!isEditing)
                                }}
                            >
                                {isEditing ? '✗ Cancel' : '✏️ Edit Profile'}
                            </Button>
                        }
                    >
                        {isEditing ? (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleUpdate}
                                className="profile-form"
                            >
                                <Form.Item label="Profile Picture">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                        <Avatar 
                                            size={100} 
                                            src={imagePreview} 
                                            icon={<UserOutlined />}
                                            style={{ border: '3px solid #DC143C' }}
                                        />
                                        <Upload
                                            beforeUpload={() => false}
                                            onChange={handleImageChange}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined />}>Upload Photo</Button>
                                        </Upload>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, type: 'email' }]}
                                >
                                    <Input disabled />
                                </Form.Item>
                                <Form.Item label="Phone" name="phone">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Address" name="address">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Bio" name="bio">
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                                <Form.Item label="LinkedIn" name="linkedin">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="GitHub" name="github">
                                    <Input />
                                </Form.Item>
                                <Form.Item>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit"
                                        style={{
                                            borderRadius: '10px',
                                            height: '45px',
                                            padding: '0 32px',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        💾 Save Changes
                                    </Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    <Avatar 
                                        size={120} 
                                        src={getProfilePicture(user)} 
                                        icon={<UserOutlined />}
                                        style={{ 
                                            border: '4px solid #DC143C',
                                            boxShadow: '0 4px 15px rgba(220, 20, 60, 0.3)'
                                        }}
                                    />
                                </div>
                                <Descriptions 
                                    column={1} 
                                    bordered
                                    className="profile-descriptions"
                                >
                                    <Descriptions.Item label="Name">
                                        {user?.name || 'N/A'}
                                    </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {user?.email || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Role">
                                    <Tag color={user?.role === 'admin' ? 'red' : user?.role === 'mentor' ? 'blue' : 'green'}>
                                        {user?.role?.toUpperCase() || 'MENTEE'}
                                    </Tag>
                                </Descriptions.Item>
                                {user?.mentorStatus && (
                                    <Descriptions.Item label="Mentor Status">
                                        <Tag color={
                                            user?.mentorStatus === 'approved' ? 'green' :
                                            user?.mentorStatus === 'pending' ? 'orange' : 'red'
                                        }>
                                            {user?.mentorStatus?.toUpperCase() || 'N/A'}
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Phone">
                                    {user?.profile?.phone || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Address">
                                    {user?.profile?.address || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Bio">
                                    {user?.profile?.bio || 'N/A'}
                                </Descriptions.Item>
                                {user?.profile?.linkedin && (
                                    <Descriptions.Item label="LinkedIn">
                                        <a href={user.profile.linkedin} target="_blank" rel="noopener noreferrer">
                                            {user.profile.linkedin}
                                        </a>
                                    </Descriptions.Item>
                                )}
                                {user?.profile?.github && (
                                    <Descriptions.Item label="GitHub">
                                        <a href={user.profile.github} target="_blank" rel="noopener noreferrer">
                                            {user.profile.github}
                                        </a>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </Layout>
    )
}

export default Profile

