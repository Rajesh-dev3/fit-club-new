import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
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

  return (
    <div className="employee-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={staff.photo || user} alt="general-staff" />
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
            <span><b>Role:</b> <span className="value">{staff.staffTypeId?.name || '-'}</span></span>
            <span></span>
          </div>
        </div>
      </div>
      {/* ================= CONTENT ================= */}
      <div className="content">
        {/* Mobile Tabs */}
        <div className="mobile-tabs">
          <Menu
            mode="horizontal"
            overflowedIndicator="..."
            selectedKeys={[location.pathname.replace(`/general-staff-detail/${id}`, '') || '/attendance']}
            onClick={({ key }) => navigate(`/general-staff-detail/${id}/${key}`)}
            items={tabItems}
          />
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <ul>
            {menuItems.map((item) => {
              const fullPath = `/general-staff-detail/${id}/${item.path}`;
              const isActive = location.pathname.includes(item.path);
              return (
                <li key={item.id} >
                  <Link to={fullPath} className={isActive ? 'active' : ''}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Detail Content */}
        <div className="employee-detail-content">
          <Outlet context={{ staff }} />
        </div>
      </div>
    </div>
  );
};

export default GeneralStaffDetailPage;
