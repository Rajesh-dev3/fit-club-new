import React from 'react';
import { Image, Tag, Button, Dropdown } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

export const getEmployeeColumns = (handleView, handleEdit, handleDelete) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: 'Designation',
    dataIndex: 'designation',
    key: 'designation',
    width: 150,
    render: (designation) => designation || '-',
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: 'Branch Name',
    dataIndex: 'branches',
    key: 'branchName',
    width: 150,
    render: (branches) => {
      if (Array.isArray(branches) && branches.length > 0) {
        return branches.map(b => b.name).join(', ');
      }
      return '-';
    },
  },
  {
    title: 'Image',
    dataIndex: 'profile',
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
    width: 100,
    align: 'center',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status === 'active' ? 'ACTIVE' : 'INACTIVE'}
      </Tag>
    ),
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
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => handleEdit(record),
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
