import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input, Dropdown, Image, Tag, Select } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, CheckOutlined, EyeInvisibleOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { AddGeneralStaffRoute, GeneralStaffDetailAttendanceRoute, Home } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import { getGeneralStaffColumns } from "./columns";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddButton from "../../components/addButton";
// ...existing code...
import "./styles.scss";
import { useGetGeneralStaffQuery } from "../../services/generalStaff";
import GeneralStaffAttendance from "../../components/generalStaffDetail/attendance";
import CommonTable from "../../components/commonTable";

const AllGeneralStaff = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    role: true,
    phoneNumber: true,
    branchName: true,
    profile: true,
    status: true,
    view: true,
    actions: true,
  });
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const { data: staffData, isLoading } = useGetGeneralStaffQuery({ employeeType: 'general-staff', page, limit });

  // Handler functions must be defined before being used
  const handleView = (record) => {
    if (record._id || record.id) {
      navigate(`/general-staff-detail/${record._id || record.id}/${GeneralStaffDetailAttendanceRoute}`);
    }
  };

  const handleVerify = (record) => {
    console.log('Verify staff:', record);
    // TODO: Call verify API
  };

  const handleEdit = (record) => {
    console.log('Edit staff:', record);
    // TODO: Navigate to edit page or open edit modal
  };

  const handleDelete = (record) => {
    console.log('Delete staff:', record);
    // TODO: Show confirmation modal and call delete API
  };

  const handleChangePassword = (record) => {
    setSelectedUser(record);
    setIsPasswordModalVisible(true);
  };

  // Get columns with handlers
  const columns = getGeneralStaffColumns(handleView, handleVerify, handleEdit, handleDelete, handleChangePassword).filter(col => visibleColumns[col.key]);

  // For ColumnVisibility, get all columns (without filtering)
  const allColumns = getGeneralStaffColumns(handleView, handleVerify, handleEdit, handleDelete, handleChangePassword);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Map API data to table columns
  const mappedData = staffData?.data?.map(item => {
    let branchName = '-';
    if (Array.isArray(item.user?.branchIds) && item.user.branchIds.length > 0) {
      branchName = item.user.branchIds.map(b => b.name).join(', ');
    }
    return {
      ...item,
      name: item.user?.name || '-',
      phoneNumber: item.user?.phone || item.user?.phoneNumber || '-',
      role: item.roleId?.name || '-',
      branchName,
      status: item.status || (item.user?.status === 'active' ? 'ACTIVE' : 'INACTIVE'),
      staffId: item.staffId || '-',
      address: item.address || '-',
      idType: item.idType || '-',
      idNumber: item.idNumber || '-',
      idFront: item.idFront || '',
      idBack: item.idBack || '',
      photo: item.photo || '',
      joiningDate: item.joiningDate || '',
      // Add more mappings if needed
    };
  }) || [];

  // Filter data based on search and tab
  const filteredData = mappedData.filter(item => {
    const matchesSearch = searchText === "" || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phoneNumber?.includes(searchText);
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && item.status === "ACTIVE") ||
      (activeTab === "inactive" && item.status !== "ACTIVE");
    
    return matchesSearch && matchesTab;
  });

  // Calculate counts for each tab
  const allCount = mappedData.length;
  const activeCount = mappedData.filter(item => item.status === "ACTIVE").length;
  const inactiveCount = mappedData.filter(item => item.status !== "ACTIVE").length;

  const tabsData = [
    { key: 'all', label: 'All', count: allCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
  ];

  return (
    <div className="all-general-staff-page">
     

      {/* Header with Search, Tabs, and Add Button */}
      <div className="header-section">
        <div className="left-col">

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search general staff..."
          />

        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
          />
          </div>
<div className="flex" style={{gap:"10px"}}>

        <AddButton to={AddGeneralStaffRoute}>
          Add General Staff
        </AddButton>

        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          />
          </div>
      </div>

      {/* Table */}
      <div className="staff-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1200 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={staffData?.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser?.user}
        userName={selectedUser?.name}
      />
    </div>
  );
};

export default AllGeneralStaff;
