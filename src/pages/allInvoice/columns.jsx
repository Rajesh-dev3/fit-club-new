import React from 'react';
import { Dropdown, Button, Tag } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { InvoiceDetailRoute, EditInvoiceRoute } from '../../routes/routepath';

export const getInvoicesColumns = (handleEdit, handleDelete, handleView) => [
  {
    title: 'Invoice No.',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    width: 120,
    render: (invoiceNumber, record) => (
      <Link 
        to={`${InvoiceDetailRoute}/${record._id}`}
        style={{ color: '#1890ff', textDecoration: 'none' }}
      >
        {invoiceNumber}
      </Link>
    ),
    // fixed: 'left',
  },
  {
    title: 'Invoice Date',
    dataIndex: 'invoiceDate',
    key: 'invoiceDate',
    width: 160,
    render: (date) => {
      if (!date) return '-';
      const d = new Date(date);
      const dateStr = d.toLocaleDateString('en-IN');
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} ${timeStr}`;
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
    dataIndex: ['userId', 'name'],
    key: 'customerName',
    width: 150,
    render: (_, record) => record.userId?.name || record.customerName || '-',
  },
  {
    title: 'Mobile No.',
    dataIndex: ['userId', 'phoneNumber'],
    key: 'customerMobile',
    width: 120,
    render: (_, record) => record.userId?.phoneNumber || record.customerNumber || '-',
  },
  {
    title: 'Service Type',
    dataIndex: ['membershipId', 'type'],
    key: 'serviceType',
    width: 120,
    render: (_, record) => {
      const type = record.membershipId?.type || record.serviceType;
      if (!type) return '-';
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
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
    dataIndex: ['employeeId', 'name'],
    key: 'salesPersonName',
    width: 130,
    render: (_, record) => record.employeeId?.user?.name || record.employeeId?.name || record.salesPersonId?.name || record.salesPerson?.name || '-',
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
    dataIndex: ['planId', 'name'],
    key: 'packageName',
    width: 150,
    render: (_, record) => record.planId?.name || record.packageName || '-',
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
    dataIndex: 'planPrice',
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
    dataIndex: 'discountAmount',
    key: 'discount',
    width: 100,
    render: (discount) => {
      if (!discount) return '-';
      return typeof discount === 'number' ? `₹${discount.toLocaleString()}` : discount;
    },
  },
  {
    title: 'Taxable amount(₹)',
    dataIndex: 'afterDiscount',
    key: 'taxableAmount',
    width: 140,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title: 'CGST',
    dataIndex: 'gstAmount',
    key: 'cgst',
    width: 100,
    render: (gstAmount) => gstAmount ? `₹${(gstAmount / 2).toLocaleString()}` : '₹0',
  },
  {
    title: 'SGST',
    dataIndex: 'gstAmount',
    key: 'sgst',
    width: 100,
    render: (gstAmount) => gstAmount ? `₹${(gstAmount / 2).toLocaleString()}` : '₹0',
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
    dataIndex: 'paymentType',
    key: 'paymentMode',
    width: 120,
    render: (mode) => mode === 'fullPayment' ? 'Full Payment' : (mode || '-'),
  },
  {
    title: 'Receipt',
    key: 'view',
    width: 80,
    render: (_, record) => (
      <Link 
        to={`${InvoiceDetailRoute}/${record._id}`}
        style={{ color: '#1890ff', textDecoration: 'none' }}
      >
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          size="small"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        />
      </Link>
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
            <Link 
              to={`${EditInvoiceRoute}/${record._id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
            >
              <EditOutlined />
              Edit
            </Link>
          ),
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