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
            console.log('Fetching conversations...')
            const res = await axios.get('/api/v1/user/conversations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                console.log('Conversations fetched:', res.data.data.length)
                setConversations(res.data.data)
            } else {
                console.error('Failed to fetch conversations:', res.data.message)
            }
        } catch (error) {
            console.error('Error fetching conversations:', error)
            console.error('Error response:', error.response?.data)
        }
    }, [])

    const fetchMessages = useCallback(async (otherUserId) => {
        try {
            console.log('Fetching messages with user:', otherUserId)
            const res = await axios.get(`/api/v1/user/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.data.success) {
                console.log('Messages fetched:', res.data.data.length)
                setMessages(res.data.data)
                // Get the other user's name from the first message or conversations
                if (res.data.data.length > 0) {
                    const otherUser = res.data.data[0].senderId._id === user._id 
                        ? res.data.data[0].receiverId 
                        : res.data.data[0].senderId
                    setSelectedUserName(otherUser.name)
                } else {
                    // If no messages, try to get name from conversations
                    const conv = conversations.find(c => c._id === otherUserId)
                    if (conv) {
                        setSelectedUserName(conv.name)
                    }
                }
                // Refresh conversations to update unread counts
                fetchConversations()
            } else {
                console.error('Failed to fetch messages:', res.data.message)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            console.error('Error response:', error.response?.data)
            antMessage.error('Failed to fetch messages')
        }
    }, [user._id, conversations, fetchConversations])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    useEffect(() => {
        // Check if there's a userId in URL params (for starting new conversation)
        const userIdParam = searchParams.get('userId')
        if (userIdParam) {
            console.log('URL param userId:', userIdParam)
            // Find the user in conversations
            const existingConv = conversations.find(c => c._id === userIdParam)
            if (existingConv) {
                console.log('Found existing conversation')
                handleSelectConversation(existingConv)
            } else {
                // Start new conversation with this user
                console.log('Starting new conversation')
                setSelectedUser(userIdParam)
                // Fetch user name
                fetchUserName(userIdParam)
            }
        }
    }, [conversations, searchParams])
    
    const fetchUserName = async (userId) => {
        try {
            console.log('Fetching user name for:', userId)
            const res = await axios.post('/api/v1/user/getUserData', 
                { userId: userId },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            )
            if (res.data.success) {
                console.log('Got user name:', res.data.data.name)
                setSelectedUserName(res.data.data.name)
            }
        } catch (error) {
            console.error('Error fetching user name:', error)
        }
    }

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser)
            // Auto-refresh messages every 5 seconds
            const interval = setInterval(() => {
                fetchMessages(selectedUser)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [selectedUser, fetchMessages])

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) {
            console.log('Cannot send: empty message or no user selected')
            return
        }
        
        try {
            setLoading(true)
            console.log('Sending message to:', selectedUser)
            console.log('Message:', newMessage)
            
            const res = await axios.post('/api/v1/user/messages', {
                receiverId: selectedUser,
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            
            console.log('Send message response:', res.data)
            
            if (res.data.success) {
                console.log('✓ Message sent successfully')
                setNewMessage('')
                fetchMessages(selectedUser)
                fetchConversations() // Refresh to show new conversation
            } else {
                console.error('Failed to send message:', res.data.message)
                antMessage.error(res.data.message || 'Failed to send message')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            console.error('Error response:', error.response?.data)
            antMessage.error(error.response?.data?.message || 'Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectConversation = (conversation) => {
        setSelectedUser(conversation._id)
        setSelectedUserName(conversation.name)
    }


    // Debug logging
    console.log('Messages component state:', {
        selectedUser,
        selectedUserName,
        messagesCount: messages.length,
        conversationsCount: conversations.length,
        urlUserId: searchParams.get('userId')
    })

    return (
        <Layout>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                    textAlign: 'center',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '10px'
                }}>
                    💬 Messages
                </h2>
                <p style={{ textAlign: 'center', color: '#6C757D', fontSize: '1.1rem' }}>
                    Connect and communicate with mentors and mentees
                </p>
            </div>
            <div className="messages-container">
                <div className="conversations-panel">
                    <h4>Conversations</h4>
                    {conversations.length === 0 ? (
                        <div className="empty-chat">
                            <div className="empty-chat-icon">💬</div>
                            <p style={{ textAlign: 'center', color: '#6C757D' }}>
                                No conversations yet. Start messaging from a mentor profile!
                            </p>
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
                                            <Badge count={item.unreadCount} offset={[-5, 5]}>
                                                <Avatar 
                                                    src={item.profile?.profilePicture ? item.profile.profilePicture : getProfilePicture({ name: item.name, profile: item.profile })}
                                                    style={{ 
                                                        background: !item.profile?.profilePicture ? (selectedUser === item._id ? '#FFB800' : '#DC143C') : 'transparent',
                                                        color: selectedUser === item._id ? '#0D0D0D' : 'white',
                                                        fontWeight: 700,
                                                        border: '2px solid ' + (selectedUser === item._id ? '#FFB800' : '#DC143C')
                                                    }}
                                                >
                                                    {!item.profile?.profilePicture && item.name?.[0]?.toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                        }
                                        title={
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                color: selectedUser === item._id ? 'white' : '#212529',
                                                fontWeight: 600
                                            }}>
                                                <span>{item.name}</span>
                                                {item.unreadCount > 0 && (
                                                    <Badge 
                                                        count={item.unreadCount} 
                                                        style={{ 
                                                            backgroundColor: selectedUser === item._id ? '#FFB800' : '#DC143C',
                                                            color: selectedUser === item._id ? '#0D0D0D' : 'white'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        }
                                        description={
                                            item.lastMessage ? (
                                                <div style={{ color: selectedUser === item._id ? 'rgba(255,255,255,0.9)' : '#6C757D' }}>
                                                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                                                        {item.lastMessage.message.substring(0, 40)}
                                                        {item.lastMessage.message.length > 40 ? '...' : ''}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                                        {new Date(item.lastMessage.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: selectedUser === item._id ? 'rgba(255,255,255,0.7)' : '#6C757D' }}>
                                                    No messages yet
                                                </span>
                                            )
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
                            <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar 
                                    size={40}
                                    src={(() => {
                                        const otherUser = conversations.find(c => c._id === selectedUser);
                                        return otherUser?.profile?.profilePicture 
                                            ? otherUser.profile.profilePicture 
                                            : getProfilePicture({ name: selectedUserName || 'User', profile: otherUser?.profile });
                                    })()}
                                    style={{ border: '2px solid white' }}
                                >
                                    {selectedUserName?.[0]?.toUpperCase()}
                                </Avatar>
                                <span>💬 Chat with {selectedUserName || 'Loading...'}</span>
                            </div>
                            <div className="messages-area">
                                {messages.length === 0 ? (
                                    <div className="empty-chat">
                                        <div className="empty-chat-icon">💭</div>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSent = msg.senderId._id === user._id;
                                        const otherUser = isSent ? msg.receiverId : msg.senderId;
                                        return (
                                            <div
                                                key={msg._id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    justifyContent: isSent ? 'flex-end' : 'flex-start',
                                                    marginBottom: '15px',
                                                    gap: '10px'
                                                }}
                                            >
                                                {!isSent && (
                                                    <Avatar 
                                                        size={32}
                                                        src={otherUser?.profile?.profilePicture 
                                                            ? otherUser.profile.profilePicture 
                                                            : getProfilePicture({ name: otherUser?.name || 'User', profile: otherUser?.profile })}
                                                        style={{ border: '2px solid #DC143C', flexShrink: 0 }}
                                                    >
                                                        {!otherUser?.profile?.profilePicture && otherUser?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                                                >
                                                    <div>{msg.message}</div>
                                                    <div className="message-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                {isSent && (
                                                    <Avatar 
                                                        size={32}
                                                        src={user?.profile?.profilePicture 
                                                            ? user.profile.profilePicture 
                                                            : getProfilePicture(user)}
                                                        style={{ border: '2px solid #DC143C', flexShrink: 0 }}
                                                    >
                                                        {!user?.profile?.profilePicture && user?.name?.[0]?.toUpperCase()}
                                                    </Avatar>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input-area">
                                <Input.Group compact>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onPressEnter={sendMessage}
                                        placeholder="Type a message..."
                                        disabled={loading}
                                        style={{ 
                                            width: 'calc(100% - 100px)',
                                            height: '48px',
                                            borderRadius: '10px 0 0 10px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Button 
                                        type="primary" 
                                        onClick={sendMessage} 
                                        loading={loading}
                                        style={{
                                            width: '100px',
                                            height: '48px',
                                            borderRadius: '0 10px 10px 0',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Send
                                    </Button>
                                </Input.Group>
                            </div>
                        </>
                    ) : (
                        <div className="empty-chat">
                            <div className="empty-chat-icon">💬</div>
                            <h3 style={{ color: '#6C757D', marginBottom: '10px' }}>Select a conversation</h3>
                            <p style={{ color: '#6C757D' }}>Choose a conversation from the list or visit a mentor's profile to start a new conversation</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default Messages

