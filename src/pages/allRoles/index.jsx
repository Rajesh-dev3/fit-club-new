import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Dropdown, Tag, message, Modal, Switch } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MoreOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetRolesQuery, useDeleteRoleMutation, useUpdateRoleMutation, useUpdateRoleStatusMutation } from "../../services/role";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
// ...existing code...
import {  AddRoleRoute, EditRoleRoute } from "../../routes/routepath";
import "./styles.scss";
import CommonTable from "../../components/commonTable";

const { confirm } = Modal;

const AllRoles = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    level: true,
    permissionsCount: true,
    status: true,
    actions: true,
  });
  
  const { data: rolesData, isLoading } = useGetRolesQuery();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
 
  const [updateRoleStatus, { isLoading: updatingStatus }] = useUpdateRoleStatusMutation();

  const handleStatusToggle = async (record, newStatus) => {
    try {
      await updateRoleStatus(record?._id).unwrap();
      // message.success(`Role ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      // message.error(error?.data?.message || 'Failed to update role status');
    }
  };
 

  const allColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      render: (level) => (
        <Tag color="blue">Level {level || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissionsCount',
      width: 150,
      align: 'center',
      render: (permissions) => (
        <span>{Array.isArray(permissions) ? permissions.length : 0} permissions</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Switch
            checked={status === 'active'}
            onChange={(checked) => handleStatusToggle(record, checked)}
            loading={updatingStatus}
            size="small"
            checkedChildren="On"
            unCheckedChildren="Off"
            style={{ minWidth: 40,width:40 }}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleEdit = (record) => {
    if (record && record._id) {
      navigate(`${EditRoleRoute}/${record._id}`);
    } else {
      message.error('Role ID not found');
    }
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this role?',
      icon: <ExclamationCircleOutlined />,
      content: `Role: ${record.name}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteRole(record._id).unwrap();
          message.success('Role deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete role');
        }
      },
    });
  };

  const handleAddRole = () => {
    navigate(AddRoleRoute);
  };

  // Filter data based on search and tab
  const filteredData = rolesData?.data?.filter(item => {
    const matchesSearch = searchText === "" || 
      item.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "active" && item.status === "active") ||
      (activeTab === "inactive" && item.status !== "active");
    
    return matchesSearch && matchesTab;
  });

  // Calculate counts for each tab
  const allCount = rolesData?.data?.length || 0;
  const activeCount = rolesData?.data?.filter(item => item.status === "active").length || 0;
  const inactiveCount = rolesData?.data?.filter(item => item.status !== "active").length || 0;

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
    <div className="all-roles-page">
    

      {/* Header with Search, Tabs, and Add Button */}
      <div className="header-section">
        <div className="left-col">

        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search roles..."
          />

        <StatusTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabsData}
          />
          </div>
<div className="flex" style={{ gap: "10px" }}>

        <AddButton to={AddRoleRoute}>
          Add Role
        </AddButton>

        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          />
          </div>
      </div>

      {/* Table */}
      <div className="roles-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading || deleting}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 800 }}
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

export default AllRoles;
