import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Menu, Spin } from 'antd';
import CommonSider from '../../components/commonSider';
import {  DirectorAttendancePageRoute, DirectorBiometricAccessPageRoute, DirectorDetailPageRoute, UserDetailRoute } from '../../routes/routepath';
import { useGetDirectorDetailQuery } from '../../services/director';

const menuItems = [
  { id: 'attendance', label: 'Attendance', path: DirectorAttendancePageRoute },
  { id: 'biometricAccess', label: 'Biometric Access', path: DirectorBiometricAccessPageRoute },
];

const DirectorDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // API call to get director detail
  const { 
    data: directorData, 
    error, 
    isLoading, 
    isError 
  } = useGetDirectorDetailQuery(id, {
    skip: !id,
  });

  const directorDetail = directorData?.data || {};
  // Map the API response structure
  const userInfo = {
    name: directorDetail.name || '',
    email: directorDetail.email || '',
    phone: directorDetail.number || '',
    address: directorDetail.address || '',
    status: directorDetail.status || directorDetail.userId?.status || 'ACTIVE'
  };
  const employeeInfo = {
    photo: directorDetail.photo || directorDetail.image || '',
    directorId: directorDetail._id || '',
    role: directorDetail.role?.name || '',
    branch: directorDetail.branch?.name || '',
    status: directorDetail.status || directorDetail.userId?.status || 'ACTIVE'
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

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="director-detail-page loading-container">
        <Spin size="large" />
      </div>
    );
  }

  // Show error message if API call fails
  if (isError) {
    return (
      <div className="director-detail-page error-container">
        <p>Error loading director details: {error?.message || 'Something went wrong'}</p>
      </div>
    );
  }

return (
    <div className="director-detail-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={employeeInfo.photo || userImg} alt="director" />
            <span className="status">
              {employeeInfo.status ? employeeInfo.status.charAt(0).toUpperCase() + employeeInfo.status.slice(1) : 'Active'}
            </span>
          </div>
        </div>

        <div className="right">
          <div className="row">
            <span><b>Name:</b> <span className="value">{userInfo.name || '-'}</span></span>
            <span><b>Mobile No:</b> <span className="value">{userInfo.phone || '-'}</span></span>
            <span><b>Director ID:</b> <span className="value">{employeeInfo.directorId || id}</span></span>
          </div>

          <div className="row">
            <span><b>Email:</b> <span className="value">{userInfo.email || '-'}</span></span>
            <span><b>Role:</b> <span className="value">{employeeInfo.role || '-'}</span></span>
          </div>
          <div className="row">
            <span><b>Branch:</b> <span className="value">{employeeInfo.branch || '-'}</span></span>
            <span><b>Address:</b> <span className="value">{userInfo.address || '-'}</span></span>
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
          <Outlet context={{ director: directorDetail, userInfo, employeeInfo }} />
        </div>
      </div>
    </div>
  );
};

export default DirectorDetailPage;