import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { AddTrainerRoute, TrainerDetailAttendanceRoute } from "../../routes/routepath";
// import { useGetTrainersQuery } from "../../services/trainer";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
// ...existing code...
import "./styles.scss";
import { useGetTrainersQuery } from "../../services/trainer";
import { getTrainerColumns } from "./columns";
import CommonTable from "../../components/commonTable";

const AllTrainers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    branchName: true,
    name: true,
    phoneNumber: true,
    email: true,
    expertise: true,
    yearsOfExperience: true,
    profile: true,
    status: true,
    view: true,
    actions: true,
  });
  
  const { data: trainersData, isLoading } = useGetTrainersQuery({ page, limit });

  // Handler functions must be defined before being used in getTrainerColumns
  const handleView = (record) => {
    navigate(`/trainer-detail/${record._id}/${TrainerDetailAttendanceRoute}`);
  };

  const handleVerify = (record) => {
    console.log('Verify trainer:', record);
    // TODO: Call verify API
  };

  const handleEdit = (record) => {
    console.log('Edit trainer:', record);
    // TODO: Navigate to edit page or open edit modal
  };

  const handleDelete = (record) => {
    console.log('Delete trainer:', record);
    // TODO: Show confirmation modal and call delete API
  };

  // Use columns from columns.jsx
  const columns = getTrainerColumns(handleView, handleVerify, handleEdit, handleDelete).filter(col => visibleColumns[col.key]);
  const allColumns = getTrainerColumns(handleView, handleVerify, handleEdit, handleDelete);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

 

  const handleNotShow = (record) => {
    console.log('Not show trainer:', record);
    // TODO: Call hide/show API
  };

  const handleChangePassword = (record) => {
    console.log('Change password for trainer:', record);
    // TODO: Open change password modal
  };

 

  // Map API data to table columns
  const mappedData = trainersData?.data?.map(item => {
    let branchName = '-';
    if (Array.isArray(item.user?.branchIds) && item.user.branchIds.length > 0) {
      branchName = item.user.branchIds.map(b => b.name).join(', ');
    }
    return {
      ...item,
      name: item.user?.name || '-',
      phoneNumber: item.user?.phone || item.user?.phoneNumber || '-',
      email: item.user?.email || '-',
      branchName,
      status: item.user?.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      // Add more mappings if needed
    };
  }) || [];

  // Filter data based on search and tab
  const filteredData = mappedData.filter(item => {
    const matchesSearch = searchText === "" || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
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
    <div className="all-trainers-page">
      

      {/* Header with Search, Tabs, and Add Button */}
      <div className="header-section">
        <div className="left-col">

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search trainers..."
        />

        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
        />
        </div>
<div className="flex" style={{gap:"10px"}}>

        <AddButton to={AddTrainerRoute}>
          Add Trainer
        </AddButton>

        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          />
          </div>
      </div>

      {/* Table */}
      <div className="trainers-table-wrapper">
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
        total={trainersData?.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AllTrainers;
