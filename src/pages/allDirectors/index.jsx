import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Home } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import { getColumns } from './columns';
import { useGetDirectorsQuery } from "../../services/director";
import "./styles.scss";

const AllDirectors = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [branchTypeFilter, setBranchTypeFilter] = useState("all");
  
  // Initialize all columns as visible
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    phoneNumber: true,
    branchName: true,
    ownedBy: true,
    status: true,
    view: true,
    actions: true,
  });

  // Fetch directors data
const { data: directorsData, isLoading } = useGetDirectorsQuery({ page, limit });
  // Map API data to table row structure
  const directors = useMemo(() => {
    const arr = directorsData?.data || directorsData?.directors || [];
    return arr.map((item) => ({
      ...item,
      phoneNumber: item.number,
      // columns.jsx expects 'branches' as array, so wrap branch in array if present
      branches: item.branch ? [item.branch] : [],
      branchName: item.branch?.name || '-',
      ownedBy: item.role?.name || '-',
      status: item.userId?.status || 'inactive',
    }));
  }, [directorsData]);

  // Handlers for column actions
  const handleView = (record) => {
    console.log('View director:', record);
    // TODO: Navigate to director detail page or open modal
    // navigate(`/director-detail/${record._id || record.id}`);
  };

  const handleEdit = (record) => {
    console.log('Edit director:', record);
    // TODO: Navigate to edit page or open edit modal
    // navigate(`/edit-director/${record._id || record.id}`);
  };

  const handleChangePassword = (record) => {
    console.log('Change password for:', record);
    // TODO: Implement change password logic/modal
  };

  const handleDelete = (record) => {
    console.log('Delete director:', record);
    // TODO: Show confirmation modal and call delete API
  };

  // Get all columns with handlers
  const allColumns = getColumns(handleView, handleEdit, handleDelete, handleChangePassword);
  
  // Filter visible columns based on user selection
  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleAddDirector = () => {
    navigate('/add-director');
  };

  // Filter data based on search and tab
  const filteredData = useMemo(() => {
    return directors.filter(item => {
      const matchesSearch = searchText === "" || 
        (item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
         item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
         item.phoneNumber?.includes(searchText));
      
      const matchesTab = activeTab === "all" || 
        (activeTab === "active" && item.status === "active") ||
        (activeTab === "inactive" && item.status !== "active");
      
      return matchesSearch && matchesTab;
    });
  }, [directors, searchText, activeTab]);

  // Calculate counts for each tab
  const allCount = directors.length || 0;
  const activeCount = directors.filter(item => item.status === "active").length || 0;
  const inactiveCount = directors.filter(item => item.status !== "active").length || 0;

  const tabsData = [
    { key: 'all', label: 'All', count: allCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
  ];

  // Pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

  return (
    <div className="all-directors-page">
      {/* Header with Search, Tabs, and Add Button */}
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search directors..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabsData}
          />
        </div>
        <div className="flex" style={{gap:"10px"}}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            className="add-btn"
            onClick={handleAddDirector}
          >
            Add Director
          </Button>
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      {/* Table */}
      <div className="directors-table-wrapper">
        <Table
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1000 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData?.length || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AllDirectors;