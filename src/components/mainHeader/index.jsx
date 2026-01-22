import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";
import { FiMoon, FiSun } from "react-icons/fi";
import { Select, Avatar, Dropdown, Spin, Modal, Form, Input, Button, message } from "antd";
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { useGetBranchesQuery } from "../../services/branches";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranch } from "../../services/branchSlice";
import "./styles.scss";
import { useSelfChangePasswordMutation } from "../../services/auth";

const MainHeader = ({ collapsed, setCollapsed, isMobile, toggleMobileDrawer }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const dispatch = useDispatch();
  const selectedBranch = useSelector(state => state.branch.selectedBranch);
  const [selfChangePassword, { isLoading: changingPassword }] = useSelfChangePasswordMutation();
  const { data: branchData, isLoading: branchLoading } = useGetBranchesQuery();
  
  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm] = Form.useForm();

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        return JSON.parse(userString);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  const userData = getUserData();
  const userName = userData?.name || 'User';

  const handleMenuClick = () => {
    if (isMobile) {
      toggleMobileDrawer();
    } else {
      setCollapsed(!collapsed);
    }
  };

 const handleLogout = () => {
  try {
    // Auth & user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Permission / menu cache
    localStorage.removeItem('siderMenuData');

    // Optional
    sessionStorage.clear();
  } catch (e) {
    console.warn('Failed to clear storage on logout', e);
  }

  // Hard redirect (most reliable)
  window.location.replace('/login');
};

  const profileMenu = {
    items: [
      {
        key: "1",
        label: <div className="profile-name">{userName}</div>,
        disabled: true,
      },
      { type: "divider" },
      {
        key: "2",
        label: (
          <div className="change-password-item" onClick={() => setShowPasswordModal(true)}>
            <KeyOutlined /> Change Password
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div className="logout-item" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </div>
        ),
      },
    ],
  };

  // Password change handlers
  const handlePasswordSubmit = async (values) => {
    try {
      await selfChangePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      }).unwrap();
      
      setShowPasswordModal(false);
      passwordForm.resetFields();
      localStorage.clear()
      window.location.replace('/login');
    } catch (error) {
      message.error(error?.data?.message);
    }
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    passwordForm.resetFields();
  };

  // Password validation
  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('newPassword') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match!'));
    }
  });

  return (
    <>
      <header className="main-header">
      <div className="left-section">
        <button className="menu-btn" onClick={handleMenuClick}>
          <IoMenu />
        </button>

        <Select
          value={selectedBranch || undefined}
          className="dark-select"
          classNames={{ popup: { root: 'dark-select-dropdown' } }}
          style={{ minWidth: 180 }}
          loading={branchLoading}
          placeholder="Select Branch"
          onChange={val => dispatch(setSelectedBranch(val))}
          optionFilterProp="children"
          showSearch
        >
          <Select.Option value="all" >All</Select.Option>
          {branchData?.data?.map(b => (
            <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Switch theme"
        >
          {isLight ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <Dropdown
          menu={profileMenu}
          placement="bottomRight"
          arrow
        >
          <Avatar
            size={40}
            className="profile-avatar"
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--accent)", color: "var(--sider-text)" }}
          />
        </Dropdown>
      </div>
    </header>

    {/* Change Password Modal */}
    <Modal
      title="Change Password"
      open={showPasswordModal}
      onCancel={handlePasswordModalCancel}
      footer={null}
      width={500}
      className="change-password-modal"
    >
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordSubmit}
        className="password-form"
      >
        <Form.Item
          label="Current Password"
          name="oldPassword"
          rules={[
            { required: true, message: 'Please enter your current password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm new password' },
            validateConfirmPassword(passwordForm)
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <div className="modal-actions">
          <Button 
            type="default" 
            onClick={handlePasswordModalCancel}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="submit-btn"
            loading={changingPassword}
          >
            Change Password
          </Button>
        </div>
      </Form>
    </Modal>
    </>
  );
};

export default MainHeader;
