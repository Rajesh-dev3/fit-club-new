import React, { useMemo, useState } from "react";
import { Form, Input, Select, Button, InputNumber, Checkbox, Row, Col, Space } from "antd";
import { HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllPackagesRoute, Home } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../../components/form/ImagePicker";
import { useAddPlanMutation } from "../../services/package";
import { useGetInventoryQuery, useGetGymKitInventoryQuery } from "../../services/inventory";
import { useGetBranchResourcesQuery } from "../../services/biometric";

const AddPackage = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const { data: branchesData } = useGetBranchesQuery();
  const [triggerAddPackage, { isLoading }] = useAddPlanMutation();
  const [gymKitSelected, setGymKitSelected] = useState('no');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState({});
  
  // Watch for branch changes
  const selectedBranches = Form.useWatch('branch', form);
  
  const { data: inventoryData } = useGetGymKitInventoryQuery(
    selectedBranches && selectedBranches.length > 0 ? selectedBranches : undefined, {
    skip: gymKitSelected !== 'yes' || !selectedBranches || selectedBranches.length === 0
  });

  const { data: biometricData } = useGetBranchResourcesQuery(
    selectedBranches && selectedBranches.length > 0 ? selectedBranches : undefined, {
    skip: !selectedBranches || selectedBranches.length === 0
  });

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
  }, [inventoryData]);

  const biometricMachineOptions = useMemo(() => {
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
  }, [biometricData]);

  // Custom component for inventory selection with quantities
  const InventorySelectionWithQuantity = ({ value, onChange }) => {
    const [localSelection, setLocalSelection] = useState(value || {});
    const [quantityErrors, setQuantityErrors] = useState({});

    const handleItemCheck = (itemId, checked) => {
      const newSelection = { ...localSelection };
      const newErrors = { ...quantityErrors };
      
      if (checked) {
        newSelection[itemId] = { selected: true, quantity: 1 };
      } else {
        delete newSelection[itemId];
        delete newErrors[itemId]; // Clear error when unchecking
      }
      
      setLocalSelection(newSelection);
      setQuantityErrors(newErrors);
      onChange?.(newSelection);
    };

    const handleQuantityChange = (itemId, quantity) => {
      if (localSelection[itemId]) {
        // Get the max available quantity for this item
        const maxQuantity = inventoryData?.data?.find(item => item._id === itemId)?.quantity || 1;
        
        const newErrors = { ...quantityErrors };
        
        // Check if user tried to enter more than available
        if (quantity > maxQuantity) {
          newErrors[itemId] = `Maximum ${maxQuantity} available`;
        } else {
          delete newErrors[itemId];
        }
        
        // Ensure quantity doesn't exceed available stock
        const validQuantity = Math.min(Math.max(quantity || 1, 1), maxQuantity);
        
        const newSelection = {
          ...localSelection,
          [itemId]: { ...localSelection[itemId], quantity: validQuantity }
        };
        
        setLocalSelection(newSelection);
        setQuantityErrors(newErrors);
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
          // backgroundColor: '#fafafa'
        }}
      >
        {inventoryOptions.map((option) => {
          const isSelected = localSelection[option.value]?.selected || false;
          const quantity = localSelection[option.value]?.quantity || 1;
          const hasError = quantityErrors[option.value];
          
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
                      style={{ 
                        width: '80px', 
                        height: '30px',
                        borderColor: hasError ? '#ff4d4f' : undefined
                      }}
                      status={hasError ? 'error' : undefined}
                    />
                    {hasError && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#ff4d4f',
                        whiteSpace: 'nowrap'
                      }}>
                        {hasError}
                      </span>
                    )}
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

  const handleAddPackage = async (values) => {
    // Membership Transfer के लिए अलग payload
    if (values.packageType === 'membership_transfer') {
      const payload = {
        type: values.packageType,
        name: values.packageName,
        pricing: values.price,
        hsnSac: values.hsnCode,
        branchIds: Array.isArray(values.branch) ? values.branch : [values.branch],
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
      
      try {
        await triggerAddPackage(payload).unwrap();
        nav(AllPackagesRoute);
      } catch (error) {
        console.error('Failed to add membership transfer package', error);
      }
      return;
    }

    // Add On Package के लिए अलग payload with additional fields
    if (values.packageType === 'add_on_package') {
      const payload = {
        name: values.packageName,
        pricing: values.price,
        numberOfDays: values.validDays,
        type: values.packageType,
        addonPackageName: values.addonPackageName,
        addonPackagePrice: values.addonPackagePrice,
        numberOfSession: values.numberOfSession,
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
        renewLimit: values.advanceRenewDays || 0,
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

      try {
        await triggerAddPackage(payload).unwrap();
        nav(AllPackagesRoute);
      } catch (error) {
        console.error('Failed to add add-on package', error);
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
      branchIds: Array.isArray(values.branch) ? values.branch : [values.branch],
      benefits: values.benefitPoints ? values.benefitPoints.map(bp => ({ type: bp.point })) : [],
      photos: values.banner ? [values.banner] : [],
      description: values.description || '',
      preferredGender: values.preferredGender || 'any',
      maxMembers: values.maxMembers || 0,
      upgradeLimit: values.packageType === 'membership' ? values.upgradeLimit : 0,
      renewLimit: values.packageType === 'membership' ? values.advanceRenewDays : 0,
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
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPackage}
          className="trainer-form"
          initialValues={{
            packageType: "membership",
            freezable: "no"
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
                
                // Show Package Name for ALL package types (including add_on_package)
                if (packageType === 'membership' || packageType === 'trial' || packageType === 'membership_transfer' || packageType === 'add_on_package') {
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
                        rules={[{ required: true, message: 'Please select at least one branch' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select branches"
                          options={branchOptions}
                          onChange={(branchValues) => {
                            // Clear gym kit selections when branch changes
                            form.setFieldsValue({
                              selectedInventory: []
                            });
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Gym Kit Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Gym Kit"
                        name="gymKit"
                        rules={[{ required: true, message: 'Please select gym kit option' }]}
                      >
                        <Select
                          placeholder="Select gym kit option"
                          options={gymKitOptions}
                          onChange={(value) => {
                            setGymKitSelected(value);
                            if (value === 'no') {
                              form.setFieldsValue({ selectedInventory: [] });
                            }
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Inventory Selection - Show only when gym kit is Yes */}
                    {gymKitSelected === 'yes' && (
                      <div className="form-row-single">
                        <Form.Item
                          label="Select Inventory Items with Quantities"
                          name="selectedInventory"
                          rules={[{ required: gymKitSelected === 'yes', message: 'Please select inventory items' }]}
                        >
                          <InventorySelectionWithQuantity />
                        </Form.Item>
                      </div>
                    )}

                    {/* Biometric Machine Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Select Biometric Machines"
                        name="selectedBiometric"
                      >
                        <Checkbox.Group>
                          <Row>
                            {biometricMachineOptions.map((option) => (
                              <Col span={24} key={option.value} style={{ marginBottom: 8 }}>
                                <Checkbox 
                                  value={option.value} 
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </Checkbox>
                              </Col>
                            ))}
                            {biometricMachineOptions.length === 0 && (
                              <Col span={24}>
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                  No biometric machines available for selected branches
                                </div>
                              </Col>
                            )}
                          </Row>
                        </Checkbox.Group>
                      </Form.Item>
                    </div>
                  </>
                );
              }
              
              // Add On Package Case
              if (packageType === 'add_on_package') {
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

                    {/* Row: Max Members + Preferred Gender */}
                    <div className="form-row">
                      <Form.Item
                        label="Max Members"
                        name="maxMembers"
                        rules={[{ required: true, message: 'Please enter max members' }]}
                      >
                        <InputNumber
                          placeholder="Enter max members"
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Preferred Gender"
                        name="preferredGender"
                        rules={[{ required: true, message: 'Please select preferred gender' }]}
                      >
                        <Select
                          placeholder="Select preferred gender"
                          options={[
                            { label: 'Male', value: 'male' },
                            { label: 'Female', value: 'female' },
                            { label: 'Any', value: 'any' }
                          ]}
                        />
                      </Form.Item>
                    </div>

                    {/* Row 4: Number of Valid Days + Freezable */}
                    <div className="form-row">
                      <Form.Item
                        label="Number of valid days"
                        name="validDays"
                        rules={[{ required: true, message: 'Please enter number of valid days' }]}
                      >
                        <InputNumber
                          placeholder="Enter number of valid days"
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Freezable"
                        name="freezable"
                        rules={[{ required: true, message: 'Please select freezable option' }]}
                      >
                        <Select
                          placeholder="Select freezable option"
                          options={[
                            { label: 'Yes', value: 'yes' },
                            { label: 'No', value: 'no' }
                          ]}
                        />
                      </Form.Item>
                    </div>

                    {/* Conditional Freeze Fields */}
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.freezable !== currentValues.freezable}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('freezable') === 'yes' ? (
                          <div className="form-row">
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
                          </div>
                        ) : null
                      }
                    </Form.Item>

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
                           className="multiple-branch"
                        rules={[{ required: true, message: 'Please select at least one branch' }]}
                      >
                        <Select
                        style={{height:"auto"}}
                     
                          mode="multiple"
                          placeholder="Select branches"
                          options={branchOptions}
                          onChange={(branchValues) => {
                            // Clear gym kit selections when branch changes
                            form.setFieldsValue({
                              selectedInventory: []
                            });
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Gym Kit Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Gym Kit"
                        name="gymKit"
                        rules={[{ required: true, message: 'Please select gym kit option' }]}
                      >
                        <Select
                          placeholder="Select gym kit option"
                          options={gymKitOptions}
                          onChange={(value) => {
                            setGymKitSelected(value);
                            if (value === 'no') {
                              form.setFieldsValue({ selectedInventory: [] });
                            }
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Inventory Selection - Show only when gym kit is Yes */}
                    {gymKitSelected === 'yes' && (
                      <div className="form-row-single">
                        <Form.Item
                          label="Select Inventory Items with Quantities"
                          name="selectedInventory"
                          rules={[{ required: gymKitSelected === 'yes', message: 'Please select inventory items' }]}
                        >
                          <InventorySelectionWithQuantity />
                        </Form.Item>
                      </div>
                    )}

                    {/* Biometric Machine Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Select Biometric Machines"
                        name="selectedBiometric"
                      >
                        <Checkbox.Group>
                          <Row>
                            {biometricMachineOptions.map((option) => (
                              <Col span={24} key={option.value} style={{ marginBottom: 8 }}>
                                <Checkbox 
                                  value={option.value} 
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </Checkbox>
                              </Col>
                            ))}
                            {biometricMachineOptions.length === 0 && (
                              <Col span={24}>
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                  No biometric machines available for selected branches
                                </div>
                              </Col>
                            )}
                          </Row>
                        </Checkbox.Group>
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

                    {/* Add On Package Specific Fields */}
                    <div className="form-separator" style={{ margin: '24px 0', borderBottom: '2px solid var(--border-color)' }}></div>
                    <h3 style={{ color: 'var(--sider-text)', marginBottom: 16 }}>Add-On Package Details</h3>
                    
                    <div className="form-row">
                      <Form.Item
                        label="Add on package name"
                        name="addonPackageName"
                        rules={[{ required: true, message: 'Please enter add-on package name' }]}
                      >
                        <Input placeholder="Enter add-on package name" />
                      </Form.Item>

                      <Form.Item
                        label="Add on package price"
                        name="addonPackagePrice"
                        rules={[{ required: true, message: 'Please enter add-on package price' }]}
                      >
                        <InputNumber
                          placeholder="Enter add-on package price"
                          min={0}
                          style={{ width: '100%' }}
                          prefix="₹"
                        />
                      </Form.Item>
                    </div>

                    <div className="form-row-single">
                      <Form.Item
                        label="Number of session"
                        name="numberOfSession"
                        rules={[{ required: true, message: 'Please enter number of sessions' }]}
                      >
                        <InputNumber
                          placeholder="Enter number of sessions"
                          min={1}
                          style={{ width: '100%' }}
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
                        rules={[{ required: true, message: 'Please select at least one branch' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select branches"
                          options={branchOptions}
                          onChange={(branchValues) => {
                            // Clear gym kit selections when branch changes
                            form.setFieldsValue({
                              selectedInventory: []
                            });
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Gym Kit Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Gym Kit"
                        name="gymKit"
                        rules={[{ required: true, message: 'Please select gym kit option' }]}
                      >
                        <Select
                          placeholder="Select gym kit option"
                          options={gymKitOptions}
                          onChange={(value) => {
                            setGymKitSelected(value);
                            if (value === 'no') {
                              form.setFieldsValue({ selectedInventory: [] });
                            }
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Inventory Selection - Show only when gym kit is Yes */}
                    {gymKitSelected === 'yes' && (
                      <div className="form-row-single">
                        <Form.Item
                          label="Select Inventory Items with Quantities"
                          name="selectedInventory"
                          rules={[{ required: gymKitSelected === 'yes', message: 'Please select inventory items' }]}
                        >
                          <InventorySelectionWithQuantity />
                        </Form.Item>
                      </div>
                    )}

                    {/* Biometric Machine Selection */}
                    <div className="form-row-single">
                      <Form.Item
                        label="Select Biometric Machines"
                        name="selectedBiometric"
                      >
                        <Checkbox.Group>
                          <Row>
                            {biometricMachineOptions.map((option) => (
                              <Col span={24} key={option.value} style={{ marginBottom: 8 }}>
                                <Checkbox 
                                  value={option.value} 
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </Checkbox>
                              </Col>
                            ))}
                            {biometricMachineOptions.length === 0 && (
                              <Col span={24}>
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                  No biometric machines available for selected branches
                                </div>
                              </Col>
                            )}
                          </Row>
                        </Checkbox.Group>
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
              loading={isLoading}
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