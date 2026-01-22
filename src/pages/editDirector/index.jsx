import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Select } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ImagePicker from '../../components/form/ImagePicker';
import { useGetBranchesQuery } from '../../services/branches';
import { useGetDirectorDetailQuery, useUpdateDirectorMutation } from '../../services/director';
import { useGetRolesQuery } from '../../services/role';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllDirectorsRoute } from '../../routes/routepath';
import './styles.scss';

const { Option } = Select;

const EditDirector = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: directorData, isLoading: directorLoading } = useGetDirectorDetailQuery(id);
  console.log(directorData?.data,"bhjknlm;")
  const { data, isLoading: branchesLoading, error } = useGetBranchesQuery();
  const branches = data?.branches || data?.data || [];
  const [updateDirector, { isLoading: updating }] = useUpdateDirectorMutation();
  const { data: rolesData } = useGetRolesQuery();
  const roles = rolesData?.data || rolesData?.roles || [];

  // TODO: Add useGetDirectorByIdQuery when available
  // const { data: directorData } = useGetDirectorByIdQuery(id);

  useEffect(() => {
    if (directorData?.data && !directorLoading) {
      const director = directorData.data;
      form.setFieldsValue({
        name: director.name,
        email: director.email,
        number: director.number,
        address: director.address,
        role: director.role?._id,
        branches: director.branch?._id,
        photo: director.photo || director.image
      });
    }
  }, [directorData, directorLoading, form]);

  const onFinish = async (values) => {
    setLoading(true);
    // Use the image URL directly from ImagePicker
    const photoUrl = values.photo;
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.number,
      address: values.address,
      role: values.role,
      branch: Array.isArray(values.branches) ? values.branches[0] : values.branches,
      photo: photoUrl,
      image: photoUrl,
    };
    try {
      await updateDirector({ id, ...payload }).unwrap();
      navigate(AllDirectorsRoute);
    } catch (err) {
      console.error('Error updating director:', err);
    }
    setLoading(false);
  };

  // Custom validator for phone number
  const validatePhoneNumber = (_, value) => {
    if (!value) return Promise.reject(new Error('Phone number is required'));
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('Please enter a valid 10-digit phone number'));
    }
    return Promise.resolve();
  };

  // Custom validator for email
  const validateEmail = (_, value) => {
    if (!value) return Promise.reject(new Error('Email is required'));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('Please enter a valid email address'));
    }
    return Promise.resolve();
  };

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: 'All Directors', to: AllDirectorsRoute },
    { label: 'Edit Director' },
  ];

  return (
    <div className="add-director-page">
      <div className="page-header">
        <h2>Edit Director</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        {directorLoading ? (
          <div className="loading-container">
            <div className="loading-text">Loading director data...</div>
          </div>
        ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="director-form"
        >
          <div className="form-row">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter director name' }]}
            >
              <Input placeholder="Enter director name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ validator: validateEmail }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Phone Number"
              name="number"
              rules={[{ validator: validatePhoneNumber }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select role" loading={branchesLoading} disabled>
                {roles.map(role => (
                  <Option key={role._id} value={role._id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Branch"
              name="branches"
              rules={[{ required: true, message: 'Please select a branch' }]}
            >
              <Select placeholder="Select branch" loading={branchesLoading}>
                {branches.map(branch => (
                  <Option key={branch._id} value={branch._id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Photo"
              name="photo"
              rules={[{ required: true, message: 'Please upload a photo' }]}
            >
              <ImagePicker 
                form={form} 
                initialImageUrl={directorData?.data?.photo || directorData?.data?.image}
              />
            </Form.Item>
          </div>

          <div className="form-actions">
            <Button 
              type="default" 
              onClick={() => navigate(AllDirectorsRoute)}
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading || updating}
              className="submit-btn"
            >
              Update Director
            </Button>
          </div>
        </Form>
        )}
      </div>
    </div>
  );
};

export default EditDirector;