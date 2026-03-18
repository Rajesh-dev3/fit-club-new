
import  { useState } from "react";
import { Button, Form, Input, Select, InputNumber, message } from "antd";
import {  HomeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetBranchesQuery } from "../../services/branches";
import { useAddPlanMutation } from "../../services/package";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllAddOnPackagesRoute, Home } from "../../routes/routepath";
import "./styles.scss";
import ImagePicker from "../../components/form/ImagePicker";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const typeOptions = [
  { label: "Personal Training", value: "Personal Training" },
  { label: "Pilates", value: "Pilates" },
  { label: "Therapy", value: "Therapy" },
  { label: "EMS", value: "EMS" },
  { label: "Paid Locker", value: "Paid Locker" },
  { label: "MMA", value: "MMA" },
];

const AddAddOnPackage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [selectedPackageType, setSelectedPackageType] = useState("");
  const [benefitPoints, setBenefitPoints] = useState([{ id: 1, value: "" }]);
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery();
  const [addPlan, { isLoading: isSubmitting }] = useAddPlanMutation();

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  const handlePackageTypeChange = (value) => {
    setSelectedPackageType(value);
    // Reset sessions field when package type changes
    if (value === "Paid Locker") {
      form.setFieldsValue({ sessions: undefined });
    }
  };

  const addBenefitPoint = () => {
    const newId = Math.max(...benefitPoints.map(p => p.id), 0) + 1;
    setBenefitPoints([...benefitPoints, { id: newId, value: "" }]);
  };

  const removeBenefitPoint = (id) => {
    if (benefitPoints.length > 1) {
      setBenefitPoints(benefitPoints.filter(point => point.id !== id));
    }
  };

  const onFinish = async (values) => {
    try {
      // Collect benefit points from form values
      const benefits = benefitPoints
        .map(point => {
          const value = values[`benefitPoint_${point.id}`];
          return value ? { type: value } : null;
        })
        .filter(Boolean);

      // Map addonType based on packageType
      const addonTypeMap = {
        "Personal Training": "personal_training",
        "Pilates": "pilates",
        "Therapy": "therapy",
        "EMS": "ems",
        "Paid Locker": "paid_locker",
        "MMA": "mma"
      };

      const payload = {
        name: values.name,
        pricing: values.price,
        numberOfDays: values.numberOfValidDate,
        type: "addon",
        addonType: addonTypeMap[values.packageType] || "personal_training",
        branchIds: [values.branch],
        
        hsnSac: values.hsnSacCode || "",
        description: values.benefitHeadline || "",

        slots: values.sessions || 0,
        upgradeLimit: values.upgradeLimit || 0,
        advanceRenewDays: values.advanceRenewDays || 0,

        benefits: benefits,

        photos: values.photo ? [values.photo] : [],
      };

      console.log('Add On Package Payload:', payload);

      const response = await addPlan(payload).unwrap();
      // message.success('Add-On Package created successfully!');
      form.resetFields();
      setBenefitPoints([{ id: 1, value: "" }]);
      navigate(AllAddOnPackagesRoute);
    } catch (error) {
      // message.error(error?.data?.message || 'Failed to create add-on package');
      console.error('Error:', error);
    }
  };
 const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Add On Packages", to: AllAddOnPackagesRoute },
    { label: "Add On's Package" },
  ];
  return (
    <div className="add-add-on-package-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Add On's Package</h2>

        <PageBreadcrumb items={breadcrumbItems} />
      </div>
 
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="custom-form"
      >
        <div className="row">
          <Form.Item
            name="packageType"
            label="Package Type"
            rules={[{ required: true, message: "Please select package type" }]}
          >
            <Select 
              placeholder="Select package type" 
              options={typeOptions}
              onChange={handlePackageTypeChange}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: "Please enter package name" }]}
          >
            <Input placeholder="Enter package name" />
          </Form.Item>
        </div>
        <div className="row">
           <Form.Item 
            label="Photo" 
            name="photo" 
            valuePropName="fileList" 
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList} 
            extra="Upload photo (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload photo' }]}
          >
            <ImagePicker form={form} name="photo" />
          </Form.Item>
          <Form.Item
            name="branch"
            label="Branch"
            rules={[{ required: true, message: "Please select branch" }]}
          >
            <Select
              placeholder="Select branch"
              loading={branchesLoading}
              options={
                branchesData?.data?.map(branch => ({
                  label: branch.name,
                  value: branch._id
                })) || []
              }
            />
          </Form.Item>
        </div>
        <div className="row">
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter price" />
          </Form.Item>
          <Form.Item
            name="numberOfValidDate"
            label="Number of Valid Days"
            rules={[{ required: true, message: "Please enter number of valid days" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter number of valid days" />
          </Form.Item>
        </div>
        <div className="row">
          <Form.Item
            name="upgradeLimit"
            label="Upgrade Limit"
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter upgrade limit" />
          </Form.Item>
          <Form.Item
            name="advanceRenewDays"
            label="Advance Renew Days"
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter advance renew days" />
          </Form.Item>
        </div>
        <div className="row">
          <Form.Item
            name="hsnSacCode"
            label="HSN/SAC Code"
          >
            <Input placeholder="Enter HSN/SAC code" />
          </Form.Item>
          <Form.Item
            name="benefitHeadline"
            label="Benefit Headline"
          >
            <Input placeholder="Enter benefit headline" />
          </Form.Item>
        </div>
        {selectedPackageType !== "Paid Locker" && (
          <div className="row">
            <Form.Item
              name="sessions"
              label="Sessions"
              rules={[{ required: true, message: "Please enter number of sessions" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter number of sessions" />
            </Form.Item>
          </div>
        )}

        {/* Benefit Points Section */}
        <div className="benefit-points-section">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Benefit Points</h3>
          {benefitPoints.map((point, index) => (
            <div key={point.id} className="row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
              <Form.Item
                name={`benefitPoint_${point.id}`}
                label={index === 0 ? "Point" : ""}
                rules={[{ required: true, message: "Point is required" }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="Enter benefit point" />
              </Form.Item>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                {index === benefitPoints.length - 1 && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addBenefitPoint}
                  >
                    Add
                  </Button>
                )}
                {benefitPoints.length > 1 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeBenefitPoint(point.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-buttons">
          <Button 
            type="primary" 
            htmlType="submit" 
            className="save-btn"
            loading={isSubmitting}
          >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddAddOnPackage;
