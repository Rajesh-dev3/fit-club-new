import React from "react";
import { Form, Input, Select, Button, InputNumber, message } from "antd";
import { HomeOutlined, PercentageOutlined, DollarOutlined } from "@ant-design/icons";
import { useGetBranchesQuery } from "../../services/branches";
import { useAddCouponMutation } from "../../services/coupons";
import { useGetEmployeeQuery } from "../../services/employee";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllCouponsRoute, Home } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

const couponTypeOptions = [
  { label: "Single Use", value: "single_use" },
  { label: "Regular", value: "regular" },
];
const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Absolute", value: "absolute" },
];

const AddCoupon = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery();
  const { data: employeeData, isLoading: employeeLoading } = useGetEmployeeQuery();

  const [addCoupon] = useAddCouponMutation();
  const [couponType, setCouponType] = React.useState();
  const [discountType, setDiscountType] = React.useState();

  const onFinish = async (values) => {
    let payload;
    if (values.couponType === "single_use") {
      payload = {
        value: values.couponValue,
        discountType: values.discountType,
        couponType: values.couponType,
        branchId: values.branch,
        employeeId: values.employeeId,
        remark: values.remark || "",
        code: ""
      };
    } else {
      payload = {
        value: values.couponValue,
        discountType: values.discountType,
        couponType: values.couponType,
        branchId: values.branch,
        remark: values.remark || "",
        code: values.couponCode || ""
      };
    }
    try {
      await addCoupon(payload).unwrap();
      form.resetFields();
      navigate(AllCouponsRoute);
    } catch (error) {
    }
  };

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Coupons", to: AllCouponsRoute },
    { label: "Add Coupon" },
  ];

  return (
    <div className="add-coupon-page">
      <div className="form-header">
        <h2>Add Coupon</h2>
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
          <Form.Item
            name="couponType"
            label="Coupon Type"
            rules={[{ required: true, message: "Please select coupon type" }]}
          >
            <Select
              placeholder="Select coupon type"
              options={couponTypeOptions}
              onChange={setCouponType}
            />
          </Form.Item>
        </div>
        <div className="row">
          <Form.Item
            name="discountType"
            label="Discount Type"
            rules={[{ required: true, message: "Please select discount type" }]}
          >
            <Select 
              placeholder="Select discount type" 
              options={discountTypeOptions}
              onChange={setDiscountType}
            />
          </Form.Item>
            <Form.Item
              name="couponValue"
              label="Coupon Value"
              rules={[{ required: true, message: "Please enter coupon value" }]}
            >
              {discountType === 'percentage' ? (
                <InputNumber 
                  min={0} 
                  max={100}
                  style={{ width: "100%" }} 
                  placeholder="Enter percentage value"
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  prefix={<PercentageOutlined />}
                />
              ) : (
                <InputNumber 
                  min={0} 
                  style={{ width: "100%" }} 
                  placeholder="Enter absolute value"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  prefix={<DollarOutlined />}
                />
              )}
            </Form.Item>
          {couponType === "single_use" ? (
            <Form.Item
              name="employeeId"
              label="Select Employee"
              rules={[{ required: true, message: "Please select employee" }]}
            >
              <Select
                placeholder="Select employee"
                loading={employeeLoading}
                options={
                  employeeData?.data?.map(emp => ({
                    label: emp.user?.name,
                    value: emp._id
                  })) || []
                }
              />
            </Form.Item>
          ) : (
            <Form.Item
            name="couponCode"
            label="Coupon Code"
            rules={[{ required: true, message: "Please enter coupon code" }]}
          >
            <Input placeholder="Enter coupon code" />
          </Form.Item>
          
          )}
          <Form.Item
            name="remark"
            label="Remark"
            // style={{ flex: 1, marginRight: 8 }}
          >
            <Input placeholder="Enter remark" />
          </Form.Item>
        </div>
        <div className="footer-buttons">
          <Button type="primary" htmlType="submit" className="save-btn">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddCoupon;
