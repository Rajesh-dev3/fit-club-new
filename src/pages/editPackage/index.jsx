import React, { useMemo, useState, useEffect } from "react";
import { Form, Input, Select, Button, InputNumber, Checkbox, Row, Col, Space, Spin, message } from "antd";
import { HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllPackagesRoute, Home } from "../../routes/routepath";
import { useNavigate, useParams } from "react-router-dom";
import ImagePicker from "../../components/form/ImagePicker";
import { useGetPlanDetailQuery, useUpdatePlanMutation } from "../../services/package";
import { useGetInventoryQuery, useGetGymKitInventoryQuery } from "../../services/inventory";
import { useGetBranchResourcesQuery } from "../../services/biometric";

const EditPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: branchesData } = useGetBranchesQuery();
  const { data: packageData, isLoading: isLoadingPackage, error: packageError } = useGetPlanDetailQuery(id);
  const [updatePackage, { isLoading: updating }] = useUpdatePlanMutation();
  const [gymKitSelected, setGymKitSelected] = useState('no');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState({});
  
  const selectedBranches = Form.useWatch('branch', form);
  
  const { data: inventoryData } = useGetGymKitInventoryQuery(
    selectedBranches && selectedBranches.length > 0 ? selectedBranches : undefined, {
    skip: gymKitSelected !== 'yes' || !selectedBranches || selectedBranches.length === 0
  });

  const { data: biometricData } = useGetBranchResourcesQuery(
    selectedBranches && selectedBranches.length > 0 ? selectedBranches : undefined, {
    skip: !selectedBranches || selectedBranches.length === 0
  });

  useEffect(() => {
    if (!selectedBranches || selectedBranches.length === 0) {
      form.setFieldsValue({
        selectedInventory: undefined,
        biometricMachine: undefined
      });
    }
  }, [selectedBranches, form]);

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
    { label: 'Add On Package', value: 'add_on_package' },
  ];

  const gymKitOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  const assessmentOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  const inventoryOptions = useMemo(() => {
    if (!selectedBranches || selectedBranches.length === 0) return [];
    if (!inventoryData?.success || !Array.isArray(inventoryData.data)) return [];
    
    const allInventory = [];
    inventoryData.data.forEach((branchData) => {
      if (branchData.inventory && Array.isArray(branchData.inventory)) {
        branchData.inventory.forEach((item) => {
          allInventory.push({
            label: `${item.productName} - ${branchData.branchInfo.name} (Qty: ${item.quantity}) - ${item.warehouseName}`,
            value: item._id,
            disabled: item.quantity === 0
          });
        });
      }
    });
    return allInventory;
  }, [inventoryData, selectedBranches]);

  const biometricMachineOptions = useMemo(() => {
    if (!selectedBranches || selectedBranches.length === 0) return [];
    if (!biometricData?.success || !Array.isArray(biometricData.data?.machines)) return [];
    
    const allMachines = [];
    biometricData.data.machines.forEach((branchData) => {
      if (branchData.machines && Array.isArray(branchData.machines)) {
        branchData.machines.forEach((machine) => {
          allMachines.push({
            label: `${machine.machineId} - ${branchData.branchInfo.name} (${machine.floor || 'N/A'})`,
            value: machine._id,
            disabled: machine.deleted_at !== null
          });
        });
      }
    });
    return allMachines;
  }, [biometricData, selectedBranches]);

  // Populate form with package data
  useEffect(() => {
    if (packageData && packageData.data) {
      const pkg = packageData.data;
      
      setGymKitSelected(pkg.gymKitAvailable ? 'yes' : 'no');
      
      // Prepare inventory selection object
      const inventorySelection = {};
      if (pkg.products && Array.isArray(pkg.products)) {
        pkg.products.forEach(product => {
          const productId = product.productId?._id || product.productId;
          inventorySelection[productId] = {
            selected: true,
            quantity: product.quantity || 1
          };
        });
      }
      
      // Extract branch IDs
      const branchIds = pkg.branchIds?.map(b => b._id || b) || [];
      
      form.setFieldsValue({
        packageType: pkg.type,
        packageName: pkg.name,
        price: pkg.pricing,
        validDays: pkg.numberOfDays,
        hsnCode: pkg.hsn_sac,
        freezable: pkg.freezable ? 'yes' : 'no',
        freezeDays: pkg.freezableDays || 0,
        freezeSlot: pkg.freezableSlot || 0,
        branch: branchIds,
        benefitPoints: pkg.benefits?.map(b => ({ point: b.type })) || [],
        banner: pkg.photos?.[0] || '',
        preferredGender: pkg.preferredGender || 'any',
        upgradeLimit: pkg.upgradeLimit,
        advanceRenewDays: pkg.advanceRenewDays || pkg.renewLimit || 0,
        assessment: pkg.hasAssessments ? 'yes' : 'no',
        numberOfAssessments: pkg.numberOfAssessment || 0,
        gymKit: pkg.gymKitAvailable ? 'yes' : 'no',
        selectedInventory: inventorySelection,
        selectedBiometric: pkg.machineIds?.map(m => m._id || m) || [],
      });
    }
  }, [packageData, form]);

  const InventorySelectionWithQuantity = ({ value, onChange }) => {
    const [localSelection, setLocalSelection] = useState(value || {});

    useEffect(() => {
      if (value) {
        setLocalSelection(value);
      }
    }, [value]);

    const handleItemCheck = (itemId, checked) => {
      const newSelection = { ...localSelection };
      
      if (checked) {
        newSelection[itemId] = { selected: true, quantity: 1 };
      } else {
        delete newSelection[itemId];
      }
      
      setLocalSelection(newSelection);
      onChange?.(newSelection);
    };

    const handleQuantityChange = (itemId, quantity) => {
      if (localSelection[itemId]) {
        const validQuantity = Math.max(quantity || 1, 1);
        
        const newSelection = {
          ...localSelection,
          [itemId]: { ...localSelection[itemId], quantity: validQuantity }
        };
        
        setLocalSelection(newSelection);
        onChange?.(newSelection);
      }
    };

    return (
      <div 
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
        }}
      >
        {inventoryOptions.map((option) => {
          const isSelected = localSelection[option.value]?.selected || false;
          const quantity = localSelection[option.value]?.quantity || 1;
          
          return (
            <Row key={option.value} align="middle" style={{ marginBottom: '12px' }}>
              <Col span={16}>
                <Checkbox
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={(e) => handleItemCheck(option.value, e.target.checked)}
                >
                  {option.label}
                </Checkbox>
              </Col>
              {isSelected && (
                <Col span={8}>
                  <Space>
                    <span style={{ fontSize: '14px', color: '#666' }}>Qty:</span>
                    <InputNumber
                      min={1}
                      value={quantity}
                      onChange={(val) => handleQuantityChange(option.value, val || 1)}
                      size="small"
                      style={{ width: '80px', height: '30px' }}
                    />
                  </Space>
                </Col>
              )}
            </Row>
          );
        })}
        {inventoryOptions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            No inventory items available for selected branch
          </div>
        )}
      </div>
    );
  };

  const handleUpdatePackage = async (values) => {
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
      branchIds: Array.isArray(values.branch) ? values.branch : [values.branch],
      benefits: values.benefitPoints ? values.benefitPoints.map(bp => ({ type: bp.point })) : [],
      photos: values.banner ? [values.banner] : [],
      description: values.description || '',
      preferredGender: values.preferredGender || 'any',
      maxMembers: values.maxMembers || 0,
      upgradeLimit: values.upgradeLimit || 0,
      advanceRenewDays: values.advanceRenewDays || 0,
      numberOfAssessment: values.assessment === 'yes' ? values.numberOfAssessments : 0,
      hasAssessments: values.assessment === 'yes',
      gymKitAvailable: values.gymKit === 'yes',
      products: values.gymKit === 'yes' && values.selectedInventory 
        ? Object.entries(values.selectedInventory).map(([productId, data]) => ({
            productId,
            quantity: data.quantity
          }))
        : [],
      biometricMachines: values.selectedBiometric || [],
      machineIds: values.selectedBiometric || [],
    };

    if (values.packageType === 'add_on_package') {
      payload.addonPackageName = values.addonPackageName;
      payload.addonPackagePrice = values.addonPackagePrice;
      payload.numberOfSession = values.numberOfSession;
    }

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null) delete payload[k];
    });

    try {
      await updatePackage({ id, body: payload }).unwrap();
      // message.success('Package updated successfully');
      navigate(AllPackagesRoute);
    } catch (error) {
      console.error('Failed to update package', error);
      // message.error('Failed to update package');
    }
  };

  if (isLoadingPackage) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading package data...</p>
      </div>
    );
  }

  if (packageError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading package data. Please try again.</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: "All Packages", to: AllPackagesRoute },
    { label: "Edit Package" },
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
        <h2 style={{ margin: 0 }}>Edit Package</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePackage}
          className="trainer-form"
        >
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

            <Form.Item
              label="Package Name"
              name="packageName"
              rules={[{ required: true, message: 'Please enter package name' }]}
            >
              <Input placeholder="Enter package name" />
            </Form.Item>
          </div>

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
              label="Valid Days"
              name="validDays"
              rules={[{ required: true, message: 'Please enter valid days' }]}
            >
              <InputNumber
                placeholder="Enter valid days"
                min={1}
                style={{ width: '100%' }}
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

          <div className="form-row-single">
            <Form.Item
              label="Branch"
              name="branch"
              rules={[{ required: true, message: 'Please select at least one branch' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select branches"
                options={branchOptions}
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Freezable"
              name="freezable"
            >
              <Select
                placeholder="Select freezable option"
                options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
              />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.freezable !== cur.freezable}>
              {({ getFieldValue }) => {
                if (getFieldValue('freezable') === 'yes') {
                  return (
                    <>
                      <Form.Item label="Freeze Days" name="freezeDays">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="Freeze Slot" name="freezeSlot">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </>
                  );
                }
                return null;
              }}
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Upgrade Limit"
              name="upgradeLimit"
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
            >
              <InputNumber
                placeholder="Enter advance renew days"
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <div className="form-row-single">
            <Form.Item label="Gym Kit" name="gymKit">
              <Select
                placeholder="Select gym kit option"
                options={gymKitOptions}
                onChange={(value) => {
                  setGymKitSelected(value);
                  if (value === 'no') {
                    form.setFieldsValue({ selectedInventory: {} });
                  }
                }}
              />
            </Form.Item>
          </div>

          {gymKitSelected === 'yes' && (
            <div className="form-row-single">
              <Form.Item
                label="Select Inventory Items with Quantities"
                name="selectedInventory"
              >
                <InventorySelectionWithQuantity />
              </Form.Item>
            </div>
          )}

          <div className="form-row-single">
            <Form.Item
              label="Select Biometric Machines"
              name="selectedBiometric"
            >
              <Checkbox.Group>
                <Row>
                  {biometricMachineOptions.map((option) => (
                    <Col span={24} key={option.value} style={{ marginBottom: 8 }}>
                      <Checkbox value={option.value} disabled={option.disabled}>
                        {option.label}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>

          <div className="form-row-single">
            <Form.Item label="Banner" name="banner">
              <ImagePicker form={form} name="banner" />
            </Form.Item>
          </div>

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

          <div className="form-actions">
            <Button 
              onClick={() => navigate(AllPackagesRoute)} 
              className="cancel-btn"
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              className="submit-btn"
              size="large"
            >
              Update Package
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default EditPackage;
