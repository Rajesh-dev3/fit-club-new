import React from 'react';
import { Image, Tag, Button, Dropdown, Switch } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import { EditTrainerRoute } from '../../routes/routepath';

export const getTrainerColumns = (handleView, handleVerify, handleEdit, handleDelete, navigate, handleStatusToggle, statusLoading) => [
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
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 180,
  },
  {
    title: 'Expertise',
    dataIndex: 'trainerType',
    key: 'expertise',
    width: 180,
    render: (types) => Array.isArray(types) && types.length > 0 ? types.join(', ') : '-',
  },
  {
    title: 'Years Of Experience',
    dataIndex: 'experience',
    key: 'yearsOfExperience',
    width: 130,
    align: 'center',
    render: (exp) => exp ? `${exp} ${exp === '1' || exp === 1 ? 'year' : 'years'}` : '-',
  },
  {
    title: 'Profile',
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
    width: 100,
    align: 'center',
    render: (status, record) => (
      <Switch
        checked={status === 'active'}
        loading={statusLoading === record._id}
        onChange={(checked) => handleStatusToggle(record, checked)}
        checkedChildren="On"
        unCheckedChildren="Off"
        size='small'
      />
    ),
  },
  {
    title: 'View',
    key: 'view',
    width: 80,
    align: 'center',
    render: (_, record) => (
      <Button
        type="link"
        icon={<EyeOutlined />}
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
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => navigate(`${EditTrainerRoute}/${record._id}`),
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
