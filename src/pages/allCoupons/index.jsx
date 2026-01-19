import React, { useState, useMemo } from "react";
import { message, Modal, Dropdown, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import CommonTable from "../../components/commonTable";
import ColumnVisibility from "../../components/columnVisibility";
import PageBreadcrumb from "../../components/breadcrumb";
import CustomPagination from "../../components/pagination";
import { HomeOutlined } from "@ant-design/icons";
import { Home, AddCouponRoute } from "../../routes/routepath";
import "./styles.scss";
import { useGetAllCouponQuery } from "../../services/coupons";

const allColumns = [
  { title: "Code", dataIndex: "code", key: "code" },
  { title: "Coupon Type", dataIndex: "couponType", key: "couponType" },
  { title: "Remark", dataIndex: "remark", key: "remark" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Value", dataIndex: "value", key: "value" },
  { title: "Discount Type", dataIndex: "discountType", key: "discountType" },
  { title: "Sales Person", dataIndex: "salesPerson", key: "salesPerson" },
  { title: "Branch", dataIndex: "branch", key: "branch" },
  { title: "Usage", dataIndex: "usage", key: "usage" },
  { title: "Valid From", dataIndex: "validFrom", key: "validFrom" },
  { title: "Actions", dataIndex: "actions", key: "actions" },
];

const statusTabs = [
  { key: "all", label: "All", count: 0 },
  { key: "regular", label: "Regular" },
  { key: "single_use", label: "Single Use" },
  { key: "used", label: "Used" },
  { key: "unused", label: "Unused" },
];

const AllCoupons = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  // Pass search and status as params to API
  const { data, isLoading } = useGetAllCouponQuery({
    search: searchText,
    type:activeTab !== "all" ? activeTab : undefined,
    page,
    limit
  });
  const coupons = data?.data || [];
  const counts = data?.counts || [];
  const paginationInfo = data?.pagination || {};

  // Update status tabs with counts from API
  const updatedStatusTabs = useMemo(() => {
    return statusTabs.map(tab => {
      const countData = counts.find(c => c.key === tab.key);
      return {
        ...tab,
        count: countData ? countData.count : 0
      };
    });
  }, [counts]);

  const filteredData = useMemo(() => {
    let d = coupons;
    
    // Filter by active tab
    if (activeTab !== "all") {
      if (activeTab === "used") {
        // Filter coupons that have been used (usedCount > 0)
        d = d.filter(u => u.usedCount > 0);
      } else if (activeTab === "unused") {
        // Filter coupons that haven't been used (usedCount === 0)
        d = d.filter(u => u.usedCount === 0);
      } else {
        // Filter by couponType for "regular" and "single_use"
        d = d.filter(u => u.couponType === activeTab);
      }
    }
    
    // Filter by search text
    if (searchText) {
      d = d.filter(u => 
        u.code && u.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return d;
  }, [coupons, activeTab, searchText]);

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this coupon?",
      content: `This action will delete coupon: ${record.code}`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        // TODO: Replace with actual delete API call
        message.success("Coupon deleted successfully!");
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const columns = useMemo(() => {
    return allColumns.filter((col) => visibleColumns[col.key]).map((col) => {
      if (col.key === "salesPerson") {
        return {
          ...col,
          render: (_, record) => {
            if (record.couponType === "single_use" && record.employeeId && record.employeeId.user) {
              return record.employeeId.user.name;
            }
            return "Every one";
          },
        };
      }
      
      if (col.key === "branch") {
        return {
          ...col,
          render: (_, record) => {
            return record.branchId?.name || "-";
          },
        };
      }
      
      if (col.key === "usage") {
        return {
          ...col,
          render: (_, record) => {
            const used = record.usedCount || 0;
            const limit = record.usageLimit || "Unlimited";
            const limitText = limit === "Unlimited" ? "∞" : limit;
            return `${used} / ${limitText}`;
          },
        };
      }
      
      if (col.key === "validFrom") {
        return {
          ...col,
          render: (_, record) => {
            return formatDate(record.validFrom);
          },
        };
      }
      
      if (col.key === "couponType") {
        return {
          ...col,
          render: (text) => {
            if (text === "regular") return "Regular";
            if (text === "single_use") return "Single Use";
            return text;
          },
        };
      }
      
      if (col.key === "discountType") {
        return {
          ...col,
          render: (text) => {
            if (text === "percentage") return "Percentage";
            if (text === "absolute") return "Fixed Amount";
            return text;
          },
        };
      }
      
      if (col.key === "value") {
        return {
          ...col,
          render: (text, record) => {
            if (record.discountType === "percentage") {
              return `${text}%`;
            }
            return `₹${text}`;
          },
        };
      }
      
      if (col.key === "actions") {
        return {
          ...col,
          render: (_, record) => {
            const items = [
              {
                key: 'edit',
                label: 'Edit',
                onClick: () => {
                  // TODO: Implement edit functionality
                  message.info('Edit feature coming soon');
                },
              },
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ];
            
            return (
              <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
              >
                <MoreOutlined style={{ fontSize: 20, cursor: "pointer" }} />
              </Dropdown>
            );
          },
        };
      }
      
      return col;
    });
  }, [visibleColumns]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  // Use server-side pagination if available, otherwise use client-side
  const paginatedData = useMemo(() => {
    // If we have server-side pagination data, use it directly
    if (data?.pagination && page === data.pagination.page) {
      return coupons;
    }
    
    // Otherwise, fall back to client-side pagination
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit, data?.pagination, coupons]);

  // Determine total count for pagination
  const totalCount = useMemo(() => {
    // For filtered data (client-side filtering)
    if (activeTab !== "all" || searchText) {
      return filteredData.length;
    }
    // For all data with server-side pagination
    return paginationInfo.total || filteredData.length;
  }, [filteredData, activeTab, searchText, paginationInfo.total]);

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Coupons" },
  ];

  return (
    <div className="all-coupons-page">
      
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search coupons by code..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setPage(1); // Reset to first page when changing tabs
            }}
            tabs={updatedStatusTabs}
          />
        </div>
        <div className="flex" style={{ gap: "10px", alignItems: 'center' }}>
          <Button type="primary" href={AddCouponRoute} style={{ fontWeight: 500 }}>
            Add Coupon
          </Button>
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>
      
      <div className="coupons-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id}
          scroll={{ x: 1500 }}
        />
      </div>
      
      <CustomPagination
        current={page}
        pageSize={limit}
        total={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AllCoupons;