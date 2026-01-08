import React from 'react';
import { Button } from 'antd';
import MembershipCard from '../../card/memberShipCard';
import FreezabilityForm from './FreezabilityForm';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './styles.scss';
import { UserDetailMembershipFreezabilityRoute, UserDetailMembershipDaysRoute, UserDetailRoute } from '../../../routes/routepath';

const UserMembership = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isFreezability = location.pathname.endsWith('/freezability');

  const handleFreezabilityClick = () => {
    navigate(`${UserDetailRoute}/${id}${UserDetailMembershipFreezabilityRoute}`);
  };

  const handleDaysClick = () => {
    navigate(`${UserDetailRoute}/${id}${UserDetailMembershipDaysRoute}`);
  };

  return (
    <div>
     
          <div className="membership-btn-group">
            <Button className="themed-btn primary">Sync Membership</Button>
            <Button className="themed-btn" onClick={handleFreezabilityClick}>Freezability</Button>
            <Button className="themed-btn" onClick={handleDaysClick}>Days</Button>
          </div>
          <MembershipCard/>
  
    </div>
  );
};

export default UserMembership;
