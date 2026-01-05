
import { useMemo, useState } from "react";
import {getAttendanceColumns} from "./columns"
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import "./styles.scss"
const EmployeeDetailAttendance = () => {
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

  const attendanceData = [
  {
    name: 'Shashank kumar',
    mobile: '7903602717',
    dateTime: '2024-06-01 09:00 AM',
    biometricId: '1054',
    purpose: 'In',
    branch: 'Gurgaon',
    floor: '1st Floor',
  },
  {
    name: 'Shashank kumar',
    mobile: '7903602717',
    dateTime: '2024-06-01 12:30 PM',
    biometricId: '1054',
    purpose: 'Out',
    branch: 'Gurgaon',
    floor: '1st Floor',
  },
  {
    name: 'Shashank kumar',
    mobile: '7903602717',
    
    dateTime: '2024-06-01 06:00 PM',
    biometricId: '1054',
    purpose: 'Out',
    branch: 'Gurgaon',
    floor: '1st Floor',
  },
  ];

  const allColumns = getAttendanceColumns();

  const columns = useMemo(() => {
    if (!allColumns || !Array.isArray(allColumns)) return [];
    return allColumns.filter(col => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  const filteredData = useMemo(() => {
    if (!searchText) return attendanceData;
    return attendanceData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, attendanceData]);
   const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };
  return (
    <div className="attendance-container">
      <div className="table-controls">

            <SearchBar   value={searchText}
          onChange={setSearchText} placeholder='Search attendance'/>
            <ColumnVisibility 
               columns={allColumns}
               visibleColumns={visibleColumns}
               onColumnToggle={handleColumnToggle}
               />
            </div>
          <CommonTable
            columns={columns || []}
            dataSource={filteredData || []}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
          
    </div>
  );
};

export default EmployeeDetailAttendance;