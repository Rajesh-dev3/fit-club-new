
import  { useState, useMemo } from "react";
import { Button, Dropdown } from "antd";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { useGetBranchesQuery } from "../../services/branches";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import CommonTable from "../../components/commonTable";
import CustomPagination from "../../components/pagination";
import "./styles.scss";

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name", width: 180 },
  { title: "Address", dataIndex: "address", key: "address", width: 220 },
  {
    title: "Incorporation Certificate",
    dataIndex: "incorporationCertificate",
    key: "incorporationCertificate",
    width: 180,
    render: (url) => url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="text" icon={<EyeOutlined />}>View</Button>
      </a>
    ) : "-",
  },
  {
    title: "GST Certificate",
    dataIndex: "gstCertificate",
    key: "gstCertificate",
    width: 180,
    render: (url) => url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="text" icon={<EyeOutlined />}>View</Button>
      </a>
    ) : "-",
  },
  {
    title: "Owned By",
    dataIndex: "ownedBy",
    key: "ownedBy",
    width: 120,
    render: (val) => val ? val.charAt(0).toUpperCase() + val.slice(1) : "-",
  },
  {
    title: "Actions",
    key: "actions",
    width: 100,
    align: "center",
    render: (_, record) => {
      const menuItems = [
        { key: 'edit', label: 'Edit', onClick: () => {} },
        // Add more actions here if needed
      ];
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  },
];

const defaultVisible = {
  name: true,
  address: true,
  incorporationCertificate: true,
  gstCertificate: true,
  ownedBy: true,
  actions: true,
};

const AllBranches = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const { data, isLoading } = useGetBranchesQuery();

  // Normalize data to array
  const branchList = useMemo(() => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredData = useMemo(() => {
    if (!searchText) return branchList;
    return branchList.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [branchList, searchText]);

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

  return (
    <div className="all-branches-page">
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search branches..."
        />
        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={(key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))}
        />
      </div>
      <div className="branches-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 900 }}
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

export default AllBranches;
