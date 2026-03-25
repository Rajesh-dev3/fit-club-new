import React, { useState, useMemo } from "react";
import { Table, Button, Dropdown, Tag, Select, Image } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined } from "@ant-design/icons";
import { Home } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import { getAddOnsUserColumns } from "../allAddOnsUsers/columns";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";
import "./styles.scss";
import CommonTable from "../../components/commonTable";


// Helper to map API user/member data to table row
const mapUserToRow = (user) => {
  const member = user.member || {};
  return {
    _id: user._id,
    name: user.name,
    branch: user?.branchIds?.length > 0 ? user.branchIds[0]?.name : '-',
    phoneNumber: user.phoneNumber,
    assessmentRatio: '-',
    salesPerson: '-',
    planName: member.membershipType || '-',
    planPrice: '-',
    profile: member.photo,
    gender: member.gender || '-',
    status: user.status,
    invoiceStatus: '-',
    remainingDays: member.expiryDate && member.joiningDate ? Math.max(0, Math.ceil((new Date(member.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))) : '-',
    membershipForm: '-',
    startDate: member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : '-',
    endDate: member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : '-',
    gymKit: '-',
  };
};

const AddOnLiveDashboard = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [remainingDays, setRemainingDays] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const typeOptions = [
    { label: "All Categories", value: "all" },
    { label: "Personal Training", value: "Personal Training" },
    { label: "Pilates", value: "Pilates" },
    { label: "Therapy", value: "Therapy" },
    { label: "EMS", value: "EMS" },
    { label: "Paid Locker", value: "Paid Locker" },
    { label: "MMA", value: "MMA" },
  ];
  const [visibleColumns, setVisibleColumns] = useState({
    sno: true,
    timer: true,
    branch: true,
    name: true,
    phoneNumber: true,
    profile: true,
    gender: true,
    category: true,
    trainer: true,
    paymentType: true,
    actions: true,
  });

  // Handlers for user actions
  const handleEdit = (record) => {
    console.log('Edit user:', record);
    // TODO: Navigate to edit user page or open modal
  };

  const handleDelete = (record) => {
    console.log('Delete user:', record);
    // TODO: Show confirmation modal and call delete API
  };

  const navigate = useNavigate();

  const handleChangePassword = (record) => {
    console.log('Change password for user:', record);
    setSelectedUser(record);
    setShowPasswordModal(true);
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  // Get columns with handlers
  const columnsWithHandlers = getAddOnsUserColumns(handleEdit, handleDelete, handleChangePassword, navigate);
  
  // Demo data for testing
  const data = {
    users: [
      {
        _id: '1',
        name: 'Rajesh Kumar',
        branchIds: [{ name: 'Vikas Puri Delhi' }],
        phoneNumber: '9876543210',
        status: 'active',
        category: 'Personal Training',
        trainer: { name: 'John Trainer' },
        salesPerson: { name: 'Amit Sales' },
        member: {
          photo: null,
          gender: 'male',
        },
        currentMembership: {
          planName: 'Personal Training - Premium',
          startDate: '2026-03-01',
          expiryDate: '2026-04-01',
          invoiceStatus: 'complete',
          packagePrice: 15000,
          invoiceAmount: 15000,
          sessions: 12,
          usedSessions: 9,
          remainingSessions: 3,
          paymentType: 'complete',
        }
      },
      {
        _id: '2',
        name: 'Priya Sharma',
        branchIds: [{ name: 'Golf Course Road' }],
        phoneNumber: '9876543211',
        status: 'active',
        category: 'Pilates',
        trainer: { name: 'Sarah Coach' },
        salesPerson: { name: 'Pankaj Sales' },
        member: {
          photo: null,
          gender: 'female',
        },
        currentMembership: {
          planName: 'Pilates Basic',
          startDate: '2026-03-10',
          expiryDate: '2026-04-10',
          invoiceStatus: 'complete',
          packagePrice: 8000,
          invoiceAmount: 8000,
          sessions: 8,
          usedSessions: 5,
          remainingSessions: 3,
          paymentType: 'partial',
        }
      },
      {
        _id: '3',
        name: 'Vikram Singh',
        branchIds: [{ name: 'Vikas Puri Delhi' }],
        phoneNumber: '9876543212',
        status: 'inactive',
        category: 'EMS',
        trainer: null,
        salesPerson: { name: 'Amit Sales' },
        member: {
          photo: null,
          gender: 'male',
        },
        currentMembership: {
          planName: 'EMS Advanced',
          startDate: '2026-02-15',
          expiryDate: '2026-03-15',
          invoiceStatus: 'complete',
          packagePrice: 12000,
          invoiceAmount: 12000,
          sessions: 10,
          usedSessions: 7,
          remainingSessions: 3,
          paymentType: 'complete',
        }
      },
    ],
    statusCounts: {
      all: 3,
      active: 2,
      inactive: 1,
      pending: 0,
      freezed: 0,
      blocked: 0,
      advance: 0,
    },
    total: 3,
  };
  const isLoading = false;

  // Map API data to table rows (updated for add-ons users)
  const usersData = useMemo(() => {
    if (!data?.users) return [];
    return data.users.map((user) => {
      const member = user.member || {};
      const currentMembership = user.currentMembership || {};
      return {
        _id: user?._id,
        name: user.name,
        branch: user.branchIds?.length > 0 ? user.branchIds[0]?.name : '-',
        phoneNumber: user.phoneNumber,
        profile: member.photo,
        gender: member.gender || '-',
        category: user.category || '-',
        planInfo: currentMembership.planName || 'N/A',
        trainer: user.trainer?.name || '-',
        paymentType: currentMembership.paymentType || '-',
        salesPerson: user.salesPerson?.name || '-',
        startDate: currentMembership.startDate ? new Date(currentMembership.startDate).toLocaleDateString() : '-',
        endDate: currentMembership.expiryDate ? new Date(currentMembership.expiryDate).toLocaleDateString() : '-',
        // Additional fields for plan info tooltip
        status: user.status || '-',
        invoiceStatus: currentMembership.invoiceStatus || '-',
        packagePrice: currentMembership.packagePrice || '-',
        invoiceAmount: currentMembership.invoiceAmount || '-',
        sessions: currentMembership.sessions || '-',
        usedSessions: currentMembership.usedSessions || 0,
        remainingSessions: currentMembership.remainingSessions || 0,
      };
    });
  }, [data]);
  // Table columns

  function statusColor(status) {
    switch (status) {
      case 'active': return 'green';
      case 'live': return 'orange';
      case 'completed': return 'red';
      case 'freezed': return 'blue';
      case 'block': return 'volcano';
      default: return 'default';
    }
  }

  function statusTagClass(status) {
    switch (status) {
      case 'pending': return 'ant-tag-orange';
      case 'freezed': return 'ant-tag-blue';
      case 'block': return 'ant-tag-volcano';
      default: return '';
    }
  }

  // Filtered data logic (now uses usersData)
  const filteredData = useMemo(() => {
    let data = usersData;
    if (activeTab !== 'all') data = data.filter(u => u.status === activeTab);
    if (remainingDays !== 'all') data = data.filter(u => u.remainingDays !== '-' && u.remainingDays <= parseInt(remainingDays));
    if (selectedCategory !== 'all') data = data.filter(u => u.category === selectedCategory);
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      data = data.filter(u => {
        if (!u.startDate || u.startDate === '-') return false;
        const userDate = new Date(u.startDate);
        return userDate >= dateRange.startDate && userDate <= dateRange.endDate;
      });
    }
    if (searchText) data = data.filter(u => u.name && u.name.toLowerCase().includes(searchText.toLowerCase()));
    return data;
  }, [usersData, activeTab, remainingDays, selectedCategory, dateRange, searchText]);

  // Tabs data with count from API statusCounts
  const tabsData = [
    { key: 'all', label: 'All', count: data?.statusCounts?.all || 0 },
    { key: 'Live', label: 'Live', count: data?.statusCounts?.active || 0 },
    // { key: 'pending', label: 'Pending', count: data?.statusCounts?.pending || 0 },
    { key: 'Completed', label: 'Completed', count: data?.statusCounts?.inactive || 0 },
    // { key: 'freezed', label: 'Freezed', count: data?.statusCounts?.freezed || 0 },
    // { key: 'blocked', label: 'Block', count: data?.statusCounts?.blocked || 0 },
    // { key: 'advance', label: 'Advance', count: data?.statusCounts?.advance || 0 },
  ];

  const columns = columnsWithHandlers.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  return (
    <div className="all-users-page">
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search add-on users..."
        />
        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
        />
        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="category-filter"
          style={{ width: 200, height: 41 }}
          options={typeOptions}
        />
        <DateRangeSelector onChange={setDateRange} />
        <ColumnVisibility
          columns={columnsWithHandlers}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <div className="users-table-wrapper add-on-live-dashboard">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1600 }}
        />
      </div>
      <CustomPagination
        current={page}
        pageSize={limit}
        total={data?.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        selectedUser={selectedUser}
        userType="user"
      />
    </div>
  );
};

export default AddOnLiveDashboard;
