import React from 'react';
import { Dropdown, Button, Tag } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

export const getPartialInvoicesColumns = (handleEdit, handleDelete, handleView) => [
  {
    title: 'Invoice No.',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    width: 120,
    fixed: 'left',
  },
  {
    title: 'Invoice Date',
    dataIndex: 'invoiceDate',
    key: 'invoiceDate',
    width: 110,
    render: (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  {
    title: 'Branch',
    dataIndex: ['branchId', 'name'],
    key: 'branchName',
    width: 130,
    render: (_, record) => record.branchId?.name || record.branchName || '-',
  },
  {
    title: 'Name',
    dataIndex: ['customerId', 'name'],
    key: 'customerName',
    width: 150,
    render: (_, record) => record.customerId?.name || record.customerName || '-',
  },
  {
    title: 'Mobile No.',
    dataIndex: ['customerId', 'mobile'],
    key: 'customerMobile',
    width: 120,
    render: (_, record) => record.customerId?.mobile || record.customerMobile || '-',
  },
  {
    title: 'Service Type',
    dataIndex: 'serviceType',
    key: 'serviceType',
    width: 120,
    render: (serviceType) => serviceType || '-',
  },
  {
    title: 'Sales Person',
    dataIndex: ['salesPersonId', 'name'],
    key: 'salesPersonName',
    width: 130,
    render: (_, record) => record.salesPersonId?.name || record.salesPersonName || '-',
  },
  {
    title: 'Package',
    dataIndex: ['packageId', 'name'],
    key: 'packageName',
    width: 150,
    render: (_, record) => record.packageId?.name || record.packageName || '-',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 110,
    render: (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  {
    title: 'Expiry Date',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 110,
    render: (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  {
    title: 'Package Price(₹)',
    dataIndex: 'packagePrice',
    key: 'packagePrice',
    width: 130,
    render: (price) => price ? `₹${price.toLocaleString()}` : '₹0',
  },
  {
    title: 'Items Price(₹)',
    dataIndex: 'itemsPrice',
    key: 'itemsPrice',
    width: 120,
    render: (price) => price ? `₹${price.toLocaleString()}` : '₹0',
  },
  {
    title: 'Total Amount(₹)',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 130,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title: 'Partial Amount(₹)',
    dataIndex: 'partialAmount',
    key: 'partialAmount',
    width: 130,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title: 'Due Amount(₹)',
    dataIndex: 'dueAmount',
    key: 'dueAmount',
    width: 120,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (_, record) => {
      const items = [
        {
          key: 'view',
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOutlined />
              View
            </span>
          ),
          onClick: () => handleView && handleView(record),
        },
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