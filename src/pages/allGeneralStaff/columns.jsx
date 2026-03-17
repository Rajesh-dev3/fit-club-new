import React from 'react';
import { Image, Tag, Button, Dropdown, Switch, Spin } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, MoreOutlined, LockOutlined } from '@ant-design/icons';
import { EditGeneralStaffRoute } from '../../routes/routepath';

export const getGeneralStaffColumns = (handleView, handleVerify, handleEdit, handleDelete, handleChangePassword, navigate, handleStatusToggle, statusLoading) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    width: 150,
    render: (role) => role || '-',
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    width: 150,
    render: (branchName) => branchName || '-',
  },
  {
    title: 'Image',
    dataIndex: 'photo',
    key: 'profile',
    width: 80,
    align: 'center',
    render: (url) => (
      <Image
        src={url || 'https://via.placeholder.com/40'}
        alt="profile"
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
        preview={{
          mask: <EyeOutlined />,
        }}
      />
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    align: 'center',
    render: (status, record) => {
      const isLoading = statusLoading === record._id;
      return (
        <Spin spinning={isLoading} size="small">
          <Switch
            checked={status === 'active'}
            onChange={(checked) => handleStatusToggle(record._id, checked)}
            checkedChildren="On"
            unCheckedChildren="Off"
            disabled={isLoading}
            size='small'
          />
        </Spin>
      );
    },
  },
  {
    title: 'View',
    key: 'view',
    width: 80,
    align: 'center',
    render: (_, record) => (
      <Button
        type="text"
        icon={<EyeOutlined style={{ fontSize: 18, color: 'var(--sider-text)' }} />}
        onClick={() => handleView(record)}
      />
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 80,
    align: 'center',
    render: (_, record) => {
      const menuItems = [
        {
          key: 'verify',
          label: 'Verify',
          icon: <CheckOutlined />,
          onClick: () => handleVerify(record),
        },
        {
          key: 'change-password',
          label: 'Change Password',
          icon: <LockOutlined />,
          onClick: () => handleChangePassword(record),
        },
        {
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => navigate(`${EditGeneralStaffRoute}/${record._id}`),
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => handleDelete(record),
        },
      ];

      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  },
];
