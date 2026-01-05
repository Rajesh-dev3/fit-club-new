import { Tag, Button, Dropdown } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";

export const getColumns = (handleEdit, handleDelete) => [
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
    width: 120,
    align: 'center',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status === 'active' ? 'ACTIVE' : 'INACTIVE'}
      </Tag>
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
