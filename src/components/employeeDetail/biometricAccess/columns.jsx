import React from 'react';
import { Tag } from 'antd';

export const getBiometricAccessColumns = () => [
  {
    title: 'Machine ID',
    dataIndex: 'machineId',
    key: 'machineId',
    width: 120,
  },
  {
    title: 'In / Out',
    dataIndex: 'inOut',
    key: 'inOut',
    width: 120,
    render: (value) => (
      <Tag color={value === 'In' ? 'green' : 'red'}>
        {value}
      </Tag>
    ),
  },
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    width: 150,
  },
  {
    title: 'Branch Floor',
    dataIndex: 'branchFloor',
    key: 'branchFloor',
    width: 130,
  },
];
