import React, { useMemo, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { GeneralStaffDetailAddBiometricAccessRoute } from '../../../routes/routepath';
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import directorDetailBiometricAccessColumns from "./columns";
import "./styles.scss";

const DirectorDetailBiometricAccess = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 MUST match columns.js keys
  const [visibleColumns, setVisibleColumns] = useState({
    machineId: true,
    inOut: true,
    branchName: true,
    branchFloor: true,
  });

  // 🔹 Demo data (API ready)
  const biometricData = [
    {
      machineId: "GS-01",
      inOut: "In",
      branchName: "FitClub GC",
      branchFloor: "Ground Floor",
    },
    {
      machineId: "GS-01",
      inOut: "Out",
      branchName: "FitClub GC",
      branchFloor: "Ground Floor",
    },
  ];

  const allColumns = directorDetailBiometricAccessColumns;

  // 🔹 Column visibility logic
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return biometricData;
    return biometricData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, biometricData]);

  // 🔹 Toggle column
  const handleColumnToggle = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="director-biometric-access-section">
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search biometric access"
        />
        <div className="biometric-access-btn-col">
          {/* <Button
            className="biometric-access-btn"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/general-staff-detail/${id}${GeneralStaffDetailAddBiometricAccessRoute}`)}
          >
            Biometric access
          </Button> */}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
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

export default DirectorDetailBiometricAccess;
