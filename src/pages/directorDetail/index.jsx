import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import CommonSider from '../../components/commonSider';
import {  DirectorAttendancePageRoute, DirectorBiometricAccessPageRoute, DirectorDetailPageRoute, UserDetailRoute } from '../../routes/routepath';

const menuItems = [
  { id: 'attendance', label: 'Attendance', path: DirectorAttendancePageRoute },
  { id: 'biometricAccess', label: 'Biometric Access', path: DirectorBiometricAccessPageRoute },
];

const DirectorDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const data = {};
  const userData = data?.data || {};
  const member = userData.member || {};
const user = userData.user || {};
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
  // Support both /membership, /membership-freezability, and /membership-days for active tab
  let currentTab = pathSegments[pathSegments.length - 1] || 'attendance';
  if (
    currentTab === 'membership-freezability' ||
    currentTab === 'freezability' ||
    currentTab === 'membership-days' ||
    currentTab === 'days'
  ) {
    currentTab = 'membership';
  }

return (
    <div className="director-detail-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={employee.photo} alt="employee" />
            <span className="status">{userInfo.status ? userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1) : 'Active'}</span>
          </div>
        </div>

        <div className="right">
          <div className="row">
            <span><b>Name:</b> <span className="value">{userInfo.name || '-'}</span></span>
            <span><b>Mobile No:</b> <span className="value">{userInfo.phoneNumber || '-'}</span></span>
            <span><b>Employee ID:</b> <span className="value">{employee.employeeId || id}</span></span>
          </div>

          <div className="row">
            <span><b>Email:</b> <span className="value">{userInfo.email || '-'}</span></span>
            <span><b>Biometric ID:</b> <span className="value">{userInfo?.biometricId || '-'}</span></span>
          </div>
          <div className="row">
            <span><b>Address:</b> <span className="value">{employee.address || '-'}</span></span>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="content">
        <CommonSider
          items={menuItems.map(item => ({
            key: item.id,
            label: item.label,
            icon: null,
            path: item.path.slice(1),
          }))}
          activeKey={(() => {
            const found = menuItems.find(item => currentTab === item.path.slice(1));
            return found ? found.id : menuItems[0].id;
          })()}
          onSelect={key => {
            const item = menuItems.find(i => i.id === key);
            if (item) navigate(`${DirectorDetailPageRoute}${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }) => navigate(`${DirectorDetailPageRoute}${id}/${key}`)
          }}
        />
        {/* Detail Content */}
        <div className="employee-detail-content">
          <Outlet context={{ employee }} />
        </div>
      </div>
    </div>
  );
};

export default DirectorDetailPage;