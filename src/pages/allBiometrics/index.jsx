import React, { useState, useMemo } from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import PageBreadcrumb from '../../components/breadcrumb';
import AddButton from '../../components/addButton';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import { EditBiometricModal } from '../../components/modals';
import { useGetBiometricsQuery, useDeleteBiometricMutation } from '../../services/biometric';
import { getBiometricsColumns } from './columns';
import { Home, AddBiometricRoute } from '../../routes/routepath';
import './styles.scss';

const AllBiometrics = () => {
  const navigate = useNavigate();
  const { data: biometricsData, isLoading, error } = useGetBiometricsQuery();
  const [deleteBiometric] = useDeleteBiometricMutation();
  const [searchText, setSearchText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    machineId: true,
    branchName: true,
    branchAddress: true,
    floor: true,
    recordPurpose: true,
    actions: true,
  });

  const machines = biometricsData?.data || [];

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return machines;
    return machines.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      ) ||
      // Also search in nested branch data
      (item.branchId?.name && String(item.branchId.name).toLowerCase().includes(searchText.toLowerCase())) ||
      (item.branchId?.address && String(item.branchId.address).toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, machines]);

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Handle edit action
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedRecord(null);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    // Refetch data is handled by RTK Query invalidatesTags
  };

  // Handle delete action
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Biometric Machine',
      content: `Are you sure you want to delete machine "${record.machineId}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBiometric(record._id).unwrap();
          message.success('Biometric machine deleted successfully!');
        } catch (error) {
          message.error('Failed to delete biometric machine');
        }
      },
    });
  };

  // Get table columns with action handlers
  const allColumns = getBiometricsColumns(handleEdit, handleDelete);
  const columns = allColumns.filter(col => visibleColumns[col.key]);

  return (
    <div className="all-biometrics-page">
    

      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search biometric machines..."
          />
        </div>
        <div className="flex" style={{gap:"10px"}}>
          <AddButton to={AddBiometricRoute}>
            Add Biometric Machine
          </AddButton>
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="biometrics-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData || []}
          loading={isLoading}
          rowKey={(record) => record._id || record.machineId}
          scroll={{ x: 1000 }}
        />
      </div>

      {error && (
        <div className="error-state">
          <p>Error loading biometric machines: {error.message || 'Something went wrong'}</p>
        </div>
      )}

      <EditBiometricModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        recordData={selectedRecord}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default AllBiometrics;