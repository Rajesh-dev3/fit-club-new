import React from 'react';
import { Tag, Button, Dropdown, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

export const getPackageColumns = (handleView, handleEdit, handleDelete) => [
  {
    title: 'Package Type',
    dataIndex: 'type',
    key: 'packageType',
    width: 150,
    render: (type) => type ? type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') : '-',
  },
  {
    title: 'Branch Name',
    key: 'branchName',
    width: 150,
    render: (_, record) => {
      // Handle multiple branches (branchIds array)
      if (record.branchIds && Array.isArray(record.branchIds) && record.branchIds.length > 0) {
        if (record.branchIds.length === 1) {
          // Single branch in array
          return record.branchIds[0]?.name || '-';
        } else {
          // Multiple branches - show in tooltip
          const branchNames = record.branchIds.map(branch => branch?.name).filter(Boolean);
          const displayText = `${branchNames[0]} (+${branchNames.length - 1} more)`;
          const tooltipContent = (
            <div>
              {branchNames.map((name, index) => (
                <div key={index}>{name}</div>
              ))}
            </div>
          );
          return (
            <Tooltip title={tooltipContent} placement="topLeft">
              <span style={{ cursor: 'pointer' }}>{displayText}</span>
            </Tooltip>
          );
        }
      }
      // Handle single branch (legacy branchId object)
      else if (record.branchId) {
        return record.branchId?.name || '-';
      }
      return '-';
    },
  },
  {
    title: 'Package Name',
    dataIndex: 'name',
    key: 'packageName',
    width: 200,
  },
  {
    title: 'Package Pricing(₹)',
    dataIndex: 'pricing',
    key: 'pricing',
    width: 150,
    render: (price) => price ? `₹${price}` : '-',
  },
  {
    title: 'Number Of Days',
    dataIndex: 'numberOfDays',
    key: 'numberOfDays',
    width: 130,
    render: (days) => days || '-',
  },
  {
    title: 'Freezable',
    dataIndex: 'freezable',
    key: 'freezable',
    width: 100,
    align: 'center',
    render: (freezable) => (
      <Tag color={freezable ? 'green' : 'red'}>
        {freezable ? 'YES' : 'NO'}
      </Tag>
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