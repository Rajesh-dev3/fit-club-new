import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import CommonSider from '../../components/commonSider';
import { UserDetailRoute } from '../../routes/routepath';
import { useUserDetailDataQuery } from '../../services/user';

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
const { data } = useUserDetailDataQuery(id); // TODO: Fetch user detail data using RTK Query
  const userData = data?.user || {};
  const member = userData.member || {};
  const memberShip = userData.memberShip || {};

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
console.log('User Data:', member);
  return (
    <div className="user-detail-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={member.photo || userImg} alt="employee" />
            <span className="status">{userData?.status}</span>
          </div>
        </div>

        <div className="right">
          {/* ===== ALWAYS VISIBLE ===== */}
          <div className="row">
            <span><b>Name:</b> <span className="value">{userData?.name}</span></span>
            <span><b>Age:</b> <span className="value">{member?.age}</span></span>
            <span><b>DOB:</b> <span className="value">{member?.dob}</span></span>
            <span><b>Gender:</b> <span className="value">{member?.gender}</span></span>
          </div>

          <div className="row">
            <span><b>Mobile No.:</b> <span className="value">{userData?.phoneNumber}</span></span>
            <span><b>Email:</b> <span className="value">{userData?.email}</span></span>
          </div>

          {/* ===== COLLAPSIBLE CONTENT (NEW – NOTHING REMOVED) ===== */}
          <div className={`profile-expand-wrapper ${expanded ? 'expanded' : ''}`}>
            <div className="row">
              <span><b>Alternate No.:</b> <span className="value">{member?.alternativePhoneNumber}</span></span>
              <span><b>Address:</b> <span className="value">{employee.address}</span></span>
              <span><b>ID Type:</b> <span className="value">{member.idType}</span></span>
            </div>

            <div className="row">
              <span><b>ID No.:</b> <span className="value">{member.idNumber}</span></span>
              <span><b>Biometric Id:</b> <span className="value">{userData?.biometricId}</span></span>
              <span><b>Designation:</b> <span className="value">{employee.designation}</span></span>
              <span><b>Work:</b> <span className="value">{employee.work}</span></span>
              <span><b>BMI:</b> <span className="value">{userData?.bmi}</span></span>
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
        {/* Mobile tabs now handled in CommonSider */}

              <CommonSider
                items={menuItems.map(item => ({
                  key: item.id,
                  label: item.label,
                  icon: null,
                  path: item.path,
                }))}
                activeKey={(() => {
                  const found = menuItems.find(item => currentTab === item.path);
                  return found ? found.id : menuItems[0].id;
                })()}
                onSelect={key => {
                  const item = menuItems.find(i => i.id === key);
                  if (item) navigate(`${UserDetailRoute}/${id}/${item.path}`);
                }}
                mobileTabsProps={{
                  tabItems,
                  currentTab,
                  onTabClick: ({ key }) => navigate(key)
                }}
              />

        <div className="employee-detail-content">
          <Outlet context={{ employee }} />
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;