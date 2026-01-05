import React, { useMemo, useState } from "react";
import { Form, Input, Select, Button, message, InputNumber } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllPackagesRoute, Home } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../../components/form/ImagePicker";
import { useAddPlanMutation } from "../../services/package";
const AddPackage = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const { data: branchesData } = useGetBranchesQuery();
  const [triggerAddPackage, { isLoading }] = useAddPlanMutation();

  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b._id,
    }));
  }, [branchesData]);

  const packageTypeOptions = [
    { label: 'Membership', value: 'membership' },
    { label: 'Trial', value: 'trial' },
    { label: 'Membership Transfer', value: 'membership_transfer' },
  ];

  const assessmentOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  const handleAddPackage = async (values) => {
    // Membership Transfer के लिए अलग payload
    if (values.packageType === 'membership_transfer') {
      const payload = {
        type: values.packageType,
        name: values.packageName,
        pricing: values.price,
        hsnSac: values.hsnCode,
        branchId: values.branch,
      };
      
      try {
        await triggerAddPackage(payload).unwrap();
        nav(AllPackagesRoute);
      } catch (error) {
        console.error('Failed to add membership transfer package', error);
      }
      return;
    }

    // Regular package का payload
    const payload = {
      name: values.packageName,
      pricing: values.price,
      numberOfDays: values.validDays,
      type: values.packageType,
      hsnSac: values.hsnCode,
      freezable: values.freezable === 'yes',
      ...(values.freezable === 'yes' && {
        freezableDays: values.freezeDays,
        freezableSlot: values.freezeSlot,
      }),
      branchId: values.branch,
      benefits: values.benefitPoints ? values.benefitPoints.map(bp => ({ type: bp.point })) : [],
      photos: values.banner ? [values.banner] : [],
      description: values.description || '',
      preferredGender: values.preferredGender || 'any',
      maxMembers: values.maxMembers || 0,
      upgradeLimit: values.packageType === 'membership' ? values.upgradeLimit : 0,
      renewLimit: values.packageType === 'membership' ? values.advanceRenewDays : 0,
      numberOfAssessment: values.assessment === 'yes' ? values.numberOfAssessments : 0,
      hasAssessments: values.assessment === 'yes',
    };

    try {
      await triggerAddPackage(payload).unwrap();
      nav(AllPackagesRoute);
    } catch (error) {
      console.error('Failed to add package', error);
    }
  };

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Packages", to: AllPackagesRoute },
    { label: "Add Package" },
  ];

  return (
    <div className="add-package-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Add Package</h2>

        <PageBreadcrumb
          items={breadcrumbItems}
        />
      </div>

      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPackage}
          className="trainer-form"
          initialValues={{
            packageType:"membership",
            freezable:"no"
          }}
        >
          {/* Row 1: Package Type + Package Name (for Membership/Trial) */}
          <div className="form-row">
            <Form.Item
              label="Package Type"
              name="packageType"
              rules={[{ required: true, message: 'Please select package type' }]}
            >
              <Select
                placeholder="Select package type"
                options={packageTypeOptions}
              />
            </Form.Item>

            {/* Package Name - Conditional based on Package Type */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.packageType !== currentValues.packageType
              }
            >
              {({ getFieldValue }) => {
                const packageType = getFieldValue('packageType');
                
                // Show Package Name for ALL package types (including membership_transfer)
                if (packageType === 'membership' || packageType === 'trial' || packageType === 'membership_transfer') {
                  return (
                    <Form.Item
                      label="Package Name"
                      name="packageName"
                      rules={[{ required: true, message: 'Please enter package name' }]}
                    >
                      <Input placeholder="Enter package name" />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
          </div>

          {/* Conditional Rendering based on Package Type */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.packageType !== currentValues.packageType
            }
          >
            {({ getFieldValue }) => {
              const packageType = getFieldValue('packageType');
              
              // Membership Transfer Case - Show Only Required Fields
              if (packageType === 'membership_transfer') {
                return (
                  <>
                    {/* Row: Price + HSN Code */}
                    <div className="form-row">
                      <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                      >
                        <InputNumber
                          placeholder="Enter price"
                          min={0}
                          style={{ width: '100%' }}
                          prefix="₹"
                        />
                      </Form.Item>

                      <Form.Item
                        label="HSN/SAC Code"
                        name="hsnCode"
                        rules={[{ required: true, message: 'Please enter HSN/SAC code' }]}
                      >
                        <Input placeholder="Enter HSN/SAC code" />
                      </Form.Item>
                    </div>

                    {/* Single Row: Branch */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Branch"
                        name="branch"
                        rules={[{ required: true, message: 'Please select branch' }]}
                      >
                        <Select
                          placeholder="Select branch"
                          options={branchOptions}
                        />
                      </Form.Item>
                    </div>
                  </>
                );
              }
              
              // Regular Package Case (Membership or Trial)
              if (packageType === 'membership' || packageType === 'trial') {
                return (
                  <>
                    {/* Row 2: Price + Assessment */}
                    <div className="form-row">
                      <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                      >
                        <InputNumber
                          placeholder="Enter price"
                          min={0}
                          style={{ width: '100%' }}
                          prefix="₹"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Assessment"
                        name="assessment"
                        rules={[{ required: true, message: 'Please select assessment' }]}
                      >
                        <Select
                          placeholder="Select assessment"
                          options={assessmentOptions}
                        />
                      </Form.Item>
                    </div>

                    {/* Conditional: Membership-specific fields (only when Package Type is Membership) */}
                    {packageType === 'membership' && (
                      <>
                        {/* Row: Upgrade Limit + Advance Renew Days */}
                        <div className="form-row">
                          <Form.Item
                            label="Upgrade Limit"
                            name="upgradeLimit"
                            rules={[{ required: true, message: 'Please enter upgrade limit' }]}
                          >
                            <InputNumber
                              placeholder="Enter upgrade limit"
                              min={0}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>

                          <Form.Item
                            label="Advance Renew Days"
                            name="advanceRenewDays"
                            rules={[{ required: true, message: 'Please enter advance renew days' }]}
                          >
                            <InputNumber
                              placeholder="Enter advance renew days"
                              min={0}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </div>

                        {/* Freezable Field */}
                        <div className="form-row-single">
                          <Form.Item
                            label="Freezable"
                            name="freezable"
                            rules={[{ required: true, message: 'Please select freezable option' }]}
                            initialValue="no"
                          >
                            <Select
                              placeholder="Select freezable option"
                              options={[
                                { label: 'Yes', value: 'yes' },
                                { label: 'No', value: 'no' },
                              ]}
                            />
                          </Form.Item>
                        </div>

                        {/* Conditional: Freeze Slot + Freeze Days (only when Freezable is Yes) */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => prevValues.freezable !== currentValues.freezable}
                        >
                          {({ getFieldValue: getInnerFieldValue }) =>
                            getInnerFieldValue('freezable') === 'yes' ? (
                              <div className="form-row">
                                <Form.Item
                                  label="Freeze Slot"
                                  name="freezeSlot"
                                  rules={[{ required: true, message: 'Please enter freeze slot' }]}
                                >
                                  <InputNumber
                                    placeholder="Enter freeze slot"
                                    min={1}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>

                                <Form.Item
                                  label="Freeze Days"
                                  name="freezeDays"
                                  rules={[{ required: true, message: 'Please enter freeze days' }]}
                                >
                                  <InputNumber
                                    placeholder="Enter freeze days"
                                    min={1}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </div>
                            ) : null
                          }
                        </Form.Item>
                      </>
                    )}

                    {/* Conditional: Number of Assessments (only when Assessment is Yes) */}
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.assessment !== currentValues.assessment}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('assessment') === 'yes' ? (
                          <div className="form-row-single">
                            <Form.Item
                              label="Number of Assessments"
                              name="numberOfAssessments"
                              rules={[{ required: true, message: 'Please enter number of assessments' }]}
                            >
                              <InputNumber
                                placeholder="Enter number of assessments"
                                min={1}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </div>
                        ) : null
                      }
                    </Form.Item>

                    {/* Number of Valid Days */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Number of Valid Days"
                        name="validDays"
                        rules={[{ required: true, message: 'Please enter number of valid days' }]}
                      >
                        <InputNumber
                          placeholder="Enter number of valid days"
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>

                    {/* Row 3: HSN Code + Branch */}
                    <div className="form-row">
                      <Form.Item
                        label="HSN Code"
                        name="hsnCode"
                        rules={[{ required: true, message: 'Please enter HSN code' }]}
                      >
                        <Input placeholder="Enter HSN code" />
                      </Form.Item>

                      <Form.Item
                        label="Branch"
                        name="branch"
                        rules={[{ required: true, message: 'Please select branch' }]}
                      >
                        <Select
                          placeholder="Select branch"
                          options={branchOptions}
                        />
                      </Form.Item>
                    </div>

                    {/* Single Row: Banner */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Banner"
                        name="banner"
                        rules={[
                          { 
                            validator: (_, value) => {
                              if (!value) {
                                return Promise.reject('Please upload banner image');
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <ImagePicker form={form} name="banner" />
                      </Form.Item>
                    </div>

                    {/* Benefit Points - Multiple */}
                    <div className="certificates-section">
                      <h3 style={{ color: 'var(--sider-text)', marginBottom: 16 }}>Benefit Points</h3>
                      <Form.List name="benefitPoints">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <div key={key} className="certificate-item">
                                <div className="row">
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'point']}
                                    label="Benefit Point"
                                    rules={[{ required: true, message: 'Please enter benefit point' }]}
                                  >
                                    <Input placeholder="Enter benefit point" />
                                  </Form.Item>

                                  <Button
                                    type="link"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(name)}
                                    style={{ marginTop: 30 }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add Benefit Point
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </div>
                  </>
                );
              }
              
              // No Package Type Selected - Show Nothing
              return null;
            }}
          </Form.Item>

          {/* Submit Button - Bottom Right */}
          <div className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              // loading={isLoading}
              className="submit-btn"
            >
              Add Package
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddPackage;