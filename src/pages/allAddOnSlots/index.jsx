import  { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Home, AddAddOnSlotRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CommonTable from '../../components/commonTable';
import "./styles.scss";
import { getAddOnSlotColumns } from './columns';

const AllAddOnSlots = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    planType: true,
    className: true,
    timeFrom: true,
    timeTo: true,
    viewHistory: true,
    actions: true,
  });
  
  // Placeholder data - will be replaced with API call
  const addOnSlots = [];
  const isLoading = false;

  const handleEdit = (record) => {
    console.log('Edit', record);
  };

  const handleDelete = (record) => {
    console.log('Delete', record);
  };

  const allColumns = getAddOnSlotColumns(handleEdit, handleDelete);

  const filteredData = useMemo(() => {
    if (!addOnSlots || addOnSlots.length === 0) return [];
    let filtered = addOnSlots;

    // Search filter
    if (searchText) {
      filtered = filtered?.filter(item =>
        item.packageName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.className?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.status === activeTab);
    }

    return filtered;
  }, [addOnSlots, searchText, activeTab]);

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

//   const tabsData = [
//     { key: "all", label: "All", count: 0 },
//     { key: "active", label: "Active", count: 0 },
//     { key: "inactive", label: "Inactive", count: 0 },
//   ];

  const breadcrumbItems = [
    { title: <HomeOutlined />, href: Home },
    { title: "All Add On Slots" },
  ];

  return (
    <div className="all-add-on-slots-page">
         <div className="header-section">
              <div className="left-col">
      
              <SearchBar
                value={searchText}
                onChange={setSearchText}
                placeholder="Search add on slots..."
                />
      
              {/* <StatusTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabsData}
                />
              */}
                </div>
      <div className="flex" style={{gap:"10px"}}>
      
      
              <AddButton to={AddAddOnSlotRoute}>
                 Add On Slot
              </AddButton>
      
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

export default AllAddOnSlots;
