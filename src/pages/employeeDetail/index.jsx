import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { EmployeeDetailAttendanceRoute, EmployeeDetailBiometricAccessRoute, EmployeeDetailEmployeeIdRoute, EmployeeDetailParkingHistoryRoute, EmployeeDetailSalaryRoute, EmployeeDetailSalesHistoryRoute } from '../../routes/routepath';
import { useGetEmployeeDetailQuery } from '../../services/employee';
import { Menu } from 'antd';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems =  [
  { id: 'attendance', label: 'Attendance', path:EmployeeDetailAttendanceRoute },
  { id: 'employeeId', label: 'Employee ID', path: EmployeeDetailEmployeeIdRoute },
  { id: 'salary', label: 'Salary', path: EmployeeDetailSalaryRoute },
  { id: 'salesHistory', label: 'Sales History', path: EmployeeDetailSalesHistoryRoute },
  { id: 'parkingHistory', label: 'Parking History', path: EmployeeDetailParkingHistoryRoute },
  { id: 'biometricAccess', label: 'Biometric Access', path: EmployeeDetailBiometricAccessRoute },
];
const {data} = useGetEmployeeDetailQuery(id)

  // Defensive: fallback if data is not loaded yet
  const employee = data?.data || {};
  const userInfo = employee.user || {};

  const tabItems = menuItems.map(item => ({
    key: item.path.slice(1),
    label: item.label,
  }));
  return (
    <div className="employee-page">
      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">
        <div className="left">
          <div className="avatar">
            <img src={employee.photo || user} alt="employee" />
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
        {/* Mobile/Tablet Tabs */}
        <div className="mobile-tabs">
          <Menu
            mode="horizontal"
            overflowedIndicator="..."
            selectedKeys={[location.pathname.replace(`/employee-detail/${id}`, '').slice(1) || 'attendance']}
            onClick={({ key }) => navigate(`/employee-detail/${id}/${key}`)}
            items={tabItems}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="sidebar">
          <ul>
            {menuItems.map((item) => {
              const fullPath = `/employee-detail/${id}/${item.path}`;
              let isActive = false;
              if (location.pathname === `/employee-detail/${id}` && item.path === '/attendance') {
                isActive = true;
              } else if (item.path === '/biometric-access') {
                isActive = location.pathname.includes('/biometric-access') || location.pathname.includes('/add-biometric-access');
              } else {
                isActive = location.pathname.includes(item.path);
              }
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
          <Outlet context={{ employee }} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;



