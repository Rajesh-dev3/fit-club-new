import React from 'react';
import { Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import MembershipCard from '../../card/memberShipCard';
import { useGetUserAddOnsQuery } from '../../../services/membership';
import './styles.scss';

const AddOnService = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // API call to get user's add-on services
  const { data, isLoading } = useGetUserAddOnsQuery(id);

  return (
    <div className="addon-service-container">
      <div className="table-header">
        <h3 className="section-title">Add-On Services</h3>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/user-detail/${id}/select-addon-service`)}
          >
            Add On Service
          </Button>
        </div>
      </div>
      
      <MembershipCard membershipData={data} isLoading={isLoading} />
    </div>
  );
};

export default AddOnService;
