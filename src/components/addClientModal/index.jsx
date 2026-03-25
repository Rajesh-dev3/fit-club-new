import React, { useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import './styles.scss';

const AddClientModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    mobileNumber: '',
    email: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Form Data:', formData);
    // Add save logic here
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
      className="add-client-modal"
    >
      <div className="add-client-content">
        <h2 className="modal-title">Add New Client</h2>

        <div className="form-group">
          <label className="form-label">
            Client Name<span className="required">*</span>
          </label>
          <span className="required-text">*Required</span>
          <Input
            placeholder="e.g. Katherine Lim"
            size="large"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mobile Number</label>
          <div className="phone-input-wrapper">
            <div className="country-code">
              <span className="flag">🇮🇳</span>
              <span className="code">+91</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <Input
              placeholder="081234 56789"
              size="large"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              className="phone-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <Input
            placeholder="e.g. email@example.com"
            size="large"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="form-input"
          />
        </div>

        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSave}
          className="save-button"
        >
          SAVE
        </Button>
      </div>
    </Modal>
  );
};

export default AddClientModal;
