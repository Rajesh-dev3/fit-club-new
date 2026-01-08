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
    name: "John Doe",
    mobile: "9876543210",
    dateTime: "2025-12-18 10:30",
    biometricId: "BIO123",
    recordPurpose: "Entry",
    branchName: "Main Branch",
    branchFloor: "1st Floor",
  },
];

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name", width: 150 },
  { title: "Mobile No.", dataIndex: "mobile", key: "mobile", width: 130 },
  { title: "Date & Time", dataIndex: "dateTime", key: "dateTime", width: 160 },
  { title: "Biometric Id", dataIndex: "biometricId", key: "biometricId", width: 120 },
  { title: "Record Purpose", dataIndex: "recordPurpose", key: "recordPurpose", width: 140 },
  { title: "Branch Name", dataIndex: "branchName", key: "branchName", width: 150 },
  { title: "Branch Floor", dataIndex: "branchFloor", key: "branchFloor", width: 120 },
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

const DirectorAttendance = () => {
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const obj = {};
    allColumns.forEach(col => obj[col.key] = true);
    return obj;
  });

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const filteredData = useMemo(() => {
    let data = dummyData;
    if (searchText) {
      data = data.filter(row =>
        row.name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.mobile.toLowerCase().includes(searchText.toLowerCase()) ||
        row.biometricId.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return data;
  }, [searchText]);

  const columns = allColumns.filter(col => visibleColumns[col.key]);



  return (
    <div className="director-attendance-page">
      <PageBreadcrumb title="Director Attendance" />
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search director attendance..."
        />
        <DateRangeSelector />
        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <div className="attendance-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          rowKey={record => record.id}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
};

export default DirectorAttendance;
