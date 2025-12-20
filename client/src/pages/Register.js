import { Form, Input, message, Radio } from 'antd'
import '../styles/RegisterForm.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post("/api/v1/user/register", values)
            dispatch(hideLoading())

            if (res.data.success) {
                message.success('Register Successfully!')
                navigate('/login')
            }
            else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error(error.response?.data?.message || 'Something went wrong');

        }
    }
    return (
        <>
            <div className='container-form'>
                <Form layout='vertical' onFinish={onFinishHandler} className='register-form'>
                    <h3 className='text-center'>SkillConnect Registration</h3>
                    <Form.Item label='Name' name='name' rules={[{ required: true }]}>
                        <Input type='text' required />
                    </Form.Item>
                    <Form.Item label='Email' name='email' rules={[{ required: true, type: 'email' }]}>
                        <Input type='email' required />
                    </Form.Item>
                    <Form.Item label='Password' name='password' rules={[{ required: true, min: 6 }]}>
                        <Input type='password' required />
                    </Form.Item>
                    <Form.Item label='I want to register as' name='role' rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value="mentee">Mentee (Student)</Radio>
                            <Radio value="mentor">Mentor (Alumni)</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <button className='btn btn-primary' type='submit'>Register</button>
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to='/login'>Already a user? Login here!</Link>
                    </div>
                </Form>
            </div>
        </>
    )
}

export default Register