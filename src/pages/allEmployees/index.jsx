import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Dropdown, Image, Tag, Select } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, CheckOutlined, EyeInvisibleOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { AddEmployeeRoute, EmployeeDetailAttendanceRoute, Home } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import PageBreadcrumb from "../../components/breadcrumb";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddButton from "../../components/addButton";
import CommonTable from '../../components/commonTable';
import "./styles.scss";
import { useGetEmployeeQuery } from "../../services/employee";
import { getEmployeeColumns } from './columns';

const AllEmployees = () => {
  const {data} = useGetEmployeeQuery()

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    designation: true,
    phoneNumber: true,
    branchName: true,
    profile: true,
    status: true,
    view: true,
    actions: true,
  });
  
  // Use the provided API response structure
  const employeesData = data;
  const isLoading = false;

  const handleView = (record) => {
    navigate(`/employee-detail/${record.id}/${EmployeeDetailAttendanceRoute}`);
  };

  const handleEdit = (record) => {
    // Navigate to edit page or open modal
    console.log('Edit', record);
  };

  const handleDelete = (record) => {
    // Delete logic
    console.log('Delete', record);
  };
  const handleChangePassword = (record) => {
    console.log('Change password for employee:', record);
    setSelectedEmployee(record);
    setShowPasswordModal(true);
  };
  const allColumns = getEmployeeColumns(handleView, handleEdit, handleDelete, handleChangePassword);
   
 

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };



  const handleVerify = (record) => {
    console.log('Verify employee:', record);
    // TODO: Call verify API
  };

  const handleNotShow = (record) => {
    console.log('Not show employee:', record);
    // TODO: Call hide/show API
  };



  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedEmployee(null);
  };



  // Get unique designations from data
  const uniqueDesignations = useMemo(() => {
    if (!employeesData?.employees) return [];
    const designations = employeesData.employees
      .map(emp => emp.designation)
      .filter(Boolean);
    return [...new Set(designations)];
  }, [employeesData]);

  // Map API response to table rows
  const mappedEmployees = useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.map(emp => ({
      "_id": emp.user?._id,
      name: emp.user?.name || '-',
      email: emp.user?.email || '-',
      designation: emp.designation || (emp.user?.roleId?.name || '-'),
      phoneNumber: emp.user?.phoneNumber || '-',
      branches: emp.user?.branchIds || [],
      profile: emp.photo,
      status: emp.user?.status?.toLowerCase() || emp.status?.toLowerCase() || '-',
      view: '',
      actions: '',
    }));
  }, [employeesData]);

  // Filter data based on search, tab and designation
  const filteredData = mappedEmployees.filter(item => {
    const matchesSearch = searchText === "" || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phoneNumber?.includes(searchText);
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && item.status === "active") ||
      (activeTab === "inactive" && item.status !== "active");
    
    const matchesDesignation = designationFilter === "all" || item.designation === designationFilter;
    
    return matchesSearch && matchesTab && matchesDesignation;
  });

  // Calculate counts for each tab
  const allCount = mappedEmployees.length;
  const activeCount = mappedEmployees.filter(item => item.status === "active").length;
  const inactiveCount = mappedEmployees.filter(item => item.status !== "active").length;

  const tabsData = [
    { key: 'all', label: 'All', count: allCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
  ];

  return (
    <div className="all-employees-page">
     

      {/* Header with Search, Tabs, and Add Button */}
      <div className="header-section">
        <div className="left-col">

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search employees..."
          />

        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
          />
        <Select
          value={designationFilter}
          onChange={setDesignationFilter}
          className="designation-filter"
          style={{ height:41 }}
          >
          <Select.Option value="all">All Designations</Select.Option>
          {uniqueDesignations.map(designation => (
            <Select.Option key={designation} value={designation}>
              {designation}
            </Select.Option>
          ))}
        </Select>
          </div>
<div className="flex" style={{gap:"10px"}}>


        <AddButton to={AddEmployeeRoute}>
          Add Employee
        </AddButton>

        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          />
          </div>
      </div>

      {/* Table */}
      <div className="employees-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1200 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={employeesData?.total || mappedEmployees.length}
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
        selectedUser={selectedEmployee}
        userType="employee"
      />
    </div>
  );
};

export default AllEmployees;
