import React, { useMemo, useState } from 'react';
import './styles.scss';
import SearchBar from '../../searchBar';
import { PlusOutlined } from '@ant-design/icons';
import ColumnVisibility from '../../columnVisibility';
import CommonTable from '../../commonTable';
import { getBiometricAccessColumns } from './columns';
import { Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeDetailAddBiometricAccessRoute } from '../../../routes/routepath';

const BiometricAccessSection = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchText, setSearchText] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    machineId: true,
    inOut: true,
    branchName: true,
    branchFloor: true,
  });

  // 🔹 demo biometric access data
  const biometricData = [
    {
      machineId: 'HFDU08-01',
      inOut: 'In',
      branchName: 'Gurgaon',
      branchFloor: 'Ground Floor',
    },
    {
      machineId: 'HFDU08-01',
      inOut: 'Out',
      branchName: 'Gurgaon',
      branchFloor: 'Ground Floor',
    },
  ];

  const allColumns = getBiometricAccessColumns();

  const columns = useMemo(() => {
    return allColumns.filter(col => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  const filteredData = useMemo(() => {
    if (!searchText) return biometricData;
    return biometricData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, biometricData]);

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className='biometric-access-section'>
  

      {/* 🔹 TABLE CONTROLS */}
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search biometric access"
        />
        <div className="biometric-access-btn-col">

        <Button
          className="biometric-access-btn"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/employee-detail/${id}${EmployeeDetailAddBiometricAccessRoute}`)}
        >
          Biometric access
        </Button>
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
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
    </div>
  );
};

export default BiometricAccessSection;
