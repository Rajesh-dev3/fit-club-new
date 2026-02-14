import React, { useState, useMemo } from "react";
import { Table, Button, Dropdown, Tag, Select, Image } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined } from "@ant-design/icons";
import { Home } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import allColumns, { getUserColumns } from "./columns";
// ...existing code...
import "./styles.scss";
import { useGetAllUserQuery } from "../../services/user";
import CommonTable from "../../components/commonTable";


// Helper to map API user/member data to table row
const mapUserToRow = (user) => {
  const member = user.member || {};
  return {
    _id: user._id,
    name: user.name,
    branch: user?.branchIds
?.length > 0 ? user.branchIds
[0]?.name : '-',
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

const AllUsers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [remainingDays, setRemainingDays] = useState("all");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    branch: true,
    phoneNumber: true,
    assessmentRatio: true,
    salesPerson: true,
    planName: true,
    planPrice: true,
    profile: true,
    gender: true,
    status: true,
    invoiceStatus: true,
    remainingDays: true,
    viewProfile: true,
    membershipForm: true,
    startDate: true,
    endDate: true,
    gymKit: true,
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
  const columnsWithHandlers = getUserColumns(handleEdit, handleDelete, handleChangePassword);
  
  // Use the actual API hook for all users
  const { data, isLoading } = useGetAllUserQuery({ page, limit });

  // Map API data to table rows (updated for provided response)
  const usersData = useMemo(() => {
    if (!data?.users) return [];
    return data.users.map((user) => {
      const member = user.member || {};
      return {
        _id: user?._id,
        name: user.name,
        branch: user.branchIds?.length > 0 ? user.branchIds[0]?.name : '-',
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
    });
  }, [data]);
  // Table columns

  function statusColor(status) {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'inactive': return 'red';
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
    if (searchText) data = data.filter(u => u.name && u.name.toLowerCase().includes(searchText.toLowerCase()));
    return data;
  }, [usersData, activeTab, remainingDays, searchText]);

  // Tabs data with count from API statusCounts
  const tabsData = [
    { key: 'all', label: 'All', count: data?.statusCounts?.all || 0 },
    { key: 'active', label: 'Active', count: data?.statusCounts?.active || 0 },
    { key: 'pending', label: 'Pending', count: data?.statusCounts?.pending || 0 },
    { key: 'inactive', label: 'Inactive', count: data?.statusCounts?.inactive || 0 },
    { key: 'freezed', label: 'Freezed', count: data?.statusCounts?.freezed || 0 },
    { key: 'blocked', label: 'Block', count: data?.statusCounts?.blocked || 0 },
    { key: 'advance', label: 'Advance', count: data?.statusCounts?.advance || 0 },
  ];

  const columns = columnsWithHandlers.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  // Pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

  return (
    <div className="all-users-page">
    
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search users..."
        />
        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
        />
        <Select
          value={remainingDays}
          onChange={setRemainingDays}
          className="remaining-days-filter"
          style={{ width: 180, height: 41 }}
        >
          <Select.Option value="all">All Remaining Days</Select.Option>
          <Select.Option value="7">7 Days</Select.Option>
          <Select.Option value="15">15 Days</Select.Option>
          <Select.Option value="30">30 Days</Select.Option>
        </Select>
        <ColumnVisibility
          columns={columnsWithHandlers}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <div className="users-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1600 }}
        />
      </div>
      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData?.length || 0}
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

export default AllUsers;
