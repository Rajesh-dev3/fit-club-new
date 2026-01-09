import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import "./styles.scss";
import directorDetailAttendanceColumns from "./columns";

const DirectorDetailAttendance = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 EXACT column keys (MUST MATCH columns.js)
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    mobile: true,
    dateTime: true,
    biometricId: true,
    purpose: true,
    branch: true,
    floor: true,
  });

  // 🔹 Demo data (API ready)
  const attendanceData = [
    {
      name: "Karan",
      mobile: "9898989898",
      dateTime: "2025-12-23 09:00 AM",
      biometricId: "456789876545678",
      purpose: "In",
      branch: "FitClub GC",
      floor: "Ground Floor",
    },
    {
      name: "Karan",
      mobile: "9898989898",
      dateTime: "2025-12-23 06:00 PM",
      biometricId: "456789876545678",
      purpose: "Out",
      branch: "FitClub GC",
      floor: "Ground Floor",
    },
  ];

  const allColumns = directorDetailAttendanceColumns;

  // 🔹 Column visibility filter
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return attendanceData;
    return attendanceData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, attendanceData]);

  // 🔹 Toggle columns
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

export default DirectorDetailAttendance;
