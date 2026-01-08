import React from 'react';
import { Button, Input, DatePicker } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './daysForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDetailMembershipRoute, UserDetailRoute } from '../../../routes/routepath';

const DaysForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
  };
  return (
    <div className="days-form-page">
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
            <label>Extra Days</label>
            <Input placeholder="Enter extra days" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-item">
            <label>Old Expiry Date</label>
            <DatePicker style={{ width: '100%' }} placeholder="Select old expiry date" />
          </div>
          <div className="form-item">
            <label>New Expiry Date</label>
            <DatePicker style={{ width: '100%' }} placeholder="Select new expiry date" />
          </div>
        </div>
      </div>
      <div className="action-buttons">
        <Button type="primary">Save</Button>
      </div>
    </div>
  );
};

export default DaysForm;
