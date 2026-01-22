import React, { useState, useMemo, useEffect } from "react";
import { Form, Input, Button, message, Checkbox, Select, InputNumber } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useSiderMenuQuery } from "../../services/permissions";
import { useAddRoleMutation, useGetRoleByIdQuery, useUpdateRoleMutation } from "../../services/role";
import { AllRolesRoute, Home } from "../../routes/routepath";
import PageBreadcrumb from "../../components/breadcrumb";
import { useParams, useNavigate } from "react-router-dom";

const EditRole = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: menuData } = useSiderMenuQuery();
  const { data: roleData, isLoading: loadingRole } = useGetRoleByIdQuery(id);
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [customLevels, setCustomLevels] = useState([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [newLevelValue, setNewLevelValue] = useState(null);

  // Transform menu data to permissions format - using key instead of _id
  const groupedPermissions = useMemo(() => {
    if (!menuData?.menu) return {};
    const grouped = {};
    
    
    menuData.menu.forEach((menuItem) => {
      const category = menuItem.label;
      
      if (menuItem.children && menuItem.children.length > 0) {
        grouped[category] = menuItem.children.map((child) => {
          return {
            key: child.key,  // Use key instead of _id
            displayName: child.label,
            description: child.permission || 'Permission',
            permission: child.permission,
          };
        });
      } else {
        if (!grouped['General']) {
          grouped['General'] = [];
        }
        grouped['General'].push({
          key: menuItem.key,  // Use key instead of _id
          displayName: menuItem.label,
          description: menuItem.permission || 'Permission',
          permission: menuItem.permission,
        });
      }
    });
    
    return grouped;
  }, [menuData]);

  // Debug logging
  console.log("Selected permissions:", selectedPermissions);
  console.log("Grouped permissions:", groupedPermissions);

  useEffect(() => {
    if (roleData && roleData.success && roleData.data) {
      const { role, permissions } = roleData.data;
      
      
      form.setFieldsValue({
        name: role?.name || "",
        description: role?.description || "",
      });
      
      // Extract permission keys from the API response
      if (Array.isArray(permissions)) {
        const permissionKeys = permissions.map(p => p.key);
        setSelectedPermissions(permissionKeys);
      } else {
        setSelectedPermissions([]);
      }
      
      setCustomLevels(role?.levels || []);
    }
  }, [roleData, form]);

  // Check if all permissions in a category are selected
  const isCategorySelected = (category) => {
    const categoryPermissions = groupedPermissions[category] || [];
    if (categoryPermissions.length === 0) return false;
    return categoryPermissions.every(p => selectedPermissions.includes(p.key));
  };

  // Check if some (but not all) permissions in a category are selected
  const isCategoryIndeterminate = (category) => {
    const categoryPermissions = groupedPermissions[category] || [];
    if (categoryPermissions.length === 0) return false;
    const hasSomeSelected = categoryPermissions.some(p => selectedPermissions.includes(p.key));
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p.key));
    return hasSomeSelected && !allSelected;
  };

  const handleCategoryChange = (category, checked) => {
    console.log('Category change:', category, checked);
    const categoryPermissions = groupedPermissions[category] || [];
    const categoryKeys = categoryPermissions.map(p => p.key);
    console.log('Category keys:', categoryKeys);
    
    if (checked) {
      setSelectedPermissions(prev => {
        const newSelection = [...new Set([...prev, ...categoryKeys])];
        console.log('New selection (add):', newSelection);
        return newSelection;
      });
    } else {
      setSelectedPermissions(prev => {
        const newSelection = prev.filter(key => !categoryKeys.includes(key));
        console.log('New selection (remove):', newSelection);
        return newSelection;
      });
    }
  };

  const handlePermissionChange = (permissionKey, checked) => {
    console.log('Permission change:', permissionKey, checked);
    if (checked) {
      setSelectedPermissions(prev => {
        const newSelection = [...new Set([...prev, permissionKey])];
        console.log('New selection (add single):', newSelection);
        return newSelection;
      });
    } else {
      setSelectedPermissions(prev => {
        const newSelection = prev.filter(key => key !== permissionKey);
        console.log('New selection (remove single):', newSelection);
        return newSelection;
      });
    }
  };

  const handleAddLevel = () => {
    if (!newLevelName || newLevelValue == null) return;
    setCustomLevels(prev => [...prev, { name: newLevelName, value: newLevelValue }]);
    setNewLevelName("");
    setNewLevelValue(null);
  };

  const handleRemoveLevel = (idx) => {
    setCustomLevels(prev => prev.filter((_, i) => i !== idx));
  };

  const onFinish = async (values) => {
    try {
      // Convert selected permission keys to permission objects for API
      const permissionObjects = [];
      selectedPermissions.forEach(key => {
        // Find the permission in menuData and get its details
        for (const menuItem of menuData?.menu || []) {
          if (menuItem.key === key) {
            permissionObjects.push({
              key: menuItem.key,
              label: menuItem.label,
              permission: menuItem.permission || 'DEFAULT_PERMISSION'
            });
            break;
          }
          if (menuItem.children) {
            const found = menuItem.children.find(child => child.key === key);
            if (found) {
              permissionObjects.push({
                key: found.key,
                label: found.label,
                permission: found.permission || 'DEFAULT_PERMISSION'
              });
              break;
            }
          }
        }
      });
      
      // Filter out any permissions that don't have all required fields
      const validPermissions = permissionObjects.filter(p => 
        p.key && p.label && p.permission && p.permission !== 'DEFAULT_PERMISSION'
      );
      
      await updateRole({
        id,
        name: values.name,
        description: values.description,
        permissions: validPermissions,  // Send only valid permission objects
        levels: customLevels,
      }).unwrap();
      navigate(AllRolesRoute);
    } catch (err) {
    }
  };

  const handleReset = () => {
    if (roleData && roleData.success && roleData.data) {
      const { role, permissions } = roleData.data;
      form.setFieldsValue({
        name: role?.name || "",
        description: role?.description || "",
      });
      
      if (Array.isArray(permissions)) {
        setSelectedPermissions(permissions.map(p => p.key));
      } else {
        setSelectedPermissions([]);
      }
      
      setCustomLevels(role?.levels || []);
    } else {
      form.resetFields();
      setSelectedPermissions([]);
      setCustomLevels([]);
    }
  };

  // Show loading state
  if (loadingRole) {
    return <div className="add-role-page">Loading role data...</div>;
  }

  // Breadcrumb items for Edit Role
  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Roles", to: AllRolesRoute },
    { label: "Edit Role" },
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
        <h2 style={{ margin: 0 }}>Edit Role</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>
      <Form form={form} layout="vertical" className="role-form" onFinish={onFinish}>
        <div className="row">
          <Form.Item label="Role Name" name="name" rules={[{ required: true, message: "Please enter role name" }]}> 
            <Input placeholder="Role Name" /> 
          </Form.Item>
          <Form.Item label="Description" name="description"> 
            <Input placeholder="Description" /> 
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
                  onChange={e => handleCategoryChange(category, e.target.checked)}
                >
                  <span className="category-name">{category}</span>
                </Checkbox>
              </div>
              <div className="permission-items">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission.key}
                    checked={selectedPermissions.includes(permission.key)}
                    onChange={e => handlePermissionChange(permission.key, e.target.checked)}
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
          <Button className="delete-btn" onClick={handleReset}>
            <DeleteOutlined /> RESET
          </Button>
          <Button className="save-btn" type="primary" htmlType="submit" loading={updating}>
            UPDATE
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditRole;