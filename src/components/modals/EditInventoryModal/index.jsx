import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message } from 'antd';
import { useGetBranchesQuery } from '../../../services/branches';
import { useUpdateInventoryMutation } from '../../../services/inventory';
import ImagePicker from '../../form/ImagePicker';
import './styles.scss';

const { Option } = Select;

const warehouseOptions = [
  { label: "Main Warehouse", value: "main_warehouse" },
  { label: "Storage Room A", value: "storage_a" },
  { label: "Storage Room B", value: "storage_b" },
  { label: "Equipment Room", value: "equipment_room" },
  { label: "Maintenance Area", value: "maintenance_area" },
];

const EditInventoryModal = ({ open, onClose, recordData, onSuccess }) => {
  const [form] = Form.useForm();
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery();
  const [updateInventory, { isLoading }] = useUpdateInventoryMutation();

  // Pre-fill form when modal opens or recordData changes
  useEffect(() => {
    if (open && recordData) {
      form.setFieldsValue({
        productName: recordData.productName || '',
        branch: recordData.branchId?._id || recordData.branchId || '',
        quantity: recordData.quantity || 0,
        warehouseName: recordData.warehouseName || recordData.warehouseId?.name || '',
        productImage: recordData.productImage || [],
      });
    }
  }, [open, recordData, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        productName: values.productName,
        branchId: values.branch,
        quantity: values.quantity,
        warehouseName: values.warehouseName,
        productImage: values.productImage
      };

      await updateInventory({
        id: recordData._id,
        ...payload
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Edit Inventory"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="edit-inventory-modal"
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="edit-inventory-form"
      >
        <div className="row">
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
            className="form-item-half"
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          
          <Form.Item
            name="branch"
            label="Branch Name"
            rules={[{ required: true, message: "Please select branch" }]}
            className="form-item-half"
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
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
            className="form-item-half"
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter quantity" />
          </Form.Item>
          
          <Form.Item
            name="warehouseName"
            label="Warehouse Name"
            rules={[{ required: true, message: "Please select warehouse" }]}
            className="form-item-half"
          >
            <Select placeholder="Select warehouse" options={warehouseOptions} />
          </Form.Item>
        </div>

        <Form.Item 
          label="Product Image" 
          name="productImage" 
          valuePropName="fileList" 
          getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList} 
          extra="Upload product image (Max 5MB, JPG/PNG)"
        >
          <ImagePicker form={form} name="productImage" />
        </Form.Item>

        <div className="modal-footer">
          <Button type="default" onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            className="save-btn"
          >
            {isLoading ? 'Updating...' : 'Update Inventory'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditInventoryModal;