import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Dropdown, Image, Tag, Select, Spin } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, MoreOutlined, CheckOutlined, EyeInvisibleOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { Home, AddPackageRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import PageBreadcrumb from "../../components/breadcrumb";
import CommonTable from '../../components/commonTable';
import "./styles.scss";
import { useGetPlansQuery } from "../../services/package";
import { getPackageColumns } from './columns';

const AllPackages = () => {
  const { data, isLoading } = useGetPlansQuery();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    packageType: true,
    branchName: true,
    packageName: true,
    pricing: true,
    numberOfDays: true,
    freezable: true,
    status: true,
    actions: true,
  });
  
  // Handle API response data
  const packagesData = data?.data || [];
  const packages = Array.isArray(packagesData) ? packagesData : packagesData?.packages || [];

  const handleView = (record) => {
    // navigate(`/package-detail/${record.id}`);
    console.log('View', record);
  };

  const handleEdit = (record) => {
    // Navigate to edit page or open modal
    console.log('Edit', record);
  };

  const handleDelete = (record) => {
    // Delete logic
    console.log('Delete', record);
  };

  const allColumns = getPackageColumns(handleView, handleEdit, handleDelete);

  const filteredData = useMemo(() => {
    if (!packages || packages.length === 0) return [];
    let filtered = packages;

    // Search filter
    if (searchText) {
      filtered = filtered?.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.branchId?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.status === activeTab);
    }

    // Package Type filter
    if (packageTypeFilter !== "all") {
      filtered = filtered.filter(item => item.type === packageTypeFilter);
    }

    return filtered;
  }, [packages, searchText, activeTab, packageTypeFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, page, limit]);

  const handlePageChange = (newPage, newLimit) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPage(1);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const getUniquePackageTypes = () => {
    if (!packagesData?.packages) return [];
    const types = packagesData?.packages?.map(item => item.packageType).filter(Boolean);
    return [...new Set(types)];
  };

  const tabsData = [
    { key: "all", label: "All", count: 0 },
    { key: "active", label: "Active", count: 0 },
    { key: "inactive", label: "Inactive", count: 0 },
  ];

  const breadcrumbItems = [
    { title: <HomeOutlined />, href: Home },
    { title: "All Packages" },
  ];

  return (
    <div className="all-packages-page">
         <div className="header-section">
              <div className="left-col">
      
              <SearchBar
                value={searchText}
                onChange={setSearchText}
                placeholder="Search employees..."
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
                onClick={() => navigate(AddPackageRoute)}
                >
                Add Package
              </Button>
      
              <ColumnVisibility
                columns={allColumns}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
                />
                </div>
            </div>

        <CommonTable
          columns={allColumns.filter(col => visibleColumns[col.key])}
          dataSource={paginatedData}
          loading={isLoading}
          rowKey="_id"
          pagination={false}
        />

        <CustomPagination
          current={page}
          total={filteredData.length}
          pageSize={limit}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
        />
      
    </div>
  );
};

export default AllPackages;