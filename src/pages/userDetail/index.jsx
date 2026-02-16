import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import CommonSider from '../../components/commonSider';

import { useUserDetailDataQuery } from '../../services/user';

// Menu items में variables का उपयोग करें
const menuItems = [
  { id: 'attendance', label: 'Attendance', path: 'attendance' },
  { id: 'membership', label: 'Membership', path: 'membership' },
  { id: 'addonPackage', label: 'AddOn Package', path: 'addon-package' },
  { id: 'assessment', label: 'Assessment', path: 'assessment' },
  { id: 'refundHistory', label: 'Refund History', path: 'refund-history' },
  { id: 'parkingHistory', label: 'Parking History', path: 'parking-history' },
  { id: 'dietsPlan', label: 'Diets Plan', path: 'diets-plan' },
  { id: 'biometricAccess', label: 'Biometric Access', path: 'biometric-access' },
  { id: 'feedback', label: 'Feedback', path: 'user-feedback' },
];

const UserDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useUserDetailDataQuery(id);
  const userData = data?.user || {};
  const member = userData.member || {};
  const memberShip = userData.memberShip || {};

  // Create dynamic menu items based on user status
  const getMenuItems = () => {
    const baseMenuItems = [
      { id: 'attendance', label: 'Attendance', path: 'attendance' },
      { id: 'membership', label: 'Membership', path: 'membership' },
      { id: 'addonPackage', label: 'AddOn Package', path: 'addon-package' },
      { id: 'assessment', label: 'Assessment', path: 'assessment' },
      { id: 'refundHistory', label: 'Refund History', path: 'refund-history' },
      { id: 'parkingHistory', label: 'Parking History', path: 'parking-history' },
      { id: 'dietsPlan', label: 'Diets Plan', path: 'diets-plan' },
      { id: 'biometricAccess', label: 'Biometric Access', path: 'biometric-access' },
      { id: 'feedback', label: 'Feedback', path: 'user-feedback' },
    ];

    // Add "Buy Plan" option if user status is pending
    if (userData?.status === 'pending') {
      baseMenuItems.splice(1, 0, { id: 'buyPlan', label: 'Buy Plan', path: 'buy-plan' });
    }
    if (userData?.status === 'active') {
      baseMenuItems.splice(1, 0, { id: 'buyMorePlan', label: 'Addvance Renew', path: 'buy-plan' });
    }

    return baseMenuItems;
  };

  const menuItems = getMenuItems();

 

  const [expanded, setExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState(menuItems[0].id); // Default to first tab

  // Function to extract the last segment from path
  const getLastPathSegment = (path) => {
    // Remove trailing slash if exists
    const cleanPath = path.replace(/\/$/, '');
    const segments = cleanPath.split('/');
    return segments[segments.length - 1];
  };

  // Current active tab को location से update करें
  useEffect(() => {
    const currentPath = location.pathname;
    const currentSegment = getLastPathSegment(currentPath);
    
    // Check for special membership sub-routes first
    if (
      currentSegment === 'membership-freezability' ||
      currentSegment === 'freezability' ||
      currentSegment === 'membership-days' ||
      currentSegment === 'days'
    ) {
      setCurrentTab('membership');
      return;
    }

    // Check for buy-plan route specifically
    if (currentSegment === 'buy-plan') {
      // Set appropriate tab based on user status
      if (userData?.status === 'active') {
        setCurrentTab('buyMorePlan');
      } else {
        setCurrentTab('buyPlan');
      }
      return;
    }

    // Find matching menu item
    const matchedItem = menuItems.find(item => {
      const itemLastSegment = getLastPathSegment(item.path);
      return itemLastSegment === currentSegment;
    });

    if (matchedItem) {
      setCurrentTab(matchedItem.id);
    } else {
      // If no match found, default to first tab
      setCurrentTab(menuItems[0].id);
    }
  }, [location.pathname, menuItems]); // Add menuItems to dependency array

  // tabItems for mobile (using path as key)
  const tabItems = menuItems.map(item => ({
    key: getLastPathSegment(item.path), // Use only the last segment as key
    label: item.label,
  }));

  console.log('Current tab:', currentTab);
  console.log('Current location:', location.pathname);

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
              <span><b>Address:</b> <span className="value">{member?.address}</span></span>
              <span><b>ID Type:</b> <span className="value">{member?.idType}</span></span>
            </div>

            <div className="row">
              <span><b>ID No.:</b> <span className="value">{member?.idNumber}</span></span>
              <span><b>Biometric Id:</b> <span className="value">{userData?.biometricId}</span></span>
              <span><b>Designation:</b> <span className="value">{userData?.designation}</span></span>
              <span><b>Work:</b> <span className="value">{userData?.work}</span></span>
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
        <CommonSider
          items={menuItems.map(item => ({
            key: item.id,
            label: item.label,
            icon: null,
            path: item.path,
          }))}
          activeKey={currentTab}
          onSelect={key => {
            const item = menuItems.find(i => i.id === key);
            if (item) {
              // Extract only the last segment from the path variable
              const pathSegment = getLastPathSegment(item.path);
              navigate(`/user-detail/${id}/${pathSegment}`);
            }
          }}
          mobileTabsProps={{
            tabItems,
            currentTab: getLastPathSegment(location.pathname),
            onTabClick: ({ key }) => navigate(`/user-detail/${id}/${key}`)
          }}
        />

        <div className="employee-detail-content">
          <Outlet context={{ userData }} />
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;