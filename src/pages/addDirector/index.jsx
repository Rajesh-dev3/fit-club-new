import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ImagePicker from '../../components/form/ImagePicker';
import { useGetBranchesQuery } from '../../services/branches';
import { useAddDirectorMutation } from '../../services/director';
import { useGetRolesQuery } from '../../services/role';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllDirectorsRoute } from '../../routes/routepath';
import './styles.scss';

const { Option } = Select;

const AddDirector = () => {
  const [loading, setLoading] = useState(false);
  const { data, isLoading: branchesLoading, error } = useGetBranchesQuery();
  const branches = data?.branches || data?.data || [];
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [addDirector, { isLoading: adding }] = useAddDirectorMutation();
  const { data: rolesData } = useGetRolesQuery();
  const roles = rolesData?.data || rolesData?.roles || [];

  const onFinish = async (values) => {
    setLoading(true);
    // Use the image URL directly from ImagePicker
    const photoUrl = values.photo;
    const payload = {
      name: values.name,
      email: values.email,
      number: values.number,
      address: values.address,
      role: values.role,
      branch: Array.isArray(values.branches) ? values.branches[0] : values.branches,
      photo: photoUrl,
      image: photoUrl,
    };
    try {
      await addDirector(payload).unwrap();
      form.resetFields();
      navigate(AllDirectorsRoute);
    } catch (err) {
      console.error('Error adding director:', err);
    }
    setLoading(false);
  };

  // Custom validator for phone number
  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please enter phone number'));
    }
    
    // Basic phone validation - 10 digits minimum
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(value.replace(/\D/g, ''))) {
      return Promise.reject(new Error('Please enter a valid phone number (10-15 digits)'));
    }
    
    return Promise.resolve();
  };

  // Custom validator for name
  const validateName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please enter director name'));
    }
    
    // Name should contain only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(value.trim())) {
      return Promise.reject(new Error('Name should contain only letters'));
    }
    
    if (value.trim().length < 2) {
      return Promise.reject(new Error('Name should be at least 2 characters'));
    }
    
    return Promise.resolve();
  };

  return (
    <div className="add-director-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Add Director</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'DIRECTOR MANAGEMENT', to: AllDirectorsRoute },
            { label: 'Add Director' }
          ]}
        />
      </div>
      
      <Form 
        form={form} 
        layout="vertical" 
        className="add-director-form" 
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
        }}
      >
        <div className="row">
          <Form.Item 
            label="Director Name" 
            name="name" 
            rules={[
              { required: true, message: 'Please enter director name' },
              { validator: validateName }
            ]}
          >
            <Input placeholder="Director Name" />
          </Form.Item>
          
          <Form.Item 
            label="Email" 
            name="email" 
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          
          <Form.Item 
            label="Role" 
            name="role" 
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              {roles.map((role) => (
                <Option key={role._id || role.id} value={role._id || role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Phone Number" 
            name="number" 
            rules={[
              { required: true, message: 'Please enter phone number' },
              { validator: validatePhoneNumber }
            ]}
          >
            <Input placeholder="Phone Number" maxLength={15} />
          </Form.Item>
          
          <Form.Item 
            label="Photo" 
            name="photo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <ImagePicker form={form} name="photo" aspectRatio={1} />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Address" 
            name="address" 
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea placeholder="Address" rows={2} />
          </Form.Item>
          
          <Form.Item 
            label="Select Branches" 
            name="branches" 
            rules={[{ required: true, message: 'Please select at least one branch' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select branches" 
              optionFilterProp="children" 
              showSearch
            >
              {branches.map((branch) => (
                <Option key={branch.id || branch._id} value={branch.id || branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        
        <div className="footer-buttons">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || adding} 
            className="save-btn"
          >
            Add Director
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddDirector;