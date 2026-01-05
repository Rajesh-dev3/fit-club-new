import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGetTrainersDetailQuery } from '../../services/trainer';
import { Menu } from 'antd';
import { TrainerDetailAttendanceRoute, TrainerDetailCoachIdRoute, TrainerDetailClassesRoute, TrainerDetailTransactionsRoute, TrainerDetailParkingHistoryRoute, TrainerDetailBiometricAccessRoute } from '../../routes/routepath';

const menuItems = [
  { id: 'attendance', label: 'Attendance', path: TrainerDetailAttendanceRoute },
  { id: 'coachId', label: 'Coach ID', path: TrainerDetailCoachIdRoute },
  { id: 'classes', label: 'Classes', path: TrainerDetailClassesRoute },
  { id: 'transactions', label: 'Transactions', path: TrainerDetailTransactionsRoute },
  { id: 'parkingHistory', label: 'Parking History', path: TrainerDetailParkingHistoryRoute },
  { id: 'biometricAccess', label: 'Biometric Access', path: TrainerDetailBiometricAccessRoute },
];

const TrainerDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useGetTrainersDetailQuery(id);
  const trainer = data?.data || {};
  const userInfo = trainer.user || {};

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
            <img src={trainer.photo || user} alt="trainer" />
            <span className="status">{userInfo.status ? userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1) : 'Active'}</span>
          </div>
        </div>
        <div className="right">
          <div className="row">
            <span><b>Name:</b> <span className="value">{userInfo.name || '-'}</span></span>
            <span><b>Mobile No.:</b> <span className="value">{userInfo.phoneNumber || '-'}</span></span>
            <span><b>Trainer Id:</b> <span className="value">{trainer.trainerId || trainer.id || '-'}</span></span>
            <span><b>Biometric Id:</b> <span className="value">{userInfo.biometricId || '-'}</span></span>
          </div>
          <div className="row">
            <span><b>Address:</b> <span className="value">{trainer.address || '-'}</span></span>
            <span><b>Branch Name:</b> <span className="value">{(userInfo.branchIds && userInfo.branchIds[0]?.name) || '-'}</span></span>
            <span><b>Role:</b> <span className="value">{trainer.roleId?.name || '-'}</span></span>
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
           selectedKeys={[location.pathname.replace(`/trainer-detail/${id}`, '').slice(1) || TrainerDetailAttendanceRoute.slice(1)]}

            onClick={({ key }) => navigate(`/trainer-detail/${id}/${key}`)}
            items={tabItems}
          />
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <ul>
            {menuItems.map((item) => {
              const fullPath = `/trainer-detail/${id}/${item.path}`;
              let isActive = false;
              if (location.pathname === `/trainer-detail/${id}` && item.path === '/attendance') {
                isActive = true;
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
          <Outlet context={{ trainer }} />
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailPage;