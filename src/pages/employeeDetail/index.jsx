import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { EmployeeDetailAttendanceRoute, EmployeeDetailBiometricAccessRoute, EmployeeDetailEmployeeIdRoute, EmployeeDetailParkingHistoryRoute, EmployeeDetailSalaryRoute, EmployeeDetailSalesHistoryRoute } from '../../routes/routepath';
import { useGetEmployeeDetailQuery } from '../../services/employee';
import CommonSider from '../../components/commonSider';

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

  // Get current active tab from URL
  const currentPath = location.pathname;
  const pathSegments = currentPath.split('/');
  // /employee-detail/:id/:tab
  const currentTab = pathSegments[pathSegments.length - 1] || EmployeeDetailAttendanceRoute.slice(1);
  return (
    <div className="employee-detail-page">
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
            if (item) navigate(`/employee-detail/${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }) => navigate(`/employee-detail/${id}/${key}`)
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

export default EmployeeDetailPage;



