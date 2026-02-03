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
    name: "David Brown",
    mobile: "9876543210",
    staffId: "GS001",
    dateTime: "2025-12-18 08:00",
    biometricId: "BIO147",
    recordPurpose: "Entry",
    branchName: "Main Branch",
    branchFloor: "1st Floor",
    role: "Receptionist",
  },
  {
    id: 2,
    name: "Lisa Martinez",
    mobile: "8765432109",
    staffId: "GS002",
    dateTime: "2025-12-18 19:00",
    biometricId: "BIO258",
    recordPurpose: "Exit",
    branchName: "Second Branch",
    branchFloor: "Ground Floor",
    role: "Cleaner",
  },
];

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name", width: 150 },
  { title: "Staff ID", dataIndex: "staffId", key: "staffId", width: 120 },
  { title: "Mobile No.", dataIndex: "mobile", key: "mobile", width: 130 },
  { title: "Date & Time", dataIndex: "dateTime", key: "dateTime", width: 160 },
  { title: "Biometric Id", dataIndex: "biometricId", key: "biometricId", width: 120 },
  { title: "Record Purpose", dataIndex: "recordPurpose", key: "recordPurpose", width: 140 },
  { title: "Branch Name", dataIndex: "branchName", key: "branchName", width: 150 },
  { title: "Branch Floor", dataIndex: "branchFloor", key: "branchFloor", width: 120 },
  { title: "Role", dataIndex: "role", key: "role", width: 120 },
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

const GeneralStaffAttendance = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  
  // Initialize all columns as visible
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    staffId: true,
    mobile: true,
    dateTime: true,
    biometricId: true,
    recordPurpose: true,
    branchName: true,
    branchFloor: true,
    role: true,
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
      item.staffId?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.biometricId?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/' },
    { title: 'Attendance Management' },
    { title: 'General Staff Attendance' }
  ];

  return (
    <div className="general-staff-attendance-page">
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="page-header">
        <h2>General Staff Attendance</h2>
      </div>

      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search general staff..."
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
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
  );
};

export default GeneralStaffAttendance;