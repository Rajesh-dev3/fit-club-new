import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import CommonTable from '../../commonTable';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import columns from './columns';
import { Button } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { UserDetailRoute } from '../../../routes/routepath';

const initialData = [
  {
    key: '1',
    machine: 'Main Gate',
    accessDate: '2026-01-01',
    accessTime: '09:00',
    status: 'Granted',
  },
  // ...more rows
];


const UserBiometricAccess = () => {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const obj = {};
    columns.forEach(col => { obj[col.key] = true; });
    return obj;
  });

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = initialData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const shownColumns = columns.filter(col => visibleColumns[col.key]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search biometric access..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to={`/user-detail/${id}/add-biometric-access`}>
            <Button
              className="biometric-access-btn"
              icon={<PlusOutlined />}
            >
              Biometric access
            </Button>
          </Link>
          <ColumnVisibility columns={columns} visibleColumns={visibleColumns} onColumnToggle={handleColumnToggle} />
        </div>
      </div>
      <CommonTable columns={shownColumns} dataSource={filteredData} />
    </div>
  );
};

export default UserBiometricAccess;
