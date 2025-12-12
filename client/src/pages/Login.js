import React from 'react'
import { Form, Input, message } from 'antd'
import '../styles/RegisterForm.css'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import { setUser } from '../redux/features/userSlice'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post("/api/v1/user/login", values)
            dispatch(hideLoading())

            if (res.data.success) {
                message.success('Login Successfully!')
                localStorage.setItem("token", res.data.token)

                const userRes = await axios.post(
                    "/api/v1/user/getUserData",
                    {},
                    {
                        headers: {
                            Authorization: "Bearer " + res.data.token
                        }
                    }
                )

                if (userRes.data.success) {
                    dispatch(setUser(userRes.data.data))
                    navigate("/")
                } else {
                    message.error("Failed to fetch user data")
                }
            } else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error('Something went wrong')
        }
    }

    return (
        <div className='container-form'>
            <Form
                layout='vertical'
                onFinish={onFinishHandler}
                className='register-form'
            >
                <h3 className='text-center'>SkillConnect Login</h3>
                <Form.Item label='Email' name='email'>
                    <Input type='email' required />
                </Form.Item>
                <Form.Item label='Password' name='password'>
                    <Input type='password' required />
                </Form.Item>
                <button className='btn btn-primary' type='submit'>Login</button>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to='/register'>Not a user? Register here!</Link>
                </div>
            </Form>
        </div>
    )
}

export default Login
