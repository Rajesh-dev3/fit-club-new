
import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import userAttendanceColumns from "./columns";
import "./styles.scss";

const UserAttendance = () => {
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    mobile: true,
    dateTime: true,
    biometricId: true,
    purpose: true,
    branch: true,
    floor: true,
  });

  // Demo data (API ready)
  const attendanceData = [
    {
      name: "Bhumika",
      mobile: "+91 9560385845",
      dateTime: "2026-01-05 09:00 AM",
      biometricId: "2402",
      purpose: "In",
      branch: "FitClub Main",
      floor: "First Floor",
    },
    {
      name: "Bhumika",
      mobile: "+91 9560385845",
      dateTime: "2026-01-05 06:00 PM",
      biometricId: "2402",
      purpose: "Out",
      branch: "FitClub Main",
      floor: "First Floor",
    },
  ];

  const allColumns = userAttendanceColumns;

  // Column visibility filter
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return attendanceData;
    return attendanceData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, attendanceData]);

  // Toggle columns
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="attendance-container">
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search attendance"
        />
        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>
      <CommonTable
        columns={columns}
        dataSource={filteredData}
        rowKey={(record, index) => index}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default UserAttendance;
