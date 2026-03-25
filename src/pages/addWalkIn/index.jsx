import  { useState } from 'react';
import { Form, Input, Select, Button, message, Row, Col, Card } from 'antd';
import {  SaveOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, WalkInIncomingRoute } from '../../routes/routepath';
import './styles.scss';

const { Option } = Select;
const { TextArea } = Input;

const AddWalkIn = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const sourceOptions = [
    { label: 'Walk-in', value: 'Walk-in' },
    { label: 'Phone Call', value: 'Phone Call' },
    { label: 'Website', value: 'Website' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Other', value: 'Other' },
  ];

  const enquiryOptions = [
    { label: 'Gym Membership', value: 'Gym Membership' },
    { label: 'Personal Training', value: 'Personal Training' },
    { label: 'Yoga Classes', value: 'Yoga Classes' },
    { label: 'Pilates', value: 'Pilates' },
    { label: 'Therapy', value: 'Therapy' },
    { label: 'MMA', value: 'MMA' },
    { label: 'Other', value: 'Other' },
  ];

  const branchOptions = [
    { label: 'Fitclub Golf Course Road', value: 'Fitclub Golf Course Road' },
    { label: 'Fitclub Vikas Puri Delhi', value: 'Fitclub Vikas Puri Delhi' },
  ];

  const employeeOptions = [
    { label: 'John Trainer', value: 'John Trainer' },
    { label: 'Sarah Coach', value: 'Sarah Coach' },
    { label: 'Mike Trainer', value: 'Mike Trainer' },
  ];

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Form values:', values);
      console.log('Image file:', imageFile);
      
      // TODO: Implement API call to save walk-in data
      message.success('Walk-in entry saved successfully!');
      navigate(WalkInIncomingRoute);
    } catch (error) {
      console.error('Error saving walk-in:', error);
      message.error('Failed to save walk-in entry');
    }
  };

  const handleCancel = () => {
    navigate(WalkInIncomingRoute);
  };

  return (
    <div className="add-walkin-page">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <h2 style={{ margin: 0 }}>Add Walk-in / Incoming</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home, icon: null },
            { label: "Walk-in / Incoming", to: WalkInIncomingRoute },
            { label: "Add Walk-in" },
          ]}
        />
      </div>
      
      <Card className="form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            {/* Client Name */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Client Name"
                name="clientName"
                rules={[{ required: true, message: 'Please enter client name' }]}
              >
                <Input placeholder="Client Name" size="large" />
              </Form.Item>
            </Col>

            {/* Mobile Number */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Mobile Number"
                name="mobileNo"
                rules={[
                  { required: true, message: 'Please enter mobile number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10 digit mobile number' }
                ]}
              >
                <Input placeholder="Mobile Number" size="large" maxLength={10} />
              </Form.Item>
            </Col>

            {/* Source */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Source"
                name="source"
                rules={[{ required: true, message: 'Please select source' }]}
              >
                <Select placeholder="Select Source" size="large">
                  {sourceOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Enquiry For */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Enquiry For"
                name="enquiryFor"
                rules={[{ required: true, message: 'Please enter enquiry for' }]}
              >
                <Input placeholder="Enquiry For" size="large" />
              </Form.Item>
            </Col>

            {/* Branch */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Branch"
                name="branch"
                rules={[{ required: true, message: 'Please select branch' }]}
              >
                <Select placeholder="Fitclub Golf Course Road" size="large">
                  {branchOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Assisted By */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Assisted By"
                name="assistedBy"
                rules={[{ required: true, message: 'Please select employee' }]}
              >
                <Select placeholder="Select Employee" size="large">
                  {employeeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

       

            {/* Remark */}
            <Col xs={24}>
              <Form.Item
                label="Remark"
                name="remark"
              >
                <TextArea 
                  placeholder="Remark" 
                  rows={4}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row justify="end" gutter={16} className="action-buttons">
            <Col>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                size="large"
                onClick={handleCancel}
              >
                Delete
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddWalkIn;
