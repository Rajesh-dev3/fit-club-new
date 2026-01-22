import { Image, Tag, Button, Dropdown, Select } from "antd";
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, KeyOutlined } from "@ant-design/icons";
import { UserDetailAttendanceRoute } from "../../routes/routepath";

function statusColor(status) {
  switch (status) {
    case 'active': return 'green';
    case 'pending': return 'orange';
    case 'inactive': return 'red';
    case 'freezed': return 'blue';
    case 'block': return 'volcano';
    default: return 'default';
  }
}

function statusTagClass(status) {
  switch (status) {
    case 'pending': return 'ant-tag-orange';
    case 'freezed': return 'ant-tag-blue';
    case 'block': return 'ant-tag-volcano';
    default: return '';
  }
}

// This will be replaced by real trainer data via props/context/hook in the future
const dummyTrainers = [
  { label: 'Trainer 1', value: 'trainer1' },
  { label: 'Trainer 2', value: 'trainer2' },
  { label: 'Trainer 3', value: 'trainer3' },
];

const allColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
  { title: 'Branch', dataIndex: 'branch', key: 'branch', width: 120 },
  { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130 },
  { title: 'Assessment Ratio', dataIndex: 'assessmentRatio', key: 'assessmentRatio', width: 120 },
  {
    title: 'Sales Person',
    dataIndex: 'salesPerson',
    key: 'salesPerson',
    width: 150,
    render: (value) => (
      <Select
        placeholder="Select Trainer"
        options={dummyTrainers}
        style={{ width: '100%' }}
        value={value && dummyTrainers.some(t => t.value === value) ? value : undefined}
        allowClear
      />
    ),
  },
  { title: 'Plan Name', dataIndex: 'planName', key: 'planName', width: 120 },
  { title: 'Plan Price', dataIndex: 'planPrice', key: 'planPrice', width: 100 },
  { title: 'Profile', dataIndex: 'profile', key: 'profile', width: 80, render: (url) => <Image src={url || 'https://via.placeholder.com/40'} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> },
  { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 80 },
  { title: 'Status', dataIndex: 'status', key: 'status', width: 100, align: 'center', render: (status) => <Tag color={statusColor(status)} className={statusTagClass(status)}>{status.toUpperCase()}</Tag> },
  { title: 'Invoice Status', dataIndex: 'invoiceStatus', key: 'invoiceStatus', width: 120 },
  { title: 'Remaining Days', dataIndex: 'remainingDays', key: 'remainingDays', width: 120 },
  { title: 'View Profile', key: 'viewProfile', width: 80, align: 'center', render: (_, record) => (
    <Link to={`/user-detail/${record._id}/${UserDetailAttendanceRoute}`}>
      <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} />
    </Link>
  ) },
  { title: 'Membership Form', dataIndex: 'membershipForm', key: 'membershipForm', width: 120 },
  { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: 'End Date', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: 'Gym Kit', dataIndex: 'gymKit', key: 'gymKit', width: 100 },
  { title: 'Actions', key: 'actions', width: 100, align: 'center', render: (_, record) => {
    const menuItems = [
      { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: () => handleEdit && handleEdit(record) },
      { key: 'changePassword', label: 'Change Password', icon: <KeyOutlined />, onClick: () => handleChangePassword && handleChangePassword(record) },
      { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete && handleDelete(record) },
    ];
    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
      </Dropdown>
    );
  } },
];

const getUserColumns = (handleEdit, handleDelete, handleChangePassword) => {
  return allColumns.map(col => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_, record) => {
          const menuItems = [
            { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: () => handleEdit && handleEdit(record) },
            { key: 'changePassword', label: 'Change Password', icon: <KeyOutlined />, onClick: () => handleChangePassword && handleChangePassword(record) },
            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete && handleDelete(record) },
          ];
          return (
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          );
        }
      };
    }
    return col;
  });
};

export { getUserColumns };
export default allColumns;
