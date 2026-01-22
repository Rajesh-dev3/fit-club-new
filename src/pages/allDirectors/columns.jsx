import { Tag, Button, Dropdown, Switch } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { DirectorDetailPageRoute, UserDetailAttendanceRoute } from "../../routes/routepath";

export const getColumns = (handleView, handleEdit, handleDelete, handleChangePassword, handleStatusToggle, updatingStatus) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 130,
  },
  {
    title: 'Branch Name',
    dataIndex: 'branches',
    key: 'branchName',
    width: 150,
    render: (branches) => {
      if (Array.isArray(branches) && branches.length > 0) {
        return branches.map(b => b.name).join(', ');
      }
      return '-';
    },
  },
  {
    title: 'Owned By',
    dataIndex: 'ownedBy',
    key: 'ownedBy',
    width: 150,
    render: (ownedBy) => ownedBy || '-',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    align: 'center',
    render: (status, record) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Switch
          checked={status === 'ACTIVE'}
          onChange={(checked) => handleStatusToggle(record, checked)}
          loading={updatingStatus}
          size="small"
         checkedChildren="On"
            unCheckedChildren="Off"
          style={{ minWidth: 40, width: 40 }}
        />
 
      </div>
    ),
  },
  {
    title: 'View',
    key: 'view',
    width: 80,
    align: 'center',
    render: (_, record) => (
      <Link to={DirectorDetailPageRoute + `/${record._id}/${UserDetailAttendanceRoute}`}>
      <Button
        type="link"
        icon={<EyeOutlined />}
        onClick={() => handleView(record)}
        />
        </Link>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 80,
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
          key: 'change-password',
          label: 'Change Password',
          icon: <HomeOutlined />,
          onClick: () => handleChangePassword(record),
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