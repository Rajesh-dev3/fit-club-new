import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

const menuItems = [
  { id: 'attendance', label: 'Attendance', path: 'attendance' },
  { id: 'membership', label: 'Membership', path: 'membership' },
  { id: 'addonPackage', label: 'AddOn Package', path: 'addon-package' },
  { id: 'assessment', label: 'Assessment', path: 'assessment' },
  { id: 'refundHistory', label: 'Refund History', path: 'refund-history' },
  { id: 'parkingHistory', label: 'Parking History', path: 'parking-history' },
  { id: 'dietsPlan', label: 'Diets Plan', path: 'diets-plan' },
  { id: 'biometricAccess', label: 'Biometric Access', path: 'biometric-access' },
];

const UserDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const data = {};
  const userData = data?.data || {};
  const member = userData.member || {};

  const userInfo = {
    name: 'Bhumika',
    age: 25,
    dob: '2000-08-13',
    gender: 'Female',
    phoneNumber: '+91 9560385845',
    email: 'Bhumika.m000@gmail.com',
    alternateNumber: 'Null',
    biometricId: '2402',
    bmi: '12.0',
  };

  const employee = {
    address: 'Sector 41, haryana',
    designation: 'Null',
    work: 'Null',
    idType: 'Aadhar',
    idNo: '429279383894',
  };

  const tabItems = menuItems.map(item => ({
    key: item.path,
    label: item.label,
  }));

  const [expanded, setExpanded] = useState(false);

  // Get current active tab from URL
  const currentPath = location.pathname;
  const pathSegments = currentPath.split('/');
  const currentTab = pathSegments[pathSegments.length - 1] || 'attendance';

  return (
    <div className="user-detail-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={userImg} alt="employee" />
            <span className="status">Active</span>
          </div>
        </div>

        <div className="right">
          {/* ===== ALWAYS VISIBLE ===== */}
          <div className="row">
            <span><b>Name:</b> <span className="value">{userInfo.name}</span></span>
            <span><b>Age:</b> <span className="value">{userInfo.age}</span></span>
            <span><b>DOB:</b> <span className="value">{userInfo.dob}</span></span>
            <span><b>Gender:</b> <span className="value">{userInfo.gender}</span></span>
          </div>

          <div className="row">
            <span><b>Mobile No.:</b> <span className="value">{userInfo.phoneNumber}</span></span>
            <span><b>Email:</b> <span className="value">{userInfo.email}</span></span>
          </div>

          {/* ===== COLLAPSIBLE CONTENT (NEW – NOTHING REMOVED) ===== */}
          <div className={`profile-expand-wrapper ${expanded ? 'expanded' : ''}`}>
            <div className="row">
              <span><b>Alternate No.:</b> <span className="value">{userInfo.alternateNumber}</span></span>
              <span><b>Address:</b> <span className="value">{employee.address}</span></span>
              <span><b>ID Type:</b> <span className="value">{employee.idType}</span></span>
            </div>

            <div className="row">
              <span><b>ID No.:</b> <span className="value">{employee.idNo}</span></span>
              <span><b>Biometric Id:</b> <span className="value">{userInfo.biometricId}</span></span>
              <span><b>Designation:</b> <span className="value">{employee.designation}</span></span>
              <span><b>Work:</b> <span className="value">{employee.work}</span></span>
              <span><b>BMI:</b> <span className="value">{userInfo.bmi}</span></span>
            </div>
          </div>

          {/* ===== BOTTOM CENTER TOGGLE ===== */}
          <div
            className="expand-toggle"
            onClick={() => setExpanded(prev => !prev)}
          >
            {expanded ? <UpOutlined /> : <DownOutlined />}
            <span>{expanded ? 'Hide Details' : 'Show More'}</span>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="content">
        <div className="mobile-tabs">
          <Menu
            mode="horizontal"
            overflowedIndicator="..."
            selectedKeys={[currentTab]}
            onClick={({ key }) => navigate(key)}
            items={tabItems}
          />
        </div>

        <div className="sidebar">
          <ul>
            {menuItems.map(item => {
              const isActive = currentTab === item.path;
              return (
                <li key={item.id}>
                  <Link to={item.path} className={isActive ? 'active' : ''}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="employee-detail-content">
          <Outlet context={{ employee }} />
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;