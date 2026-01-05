import React, { useState, useMemo } from "react";
import { Form, Input, Button, message, Checkbox, Select, InputNumber } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useSiderMenuQuery } from "../../services/permissions";
import { useAddRoleMutation } from "../../services/role";
// ...existing code...
import { AllRolesRoute, Home } from "../../routes/routepath";
import PageBreadcrumb from "../../components/breadcrumb";

const AddRole = () => {
  const [form] = Form.useForm();
  const { data: menuData } = useSiderMenuQuery();
  const [triggerAddRole, { isLoading: adding }] = useAddRoleMutation();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [customLevels, setCustomLevels] = useState([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [newLevelValue, setNewLevelValue] = useState(null);

  // Transform menu data to permissions format
  const groupedPermissions = useMemo(() => {
    if (!menuData?.menu) return {};
    
    const grouped = {};
    
    menuData.menu.forEach((menuItem) => {
      const category = menuItem.label;
      
      if (menuItem.children && menuItem.children.length > 0) {
        // Parent category with children
        grouped[category] = menuItem.children.map((child) => ({
          _id: child.key,
          displayName: child.label,
          description: child.permission || 'Permission',
          permission: child.permission,
        }));
      } else {
        // Standalone menu item as single permission
        if (!grouped['General']) {
          grouped['General'] = [];
        }
        grouped['General'].push({
          _id: menuItem.key,
          displayName: menuItem.label,
          description: menuItem.permission || 'Permission',
          permission: menuItem.permission,
        });
      }
    });
    
    return grouped;
  }, [menuData]);

  const handleCategoryChange = (category, checked) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const categoryIds = categoryPermissions.map(p => p._id);
    
    if (checked) {
      // Add all permissions in this category
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryIds])]);
    } else {
      // Remove all permissions in this category
      setSelectedPermissions(prev => prev.filter(id => !categoryIds.includes(id)));
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const isCategorySelected = (category) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const categoryIds = categoryPermissions.map(p => p._id);
    return categoryIds.length > 0 && categoryIds.every(id => selectedPermissions.includes(id));
  };

  const isCategoryIndeterminate = (category) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const categoryIds = categoryPermissions.map(p => p._id);
    const selectedCount = categoryIds.filter(id => selectedPermissions.includes(id)).length;
    return selectedCount > 0 && selectedCount < categoryIds.length;
  };

  const handleAddRole = async (values) => {
    // Map selected permission keys to the correct format
    const permissionsArray = selectedPermissions.map((permKey) => {
      // Find the permission object from menuData
      for (const menuItem of menuData?.menu || []) {
        // Check if it's a top-level menu item
        if (menuItem.key === permKey) {
          return {
            key: menuItem.key,
            label: menuItem.label,
            permission: menuItem.permission,
          };
        }
        
        // Check if it's a child menu item
        if (menuItem.children) {
          const found = menuItem.children.find(child => child.key === permKey);
          if (found) {
            return {
              key: found.key,
              label: found.label,
              permission: found.permission,
            };
          }
        }
      }
      return null;
    }).filter(Boolean);

    const payload = {
      name: values.roleName,
      status: "active",
      level: values.level,
      permissions: permissionsArray,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    await triggerAddRole(payload).unwrap();
    // message.success('Role added successfully');
    form.resetFields();
    setSelectedPermissions([]);
  };

  const handleAddCustomLevel = () => {
    if (!newLevelName || newLevelValue === null) {
      message.error('Please enter both level name and value');
      return;
    }
    
    const levelExists = customLevels.some(l => l.value === newLevelValue);
    if (levelExists) {
      message.error('Level value already exists');
      return;
    }

    setCustomLevels(prev => [...prev, { label: newLevelName, value: newLevelValue }]);
    setNewLevelName("");
    setNewLevelValue(null);
    message.success('Custom level added');
  };

  const levelOptions = useMemo(() => {
    const defaultLevels = [
      { label: 'Level 1', value: 1 },
      { label: 'Level 2', value: 2 },
      { label: 'Level 3', value: 3 },
      { label: 'Level 4', value: 4 },
      { label: 'Level 5', value: 5 },
    ];
    return [...defaultLevels, ...customLevels];
  }, [customLevels]);
 const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Roles", to: AllRolesRoute },
    { label: "Add Role" },
  ];
  return (
    <div className="add-role-page">
       <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Add Role</h2>

        <PageBreadcrumb
          items={breadcrumbItems}
        />
      </div>

      <Form form={form} layout="vertical" className="role-form" onFinish={handleAddRole}>
        <div className="row">
          <Form.Item label="Role Name" name="roleName" rules={[{ required: true, message: 'Please enter role name' }]}>
            <Input placeholder="Role Name" />
          </Form.Item>

          <Form.Item label="Level" name="level">
            <Select placeholder="Select Level" options={[
              { label: 'Level 1', value: 1 },
              { label: 'Level 2', value: 2 },
              { label: 'Level 3', value: 3 },
              { label: 'Level 4', value: 4 },
              { label: 'Level 5', value: 5 },
              { label: 'Level 6', value: 6 },
              { label: 'Level 7', value: 7 },
              { label: 'Level 8', value: 8 },
            ]} />
          </Form.Item>
        </div>

        <div className="permissions-section">
          <h3 className="permissions-title">Permissions</h3>
          
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} className="permission-category">
              <div className="category-header">
                <Checkbox
                  checked={isCategorySelected(category)}
                  indeterminate={isCategoryIndeterminate(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                >
                  <span className="category-name">{category}</span>
                </Checkbox>
              </div>
              
              <div className="permission-items">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission._id}
                    checked={selectedPermissions.includes(permission._id)}
                    onChange={(e) => handlePermissionChange(permission._id, e.target.checked)}
                  >
                    <div className="permission-item">
                      <span className="permission-name">{permission.displayName}</span>
                      <span className="permission-description">{permission.description}</span>
                    </div>
                  </Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-buttons">
          <Button className="delete-btn" onClick={() => {
            form.resetFields();
            setSelectedPermissions([]);
          }}>
            <DeleteOutlined /> RESET
          </Button>

          <Button className="save-btn" type="primary" htmlType="submit" loading={adding}>SAVE</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddRole;
