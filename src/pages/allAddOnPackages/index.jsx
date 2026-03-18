import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CommonTable from "../../components/commonTable";
import allColumns from "./columns";
import "./styles.scss";
import { useGetAddOnPackagesQuery } from "../../services/package";
import { AddAddOnPackageRoute } from "../../routes/routepath";

const AllAddOnPackages = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    branch: true,
    packageType: true,
    name: true,
    session: true,
    pricing: true,
    numberOfDays: true,
    status: true,
    actions: true,
  });

  // API call with filters
  const { data, isLoading } = useGetAddOnPackagesQuery({
    type: 'addon',
    addonType: packageTypeFilter !== 'all' ? packageTypeFilter.toLowerCase().replace(/\s+/g, '_') : undefined,
    branchId: undefined, // Add branchId filter if needed
  });

  const packagesData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map(pkg => ({
      _id: pkg._id,
      branch: pkg.branchIds?.map(b => b.name).join(', ') || '-',
      packageType: pkg.addonType ? pkg.addonType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-',
      name: pkg.name || '-',
      session: pkg.slots || '-',
      pricing: pkg.pricing || '-',
      numberOfDays: pkg.numberOfDays || '-',
      status: pkg.status || '-',
    }));
  }, [data]);


  // Static package type options
  const typeOptions = [
    { label: 'Personal Training', value: 'personal_training' },
    { label: 'Pilates', value: 'pilates' },
    { label: 'Therapy', value: 'therapy' },
    { label: 'EMS', value: 'ems' },
    { label: 'Paid Locker', value: 'paid_locker' },
    { label: 'MMA', value: 'mma' },
  ];

  const filteredData = useMemo(() => {
    let d = packagesData;
    if (activeTab !== 'all') d = d.filter(u => u.status === activeTab);
    if (packageTypeFilter !== 'all') d = d.filter(u => u.packageType === packageTypeFilter);
    if (searchText) d = d.filter(u => u.name && u.name.toLowerCase().includes(searchText.toLowerCase()));
    return d;
  }, [packagesData, activeTab, packageTypeFilter, searchText]);

  const tabsData = [
    { key: 'all', label: 'All', count: filteredData?.length || 0 },
    { key: 'active', label: 'Active', count: filteredData?.filter(u => u.status === 'active').length || 0 },
    { key: 'inactive', label: 'Inactive', count: filteredData?.filter(u => u.status === 'inactive').length || 0 },
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  // Pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

  return (
    <div className="all-add-on-packages-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search add on packages..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabsData}
          />
          <Select
            value={packageTypeFilter}
            onChange={setPackageTypeFilter}
            className="designation-filter"
            style={{ height: 41}}
            options={[
              { label: 'All Package Types', value: 'all' },
              ...typeOptions
            ]}
          />
        </div>
        <div className="flex" style={{ gap: "10px" }}>
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
          <AddButton to={AddAddOnPackageRoute}>
            Add Add On Package
          </AddButton>
        </div>
      </div>
      <div className="packages-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 1200 }}
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

export default AllAddOnPackages;
