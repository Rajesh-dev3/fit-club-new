import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGetTrainersDetailQuery } from '../../services/trainer';
import CommonSider from '../../components/commonSider';
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

  // Get current active tab from URL
  const currentPath = location.pathname;
  const pathSegments = currentPath.split('/');
  // /trainer-detail/:id/:tab
  const currentTab = pathSegments[pathSegments.length - 1] || TrainerDetailAttendanceRoute.slice(1);

  return (
    <div className="trainer-detail-page">
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
            if (item) navigate(`/trainer-detail/${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }) => navigate(`/trainer-detail/${id}/${key}`)
          }}
        />
        {/* Detail Content */}
        <div className="trainer-detail-content">
          <Outlet context={{ trainer }} />
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailPage;