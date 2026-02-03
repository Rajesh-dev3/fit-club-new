import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useUpdateBiometricLimitedMutation } from '../../../services/biometric';
import './styles.scss';

const { Option } = Select;

const EditBiometricModal = ({ open, onClose, recordData, onSuccess }) => {
  const [form] = Form.useForm();
  const [updateBiometric, { isLoading }] = useUpdateBiometricLimitedMutation();

  // Pre-fill form when modal opens or recordData changes
  useEffect(() => {
    if (open && recordData) {
      form.setFieldsValue({
        machineId: recordData.machineId || '',
        model: recordData.model || '',
        company: recordData.company || '',
        branchName: recordData.branchId?.branchName || recordData.branchName || '',
        floor: recordData.floor || '',
        recordPurpose: recordData.recordPurpose || '',
        authToken: recordData.authToken || '',
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
      await updateBiometric({
        id: recordData._id,
        floor: values.floor,
        recordPurpose: values.recordPurpose,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <Modal
      title="Edit Biometric Machine"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className="edit-biometric-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="edit-biometric-form"
      >
        <div className="form-row">
          <Form.Item
            name="machineId"
            label="Machine ID"
            className="form-item"
          >
            <Input placeholder="Machine ID" disabled />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            className="form-item"
          >
            <Input placeholder="Model" disabled />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            name="company"
            label="Company"
            className="form-item"
          >
            <Input placeholder="Company" disabled />
          </Form.Item>

          <Form.Item
            name="branchName"
            label="Branch"
            className="form-item"
          >
            <Input placeholder="Branch" disabled />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            name="floor"
            label="Floor"
            rules={[{ required: true, message: 'Please enter floor' }]}
            className="form-item"
          >
            <Input placeholder="Enter floor" />
          </Form.Item>

          <Form.Item
            name="recordPurpose"
            label="Record Purpose"
            rules={[{ required: true, message: 'Please select record purpose' }]}
            className="form-item"
          >
            <Select placeholder="Select record purpose">
              <Option value="in">In</Option>
              <Option value="out">Out</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="authToken"
          label="Auth Token"
          className="form-item"
        >
          <Input.TextArea
            placeholder="Auth Token"
            rows={3}
            disabled
          />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onClose} className="cancel-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="submit-btn"
          >
            Update Machine
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBiometricModal;