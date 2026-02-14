import React, { useState, useMemo } from 'react';
import { HomeOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Modal, message, Select } from 'antd';

const { Option } = Select;
import PageBreadcrumb from '../../components/breadcrumb';
import AddButton from '../../components/addButton';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import DateRangeSelector from '../../components/dateRange/DateRangeSelector';
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from '../../services/invoice';
import { getInvoicesColumns } from './columns';
import { Home, AddInvoiceRoute } from '../../routes/routepath';
import './styles.scss';

const AllInvoice = () => {
  const navigate = useNavigate();
  const { data: invoicesData, isLoading, error } = useGetInvoicesQuery();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceNumber: true,
    invoiceDate: true,
    paymentDate: true,
    branchName: true,
    customerName: true,
    customerMobile: true,
    serviceType: true,
    trainerName: true,
    salesPersonName: true,
    status: true,
    packageName: true,
    startDate: true,
    expiryDate: true,
    gstNumber: true,
    packagePrice: true,
    itemsPrice: true,
    discount: true,
    taxableAmount: true,
    cgst: true,
    sgst: true,
    totalAmount: true,
    dueAmount: true,
    paymentMode: true,
    view: true,
    actions: true,
  });

  const invoices = invoicesData?.data || [];

  // Search, status and date filter
  const filteredData = useMemo(() => {
    let result = invoices;

    // Apply status filter
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
        if (!item.issueDate) return false;
        const invoiceDate = new Date(item.issueDate);
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
    console.log('View invoice:', record);
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
      title: 'Delete Invoice',
      content: `Are you sure you want to delete invoice "${record.invoiceNumber}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteInvoice(record._id).unwrap();
          message.success('Invoice deleted successfully!');
        } catch (error) {
          message.error('Failed to delete invoice');
        }
      },
    });
  };

  // Get table columns with action handlers
  const allColumns = getInvoicesColumns(handleEdit, handleDelete, handleView);
  const columns = allColumns.filter(col => visibleColumns[col.key]);

  return (
    <div className="all-invoices-page">
      <PageBreadcrumb
        items={[
          { href: Home, title: <HomeOutlined /> },
          { title: 'All Invoices' },
        ]}
      />

      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search invoices..."
          />
          <DateRangeSelector onChange={handleDateRangeChange} />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="status-filter"
            style={{ height: 41, width: 140 }}
          >
            <Option value="all">All Status</Option>
            <Option value="paid">Paid</Option>
            <Option value="pending">Pending</Option>
            <Option value="overdue">Overdue</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
        <div className="flex" style={{gap:"10px"}}>
          <AddButton to={AddInvoiceRoute}>
            Add Invoice
          </AddButton>
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="invoices-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          rowKey={(record) => record._id || record.invoiceNumber}
          scroll={{ x: 3500 }}
        />
      </div>

      {error && (
        <div className="error-state">
          <p>Error loading invoices: {error.message || 'Something went wrong'}</p>
        </div>
      )}
    </div>
  );
};

export default AllInvoice;