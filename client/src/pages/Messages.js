import React, { useEffect, useState, useRef, useCallback } from 'react'
import Layout from '../components/Layout'
import { List, Input, Button, Avatar, Badge, message as antMessage } from 'antd'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getProfilePicture } from '../utils/profilePicture'
import '../styles/Messages.css'

const Messages = () => {
    const [conversations, setConversations] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedUserName, setSelectedUserName] = useState('')
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [searchParams] = useSearchParams()
    const { user } = useSelector(state => state.user)

    const fetchConversations = useCallback(async () => {
        try {
            const res = await axios.get('/api/v1/user/conversations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                setConversations(res.data.data)
            }
        } catch (error) {
            antMessage.error('Failed to load conversations')
        }
    }, [])

    const fetchMessages = useCallback(async (otherUserId) => {
        try {
            const res = await axios.get(`/api/v1/user/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                setMessages(res.data.data)
                if (res.data.data.length > 0) {
                    const otherUser =
                        res.data.data[0].senderId._id === user._id
                            ? res.data.data[0].receiverId
                            : res.data.data[0].senderId
                    setSelectedUserName(otherUser.name)
                }
                fetchConversations()
            }
        } catch (error) {
            antMessage.error('Failed to fetch messages')
        }
    }, [user._id, fetchConversations])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    useEffect(() => {
        const userIdParam = searchParams.get('userId')
        if (userIdParam) {
            const existingConv = conversations.find(c => c._id === userIdParam)
            if (existingConv) {
                handleSelectConversation(existingConv)
            } else {
                setSelectedUser(userIdParam)
                fetchUserName(userIdParam)
            }
        }
    }, [conversations, searchParams])

    const fetchUserName = async (userId) => {
        try {
            const res = await axios.post(
                '/api/v1/user/getUserData',
                { userId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
            if (res.data.success) {
                setSelectedUserName(res.data.data.name)
            }
        } catch (error) {}
    }

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser)
            const interval = setInterval(() => fetchMessages(selectedUser), 5000)
            return () => clearInterval(interval)
        }
    }, [selectedUser, fetchMessages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return
        try {
            setLoading(true)
            const res = await axios.post(
                '/api/v1/user/messages',
                { receiverId: selectedUser, message: newMessage },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
            if (res.data.success) {
                setNewMessage('')
                fetchMessages(selectedUser)
                fetchConversations()
            } else {
                antMessage.error(res.data.message)
            }
        } catch (error) {
            antMessage.error('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectConversation = (conversation) => {
        setSelectedUser(conversation._id)
        setSelectedUserName(conversation.name)
    }

    return (
        <Layout>
            <div style={{ marginBottom: '30px' }}>
                <h2 className="messages-title">💬 Messages</h2>
                <p className="messages-subtitle">
                    Connect and communicate with mentors and mentees
                </p>
            </div>

            <div className="messages-container">
                <div className="conversations-panel">
                    <h4>Conversations</h4>
                    {conversations.length === 0 ? (
                        <div className="empty-chat">
                            <div className="empty-chat-icon">💬</div>
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        <List
                            dataSource={conversations}
                            renderItem={(item) => (
                                <div
                                    className={`conversation-item ${selectedUser === item._id ? 'active' : ''}`}
                                    onClick={() => handleSelectConversation(item)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Badge count={item.unreadCount}>
                                                <Avatar
                                                    src={
                                                        item.profile?.profilePicture ||
                                                        getProfilePicture({ name: item.name, profile: item.profile })
                                                    }
                                                >
                                                    {item.name?.[0]?.toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                        }
                                        title={item.name}
                                        description={
                                            item.lastMessage
                                                ? item.lastMessage.message.substring(0, 40)
                                                : 'No messages yet'
                                        }
                                    />
                                </div>
                            )}
                        />
                    )}
                </div>

                <div className="chat-panel">
                    {selectedUser ? (
                        <>
                            <div className="messages-area">
                                {messages.map(msg => {
                                    const isSent = msg.senderId._id === user._id
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                                        >
                                            {msg.message}
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <Input.Group compact className="chat-input-area">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onPressEnter={sendMessage}
                                    placeholder="Type a message..."
                                    disabled={loading}
                                />
                                <Button type="primary" onClick={sendMessage} loading={loading}>
                                    Send
                                </Button>
                            </Input.Group>
                        </>
                    ) : (
                        <div className="empty-chat">
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default Messages
