import React from "react";
import { Form, Input, Select, Button, message } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import PageBreadcrumb from "../../components/breadcrumb";
import { useAddBranchMutation } from "../../services/branches";
import { useNavigate } from "react-router-dom";
import { AllBranchesRoute, Home } from "../../routes/routepath";
import "./styles.scss";

const { Option } = Select;

const AddBranch = () => {
  const [form] = Form.useForm();
  const [addBranch, { isLoading: adding }] = useAddBranchMutation();
  const navigate = useNavigate();

  const handleAddBranch = async (values) => {
    const payload = {
      name: values.branchName,
      phoneNumber: values.branchPhone,
      address: values.registerAddress,
      branchArea: values.branchArea,
      companyName: values.companyName,
      companyEmail: values.companyEmail,
      incorporationNumber: values.incorporationNumber,
      stateName: values.placeOfSupply,
      gstNumber: values.gstNumber,
      companyAddress: values.companyAddress,
      ownedBy: values.ownedBy,
        gstCertificate: Array.isArray(values.gstCertificate) && values.gstCertificate.length > 0 ? (values.gstCertificate[0].url || values.gstCertificate[0].response?.url || '') : (typeof values.gstCertificate === 'string' ? values.gstCertificate : ''),
        incorporationCertificate: Array.isArray(values.incorporationCertification) && values.incorporationCertification.length > 0 ? (values.incorporationCertification[0].url || values.incorporationCertification[0].response?.url || '') : (typeof values.incorporationCertification === 'string' ? values.incorporationCertification : ''),
      invoicePrefix: values.invoicePrefix,
      creditNoteInvoicePrefix: values.creditNotePrefix,
      invoiceMidfix: values.invoiceMidfix,
      invoiceNumber: values.invoiceNumber,
      creditNoteInvoiceNumber: values.creditNoteInvoiceNumber,
      placeOfSupply: values.placeOfSupply,
      branchPrefix: values.branchPrefix,
    };
    try {
      await addBranch(payload).unwrap();
      form.resetFields();
      navigate(AllBranchesRoute);
    } catch (err) {
    }
  };

  const validatePhoneNumber = (_, value) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers starting with 6-9
    if (!value) return Promise.reject(new Error('Please enter branch phone number'));
    if (!phoneRegex.test(value)) return Promise.reject(new Error('Please enter a valid 10-digit phone number'));
    return Promise.resolve();
  };

  const validateGSTNumber = (_, value) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!value) return Promise.reject(new Error('Please enter GST number'));
    if (!gstRegex.test(value)) return Promise.reject(new Error('Please enter a valid GST number'));
    return Promise.resolve();
  };

  const validateEmail = (_, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return Promise.reject(new Error('Please enter company email'));
    if (!emailRegex.test(value)) return Promise.reject(new Error('Please enter a valid email address'));
    return Promise.resolve();
  };

  const validateNumeric = (_, value) => {
    if (!value) return Promise.resolve();
    if (!/^\d+$/.test(value)) return Promise.reject(new Error('Please enter numbers only'));
    return Promise.resolve();
  };

  const validateAlphanumeric = (_, value) => {
    if (!value) return Promise.resolve();
    if (!/^[A-Za-z0-9]+$/.test(value)) return Promise.reject(new Error('Only alphanumeric characters allowed'));
    return Promise.resolve();
  };

  const validateInvoiceMidfix = (_, value) => {
    if (!value) return Promise.resolve();
    if (!/^\d{2}$/.test(value)) return Promise.reject(new Error('Must be exactly 2 digits'));
    return Promise.resolve();
  };

  return (
    <div className="add-branch-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Add Branch</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'BRANCH MANAGEMENT', to: AllBranchesRoute },
            { label: 'Add Branch' }
          ]}
        />
      </div>
      <Form form={form} layout="vertical" className="add-branch-form" onFinish={handleAddBranch}>
        <div className="row">
          <Form.Item 
            label="Owned By" 
            name="ownedBy" 
            rules={[{ required: true, message: 'Please select owned by' }]}
          >
            <Select placeholder="Select owned by">
              <Option value="company">Company</Option>
              <Option value="franchise">Franchise</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Branch Name" 
            name="branchName" 
            rules={[
              { required: true, message: 'Please enter branch name' },
              { min: 3, message: 'Branch name must be at least 3 characters' },
              { max: 100, message: 'Branch name cannot exceed 100 characters' }
            ]}
          >
            <Input placeholder="Branch Name" maxLength={100} />
          </Form.Item>
          
          <Form.Item 
            label="Branch Phone Number" 
            name="branchPhone" 
            rules={[
              { validator: validatePhoneNumber }
            ]}
          >
            <Input placeholder="Branch Phone Number" maxLength={10} />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Branch Area" 
            name="branchArea" 
            rules={[
              { required: true, message: 'Please enter branch area' },
              { min: 3, message: 'Branch area must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Branch Area" />
          </Form.Item>
          
          <Form.Item 
            label="Branch Prefix" 
            name="branchPrefix" 
            rules={[
              { required: true, message: 'Please enter branch prefix' },
              { validator: validateAlphanumeric },
              { max: 10, message: 'Branch prefix cannot exceed 10 characters' }
            ]}
          >
            <Input placeholder="Branch Prefix" maxLength={10} />
          </Form.Item>
          
          <Form.Item 
            label="Invoice Prefix" 
            name="invoicePrefix" 
            rules={[
              { required: true, message: 'Please enter invoice prefix' },
              { validator: validateAlphanumeric },
              { max: 10, message: 'Invoice prefix cannot exceed 10 characters' }
            ]}
          >
            <Input placeholder="Invoice Prefix" maxLength={10} />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Credit Note Prefix" 
            name="creditNotePrefix" 
            rules={[
              { required: true, message: 'Please enter credit note prefix' },
              { validator: validateAlphanumeric },
              { max: 10, message: 'Credit note prefix cannot exceed 10 characters' }
            ]}
          >
            <Input placeholder="Credit Note Prefix" maxLength={10} />
          </Form.Item>
          
          <Form.Item 
            label="Invoice Midfix" 
            name="invoiceMidfix" 
            rules={[
              { required: true, message: 'Please enter invoice midfix' },
              { validator: validateInvoiceMidfix }
            ]}
          >
            <Input placeholder="Invoice Midfix" maxLength={2} />
          </Form.Item>
          
          <Form.Item 
            label="Invoice Number" 
            name="invoiceNumber" 
            rules={[
              { required: true, message: 'Please enter invoice number' },
              { validator: validateNumeric },
              { min: 1, message: 'Invoice number must be at least 1 digit' },
              { max: 6, message: 'Invoice number cannot exceed 6 digits' }
            ]}
          >
            <Input placeholder="Invoice Number" maxLength={6} />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Credit Note Invoice Number" 
            name="creditNoteInvoiceNumber" 
            rules={[
              { required: true, message: 'Please enter credit note invoice number' },
              { validator: validateNumeric },
              { min: 1, message: 'Credit note invoice number must be at least 1 digit' },
              { max: 6, message: 'Credit note invoice number cannot exceed 6 digits' }
            ]}
          >
            <Input placeholder="Credit Note Invoice Number" maxLength={6} />
          </Form.Item>
          
          <Form.Item 
            label="Place of Supply / State Name" 
            name="placeOfSupply" 
            rules={[
              { required: true, message: 'Please enter place of supply' },
              { min: 2, message: 'State name must be at least 2 characters' }
            ]}
          >
            <Input placeholder="Place of Supply / State Name" />
          </Form.Item>
          
          <Form.Item 
            label="Company Name" 
            name="companyName" 
            rules={[
              { required: true, message: 'Please enter company name' },
              { min: 3, message: 'Company name must be at least 3 characters' },
              { max: 150, message: 'Company name cannot exceed 150 characters' }
            ]}
          >
            <Input placeholder="Company Name" maxLength={150} />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Company Email" 
            name="companyEmail" 
            rules={[
              { validator: validateEmail }
            ]}
          >
            <Input placeholder="Company Email" type="email" />
          </Form.Item>
          
          <Form.Item 
            label="Incorporation Number" 
            name="incorporationNumber" 
            rules={[
              { required: true, message: 'Please enter incorporation number' },
              { pattern: /^[A-Za-z0-9]+$/, message: 'Only alphanumeric characters allowed' },
              { max: 30, message: 'Incorporation number cannot exceed 30 characters' }
            ]}
          >
            <Input placeholder="Incorporation Number" maxLength={30} />
          </Form.Item>
          
          <Form.Item 
            label="Incorporation Certificate" 
            name="incorporationCertification" 
            valuePropName="fileList" 
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList} 
            extra="Upload incorporation certificate (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload incorporation certificate' }]}
          >
            <ImagePicker form={form} name="incorporationCertification" />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="GST Number" 
            name="gstNumber" 
            rules={[
              { validator: validateGSTNumber }
            ]}
          >
            <Input placeholder="GST Number" />
          </Form.Item>
          
          <Form.Item 
            label="GST Certificate" 
            name="gstCertificate" 
            valuePropName="fileList" 
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList} 
            extra="Upload GST certificate (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload GST certificate' }]}
          >
            <ImagePicker form={form} name="gstCertificate" />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            className="full-width-item" 
            label="Register Address" 
            name="registerAddress" 
            rules={[
              { required: true, message: 'Please enter register address' },
              { min: 10, message: 'Address must be at least 10 characters' },
              { max: 500, message: 'Address cannot exceed 500 characters' }
            ]}
          >
            <Input.TextArea 
              placeholder="Register Address" 
              autoSize={{ minRows: 2, maxRows: 4 }} 
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item 
            className="full-width-item" 
            label="Company Address" 
            name="companyAddress" 
            rules={[
              { required: true, message: 'Please enter company address' },
              { min: 10, message: 'Address must be at least 10 characters' },
              { max: 500, message: 'Address cannot exceed 500 characters' }
            ]}
          >
            <Input.TextArea 
              placeholder="Company Address" 
              autoSize={{ minRows: 2, maxRows: 4 }} 
              maxLength={500}
              showCount
            />
          </Form.Item>
        </div>
        
        <div className="footer-buttons">
          <Button 
            className="save-btn" 
            type="primary" 
            htmlType="submit" 
            loading={adding}
            disabled={adding}
          >
            Add Branch
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddBranch;