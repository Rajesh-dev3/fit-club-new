import React from 'react';
import { Button, Tag, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

const allColumns = [
  {
    title: 'Branch Name',
    dataIndex: 'branch',
    key: 'branch',
    width: 150,
  },
  {
    title: 'Package Type',
    dataIndex: 'packageType',
    key: 'packageType',
    width: 150,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Session',
    dataIndex: 'session',
    key: 'session',
    width: 100,
  },
  {
    title: 'Pricing',
    dataIndex: 'pricing',
    key: 'pricing',
    width: 120,
  },
  {
    title: 'Number Of Days',
    dataIndex: 'numberOfDays',
    key: 'numberOfDays',
    width: 120,
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
          onClick: () => {},
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />, 
          danger: true,
          onClick: () => {},
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

export default allColumns;
