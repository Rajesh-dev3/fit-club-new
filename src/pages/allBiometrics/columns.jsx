import React from 'react';
import { Dropdown, Button } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const getBiometricsColumns = (handleEdit, handleDelete) => [
  {
    title: 'Id',
    dataIndex: '_id',
    key: 'id',
    width: 100,
    render: (id, record, index) => index + 1,
  },
  {
    title: 'Machine Id',
    dataIndex: 'machineId',
    key: 'machineId',
    width: 130,
  },
  {
    title: 'Branch Name',
    dataIndex: ['branchId', 'name'],
    key: 'branchName',
    width: 150,
    render: (_, record) => record.branchId?.name || '-',
  },
  {
    title: 'Branch Address',
    dataIndex: ['branchId', 'address'],
    key: 'branchAddress',
    width: 200,
    render: (_, record) => record.branchId?.address || '-',
  },
  {
    title: 'Floor',
    dataIndex: 'floor',
    key: 'floor',
    width: 100,
    render: (floor) => floor || '-',
  },
  {
    title: 'Record Purpose',
    dataIndex: 'recordPurpose',
    key: 'recordPurpose',
    width: 150,
    render: (purpose) => purpose || '-',
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (_, record) => {
      const items = [
        {
          key: 'edit',
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EditOutlined />
              Edit
            </span>
          ),
          onClick: () => handleEdit(record),
        },
        {
          key: 'delete',
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeleteOutlined />
              Delete
            </span>
          ),
          onClick: () => handleDelete(record),
          danger: true,
        },
      ];

      return (
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            size="small"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          />
        </Dropdown>
      );
    },
  },
];