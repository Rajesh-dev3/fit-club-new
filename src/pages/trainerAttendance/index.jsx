import React, { useState, useMemo } from "react";
import { Table, Button, Dropdown } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import PageBreadcrumb from "../../components/breadcrumb";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";

import "./styles.scss";
import CommonTable from "../../components/commonTable";

const dummyData = [
  {
    id: 1,
    name: "Chris Thompson",
    mobile: "9876543210",
    trainerId: "TRN001",
    dateTime: "2025-12-18 07:00",
    biometricId: "BIO987",
    recordPurpose: "Entry",
    branchName: "Main Branch",
    branchFloor: "3rd Floor",
    specialization: "Personal Training",
  },
  {
    id: 2,
    name: "Emma Rodriguez",
    mobile: "8765432109",
    trainerId: "TRN002",
    dateTime: "2025-12-18 20:30",
    biometricId: "BIO654",
    recordPurpose: "Exit",
    branchName: "Second Branch",
    branchFloor: "2nd Floor",
    specialization: "Group Classes",
  },
];

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name", width: 150 },
  { title: "Trainer ID", dataIndex: "trainerId", key: "trainerId", width: 120 },
  { title: "Mobile No.", dataIndex: "mobile", key: "mobile", width: 130 },
  { title: "Date & Time", dataIndex: "dateTime", key: "dateTime", width: 160 },
  { title: "Biometric Id", dataIndex: "biometricId", key: "biometricId", width: 120 },
  { title: "Record Purpose", dataIndex: "recordPurpose", key: "recordPurpose", width: 140 },
  { title: "Branch Name", dataIndex: "branchName", key: "branchName", width: 150 },
  { title: "Branch Floor", dataIndex: "branchFloor", key: "branchFloor", width: 120 },
  { title: "Specialization", dataIndex: "specialization", key: "specialization", width: 150 },
  {
    title: "Actions",
    key: "actions",
    width: 100,
    align: "center",
    render: (_, record) => {
      const menuItems = [
        { key: "edit", label: "Edit", icon: <EditOutlined />, onClick: () => {} },
        { key: "delete", label: "Delete", icon: <DeleteOutlined />, danger: true, onClick: () => {} },
      ];
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  },
];

const TrainerAttendance = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  
  // Initialize all columns as visible
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    trainerId: true,
    mobile: true,
    dateTime: true,
    biometricId: true,
    recordPurpose: true,
    branchName: true,
    branchFloor: true,
    specialization: true,
    actions: true,
  });

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Filter visible columns
  const columns = allColumns.filter(col => visibleColumns[col.key]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    return dummyData.filter(item => 
      searchText === "" || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.mobile?.includes(searchText) ||
      item.trainerId?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.biometricId?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/' },
    { title: 'Attendance Management' },
    { title: 'Trainer Attendance' }
  ];

  return (
    <div className="trainer-attendance-page">
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="page-header">
        <h2>Trainer Attendance</h2>
      </div>

      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search trainers..."
          />
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            placeholder={['Start Date', 'End Date']}
          />
        </div>
        <div className="right-col">
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="attendance-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowKey="id"
          scroll={{ x: 1350 }}
        />
      </div>
    </div>
  );
};

export default TrainerAttendance;