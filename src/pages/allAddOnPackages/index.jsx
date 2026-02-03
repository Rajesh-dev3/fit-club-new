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

// Dummy API hook placeholder
// import { useGetAllAddOnPackagesQuery } from "../../services/addOnPackage";

const mapPackageToRow = (pkg) => ({
  _id: pkg._id,
  branch: pkg.branchName || '-',
  packageType: pkg.packageType || '-',
  name: pkg.name || '-',
  session: pkg.session || '-',
  pricing: pkg.pricing || '-',
  numberOfDays: pkg.numberOfDays || '-',
  status: pkg.status || '-',
});

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

  // const { data, isLoading } = useGetAllAddOnPackagesQuery({ page, limit });
  // For now, use dummy data
  const data = { packages: [] };
  const isLoading = false;

  const packagesData = useMemo(() => {
    if (!data?.packages) return [];
    return data.packages.map(mapPackageToRow);
  }, [data]);


  // Static package type options
  const typeOptions = [
    { label: 'Personal Training', value: 'Personal Training' },
    { label: 'Pilates', value: 'Pilates' },
    { label: 'Therapy', value: 'Therapy' },
    { label: 'EMS', value: 'EMS' },
    { label: 'Paid Locker', value: 'Paid Locker' },
    { label: 'MMA', value: 'MMA' },
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
