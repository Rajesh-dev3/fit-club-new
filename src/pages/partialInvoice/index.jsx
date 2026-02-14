import React, { useState, useMemo } from 'react';
import { HomeOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Modal, message, Select } from 'antd';
import PageBreadcrumb from '../../components/breadcrumb';
import AddButton from '../../components/addButton';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import DateRangeSelector from '../../components/dateRange/DateRangeSelector';
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from '../../services/invoice';
import { getPartialInvoicesColumns } from './columns';
import { Home, AddInvoiceRoute } from '../../routes/routepath';
import './styles.scss';

const { Option } = Select;

const PartialInvoice = () => {
  const navigate = useNavigate();
  const { data: invoicesData, isLoading, error } = useGetInvoicesQuery();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("partial");
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceNumber: true,
    invoiceDate: true,
    branchName: true,
    customerName: true,
    customerMobile: true,
    serviceType: true,
    salesPersonName: true,
    packageName: true,
    startDate: true,
    expiryDate: true,
    packagePrice: true,
    itemsPrice: true,
    totalAmount: true,
    partialAmount: true,
    dueAmount: true,
    actions: true,
  });

  const invoices = invoicesData?.data || [];

  // Search, status and date filter
  const filteredData = useMemo(() => {
    let result = invoices;

    // Filter for partial invoices only
    result = result.filter(item => {
      const status = item.status?.toLowerCase() || 'pending';
      return status === 'partial' || (item.dueAmount && item.dueAmount > 0);
    });

    // Apply additional status filter if needed
    if (statusFilter !== "all") {
      result = result.filter(item => {
        const status = item.status?.toLowerCase() || 'pending';
        return status === statusFilter;
      });
    }

    // Apply search filter
    if (searchText) {
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchText.toLowerCase())
        ) ||
        // Also search in nested customer and branch data
        (item.customerId?.name && String(item.customerId.name).toLowerCase().includes(searchText.toLowerCase())) ||
        (item.branchId?.name && String(item.branchId.name).toLowerCase().includes(searchText.toLowerCase())) ||
        (item.invoiceNumber && String(item.invoiceNumber).toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Apply date range filter
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      result = result.filter(item => {
        if (!item.invoiceDate) return false;
        const invoiceDate = new Date(item.invoiceDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Set time to start/end of day for accurate comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    return result;
  }, [searchText, invoices, dateRange, statusFilter]);

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Handle view action
  const handleView = (record) => {
    // Navigate to view invoice page when implemented
    console.log('View partial invoice:', record);
    // navigate(`/view-invoice/${record._id}`);
  };

  // Handle edit action
  const handleEdit = (record) => {
    // Navigate to edit invoice page when implemented
    navigate(`/edit-invoice/${record._id}`);
  };

  // Handle delete action
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Partial Invoice',
      content: `Are you sure you want to delete invoice "${record.invoiceNumber}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteInvoice(record._id).unwrap();
          message.success('Partial invoice deleted successfully!');
        } catch (error) {
          message.error('Failed to delete partial invoice');
        }
      },
    });
  };

  // Get table columns with action handlers
  const allColumns = getPartialInvoicesColumns(handleEdit, handleDelete, handleView);
  const columns = allColumns.filter(col => visibleColumns[col.key]);

  return (
    <div className="all-partial-invoices-page">
      <PageBreadcrumb
        items={[
          { href: Home, title: <HomeOutlined /> },
          { title: 'Partial Invoices' },
        ]}
      />

      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search partial invoices..."
          />
          <DateRangeSelector onChange={handleDateRangeChange} />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="status-filter"
            style={{ height: 41, width: 140 }}
          >
            <Option value="all">All Status</Option>
            <Option value="partial">Partial</Option>
            <Option value="pending">Pending</Option>
            <Option value="overdue">Overdue</Option>
          </Select>
        </div>
        <div className="flex" style={{gap:"10px"}}>
       
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="partial-invoices-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          rowKey={(record) => record._id || record.invoiceNumber}
          scroll={{ x: 2000 }}
        />
      </div>

      {error && (
        <div className="error-state">
          <p>Error loading partial invoices: {error.message || 'Something went wrong'}</p>
        </div>
      )}
    </div>
  );
};

export default PartialInvoice;