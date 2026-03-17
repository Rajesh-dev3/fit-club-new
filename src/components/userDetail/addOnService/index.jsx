import React from 'react';
import { Card } from 'antd';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { 
  UserOutlined, 
  HeartOutlined, 
  MedicineBoxOutlined, 
  ThunderboltOutlined, 
  LockOutlined, 
  TrophyOutlined 
} from '@ant-design/icons';
import './styles.scss';

const AddOnService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userData } = useOutletContext();

  const services = [
    { id: 1, name: 'Personal Training', value: 'personal-training', icon: <UserOutlined />, requiresMembership: true },
    { id: 2, name: 'Pilates', value: 'pilates', icon: <HeartOutlined />, requiresMembership: false },
    { id: 3, name: 'Therapy', value: 'therapy', icon: <MedicineBoxOutlined />, requiresMembership: false },
    { id: 4, name: 'EMS', value: 'ems', icon: <ThunderboltOutlined />, requiresMembership: false },
    { id: 5, name: 'Paid Locker', value: 'paid-locker', icon: <LockOutlined />, requiresMembership: false },
    { id: 6, name: 'MMA', value: 'mma', icon: <TrophyOutlined />, requiresMembership: false },
  ];

  // Check if user has membership
  const hasMembership = userData?.member?.membershipType && userData?.member?.membershipType !== '';

  // Filter services based on membership
  const filteredServices = services.filter(service => {
    if (service.requiresMembership) {
      return hasMembership;
    }
    return true;
  });

  const handleServiceClick = (service) => {
    console.log('Selected service:', service);
    // Navigate to buy addon service form with selected service
    navigate(`/user-detail/${id}/buy-addon-service?type=${service.value}`);
  };

  return (
    <div className="addon-service-container">
      <h3 className="section-title">Select Add-On Service</h3>
      <div className="service-grid">
        {filteredServices.map(service => (
          <Card
            key={service.id}
            className="service-card"
            hoverable
            onClick={() => handleServiceClick(service)}
          >
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-name">{service.name}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddOnService;
