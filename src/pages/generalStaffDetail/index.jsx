import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import CommonSider from '../../components/commonSider';
import { useGetGeneralStaffDetailQuery } from '../../services/generalStaff';
import { Menu } from 'antd';

const menuItems = [
  { id: 'attendance', label: 'Attendance', path: 'attendance' },
  { id: 'generalStaffId', label: 'General Staff ID', path: 'general-staff-id' },
  { id: 'salary', label: 'Salary', path: 'salary' },
  { id: 'biometricAccess', label: 'Biometric Access', path: 'biometric-access' },
];

const GeneralStaffDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useGetGeneralStaffDetailQuery(id);
  const staff = data?.data || {};
  const userInfo = staff.user || {};

  const tabItems = menuItems.map(item => ({
    key: item.path,
    label: item.label,
  }));
console.log(staff,"userInfo")
  return (
    <div className="general-staff-detail-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={staff?.photo || user} alt="general-staff" />
            <span className="status">{userInfo.status ? userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1) : 'Active'}</span>
          </div>
        </div>
        <div className="right">
          <div className="row">
            <span><b>Name:</b> <span className="value">{userInfo.name || '-'}</span></span>
            <span><b>Mobile No.:</b> <span className="value">{userInfo.phoneNumber || '-'}</span></span>
            <span><b>Staff Id:</b> <span className="value">{staff.staffId || staff.generalStaffId || '-'}</span></span>
            <span><b>Biometric Id:</b> <span className="value">{staff.biometricId || '-'}</span></span>
          </div>
          <div className="row">
            <span><b>Address:</b> <span className="value">{staff.address || '-'}</span></span>
            <span><b>Branch Name:</b> <span className="value">{(userInfo.branchIds && userInfo.branchIds[0]?.name) || '-'}</span></span>
            <span><b>Role:</b> <span className="value">{staff.roleId?.name || '-'}</span></span>
            <span></span>
          </div>
        </div>
      </div>
      {/* ================= CONTENT ================= */}
      <div className="content">
        {/* Mobile Tabs */}
        {/* Mobile Tabs and Sidebar via CommonSider */}
        {(() => {
          // Get current active tab from URL
          const currentPath = location.pathname;
          const pathSegments = currentPath.split('/');
          // /general-staff-detail/:id/:tab
          const currentTab = pathSegments[pathSegments.length - 1] || menuItems[0].path;
          return (
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
                if (item) navigate(`/general-staff-detail/${id}/${item.path}`);
              }}
              mobileTabsProps={{
                tabItems: menuItems.map(item => ({ key: item.path, label: item.label })),
                currentTab,
                onTabClick: ({ key }) => navigate(`/general-staff-detail/${id}/${key}`)
              }}
            />
          );
        })()}
        {/* Detail Content */}
        {/* Detail Content */}
        <div className="general-staff-detail-content">
          <Outlet context={{ staff }} />
        </div>
      </div>
    </div>
  );
};

export default GeneralStaffDetailPage;
