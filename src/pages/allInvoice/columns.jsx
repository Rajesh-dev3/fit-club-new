import React from 'react';
import { Dropdown, Button, Tag } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

export const getInvoicesColumns = (handleEdit, handleDelete, handleView) => [
  {
    title: 'Invoice No.',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    width: 120,
    // fixed: 'left',
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
    title: 'Payment Date',
    dataIndex: 'paymentDate',
    key: 'paymentDate',
    width: 110,
    render: (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  {
    title: 'Branch Name',
    dataIndex: ['branchId', 'name'],
    key: 'branchName',
    width: 150,
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
    title: 'Trainer Name',
    dataIndex: ['trainerId', 'name'],
    key: 'trainerName',
    width: 130,
    render: (_, record) => record.trainerId?.name || record.trainerName || '-',
  },
  {
    title: 'Sales Person',
    dataIndex: ['salesPersonId', 'name'],
    key: 'salesPersonName',
    width: 130,
    render: (_, record) => record.salesPersonId?.name || record.salesPersonName || '-',
  },
  {
    title: 'Invoice Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => {
      const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
          case 'paid': return 'green';
          case 'pending': return 'orange';
          case 'overdue': return 'red';
          case 'cancelled': return 'default';
          case 'partial': return 'blue';
          default: return 'blue';
        }
      };
      
      return (
        <Tag color={getStatusColor(status)}>
          {(status || 'pending').toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: 'Package Name',
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
    title: 'GST Number',
    dataIndex: 'gstNumber',
    key: 'gstNumber',
    width: 130,
    render: (gstNumber) => gstNumber || '-',
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
    title: 'Discount',
    dataIndex: 'discount',
    key: 'discount',
    width: 100,
    render: (discount) => {
      if (!discount) return '-';
      return typeof discount === 'number' ? `₹${discount.toLocaleString()}` : discount;
    },
  },
  {
    title: 'Taxable amount(₹)',
    dataIndex: 'taxableAmount',
    key: 'taxableAmount',
    width: 140,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title: 'CGST',
    dataIndex: 'cgst',
    key: 'cgst',
    width: 100,
    render: (cgst) => cgst ? `₹${cgst.toLocaleString()}` : '₹0',
  },
  {
    title: 'SGST',
    dataIndex: 'sgst',
    key: 'sgst',
    width: 100,
    render: (sgst) => sgst ? `₹${sgst.toLocaleString()}` : '₹0',
  },
  {
    title: 'Invoice Amount(₹)',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 140,
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
    title: 'Payment Mode',
    dataIndex: 'paymentMode',
    key: 'paymentMode',
    width: 120,
    render: (mode) => mode || '-',
  },
  {
    title: 'View',
    key: 'view',
    width: 80,
    render: (_, record) => (
      <Button 
        type="text" 
        icon={<EyeOutlined />} 
        size="small"
        onClick={() => handleView && handleView(record)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      />
    ),
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