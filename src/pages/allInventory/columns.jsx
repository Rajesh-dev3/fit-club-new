import { Tag, Button, Dropdown, Switch } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";

function statusColor(status) {
  switch (status) {
    case 'active': return 'green';
    case 'maintenance': return 'orange';
    case 'out_of_order': return 'red';
    case 'retired': return 'volcano';
    default: return 'default';
  }
}

function statusTagClass(status) {
  switch (status) {
    case 'maintenance': return 'ant-tag-orange';
    case 'out_of_order': return 'ant-tag-red';
    case 'retired': return 'ant-tag-volcano';
    default: return '';
  }
}

const allColumns = [
  { 
    title: 'Branch Name', 
    dataIndex: 'branchName', 
    key: 'branchName', 
    width: 150,
    render: (text, record) => {
      if (record.branchId && typeof record.branchId === 'object') {
        return record.branchId.name || 'N/A';
      }
      return text || 'N/A';
    }
  },
  { 
    title: 'Warehouse Name', 
    dataIndex: 'warehouseName', 
    key: 'warehouseName', 
    width: 150,
    render: (text, record) => {
      return text || 'N/A';
    }
  },
  { 
    title: 'Product Name', 
    dataIndex: 'productName', 
    key: 'productName', 
    width: 200
  },
  { 
    title: 'Quantity', 
    dataIndex: 'quantity', 
    key: 'quantity', 
    width: 100, 
    align: 'center'
  },
  { 
    title: 'Quantity Available', 
    dataIndex: 'quantity', 
    key: 'quantityAvailable', 
    width: 150, 
    align: 'center'
  },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status', 
    width: 120, 
    align: 'center'
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
          onClick: () => handleEdit && handleEdit(record) 
        },
        { 
          key: 'delete', 
          label: 'Delete', 
          icon: <DeleteOutlined />, 
          danger: true, 
          onClick: () => handleDelete && handleDelete(record) 
        },
      ];
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    }
  },
];

const getInventoryColumns = (handleEdit, handleDelete, handleStatusToggle, handleAddQuantity) => {
  return allColumns.map(col => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (status, record) => {
          console.log('Rendering switch for record:', record, 'status:', status);
          return (
            <Switch
              checked={status === 'active'}
              onChange={(checked) => {
                console.log('Switch toggled:', { checked, record });
                handleStatusToggle && handleStatusToggle(record, checked ? 'active' : 'inactive');
              }}
              checkedChildren="On"
              unCheckedChildren="Off"
              size="small"
            />
          );
        }
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_, record) => {
          const menuItems = [
            { 
              key: 'edit', 
              label: 'Edit', 
              icon: <EditOutlined />, 
              onClick: () => handleEdit && handleEdit(record) 
            },
            { 
              key: 'addQuantity', 
              label: 'Add Quantity', 
              icon: <PlusOutlined />, 
              onClick: () => handleAddQuantity && handleAddQuantity(record) 
            },
            { 
              key: 'delete', 
              label: 'Delete', 
              icon: <DeleteOutlined />, 
              danger: true, 
              onClick: () => handleDelete && handleDelete(record) 
            },
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

export { getInventoryColumns };
export default allColumns;