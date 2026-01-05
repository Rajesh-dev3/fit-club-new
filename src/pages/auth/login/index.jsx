import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "./styles.scss";
import { whiteLogo } from "../../../assets";
import { useState } from "react";
import { useEmailCheckMutation, useLoginMutation } from "../../../services/auth";

const Login = () => {
  const [email, setEmail] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');

  const [emailCheck, { isLoading: checking }] = useEmailCheckMutation();
  const [loginMutation, { isLoading: logging }] = useLoginMutation();

  const handleContinue = async () => {
    if (!email) return;
    try {
      const res = await emailCheck({ email }).unwrap();
      // interpret truthy success flag or boolean response
      const ok = res?.success ?? res?.status ?? res?.exists ?? res === true;
      if (ok) {
        setRequiresPassword(true);
      } 
    } catch (err) {
     console.error('Email check failed', err);
    }
  };

  const handleLogin = async () => {
    if (!password) return;
    try {
      const res = await loginMutation({ email, password }).unwrap();
      message.success(res?.message || 'Login successful');
      // store token and user data in localStorage if present
      if (res?.token) {
        try {
          localStorage.setItem('token', res.token);
        } catch (e) {
          console.warn('Failed to save token to localStorage', e);
        }
      }
      if (res?.user) {
        try {
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch (e) {
          console.warn('Failed to save user to localStorage', e);
        }
      }
      // redirect to home/dashboard
      try {
        window.location.href = '/';
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Typography.Title level={2} className="title">
            <img src={whiteLogo} alt="" />
        </Typography.Title>

        <div className="card-box">
          <div className="logo-circle">F</div>
          <h2>Power Up Your Management</h2>
          <p>All member data, analytics, and tools in one place.</p>

          <Form layout="vertical" onFinish={requiresPassword ? handleLogin : handleContinue}>
            {!requiresPassword ? (
              <Form.Item label="Email">
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
            ) : (
              <Form.Item label="Password">
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Item>
            )}

            <div className="forgot">Forgot Password?</div>

            <Button
              type="primary"
              block
              className="signin-btn"
              htmlType="submit"
              loading={requiresPassword ? logging : checking}
            >
              {requiresPassword ? 'Sign In' : 'Continue to Signin'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
