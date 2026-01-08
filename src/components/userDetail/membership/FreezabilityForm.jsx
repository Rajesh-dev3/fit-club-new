import React, { useState } from 'react';
import { Button, Input, DatePicker } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './freezabilityForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDetailMembershipRoute, UserDetailRoute } from '../../../routes/routepath';

const FreezabilityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
  };
  return (
    <div className="freezability-form-page">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="back-btn"
      >
        Back
      </Button>

      <div className="form-section">
        <div className="form-row">
          <div className="form-item">
            <label>Slot</label>
            <Input placeholder="Enter slot" />
          </div>
          <div className="form-item">
            <label>Days</label>
            <Input placeholder="Enter days" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-item">
            <label>From</label>
            <DatePicker style={{ width: '100%',paddingBlock:"11px" }} placeholder="From date" />
          </div>
          <div className="form-item">
            <label>To</label>
            <DatePicker style={{ width: '100%',paddingBlock:"11px" }} placeholder="To date" />
          </div>
        </div>
      </div>
      <div className="action-buttons">
        <Button type="primary">Save</Button>
      </div>
    </div>
  );
};

export default FreezabilityForm;
