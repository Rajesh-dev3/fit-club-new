import {
  PieChartOutlined,
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MailOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  ShopOutlined,
  CreditCardOutlined,
  GiftOutlined,
  CarOutlined,
  WalletOutlined,
  MessageOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AddEmployeeRoute, AddGeneralStaffRoute, AddRoleRoute, AddUserRoute, AllEmployeesRoute, AllGeneralStaffRoute, AllRolesRoute, AllTrainersRoute, AllDirectorsRoute, Home, AllUsersRoute, DirectorAttendanceRoute, AllPackagesRoute, AllAddOnSlotsRoute, AddAddOnSlotRoute, AllAddOnPackagesRoute, AllBranchesRoute, AddBranchRoute, AllCouponsRoute, AddCouponRoute, AllFeedbacksRoute } from '../../routes/routepath';

const items = [
  {
    key: '1',
    label:<Link to={Home}>Dashboard</Link>,
    icon: <PieChartOutlined />,
  },
  {
    key: '2',
    label: <Link to={AllRolesRoute}>Role</Link>,
    icon: <UserOutlined />,
  },
  {
    key: '3',
    label: <Link to={AllDirectorsRoute}>Director</Link>,
    icon: <TeamOutlined />,
  },
  {
    key: '4',
    label: 'Attendance Management',
    icon: <CalendarOutlined />,
    children: [
      { key: '4-1', label: <Link to={DirectorAttendanceRoute}>Director Attendance</Link> },
      { key: '4-2', label: 'User Attendance' },
      { key: '4-3', label: 'Employee Attendance' },
      { key: '4-4', label: 'Trainer Attendance' },
      { key: '4-5', label: 'General Staff Attendance' },
    ],
  },
  {
    key: '5',
    label: 'Biometric',
    icon: <SolutionOutlined />,
    children: [
      { key: '5-1', label: 'All Biometrics' },
      { key: '5-2', label: 'Add Biometrics' },
    ],
  },
  {
    key: '6',
    label: 'Requests',
    icon: <MailOutlined />,
    children: [
      { key: '6-1', label: 'All Request' },
    ],
  },
  {
    key: '7',
    label: 'Sales Report',
    icon: <BarChartOutlined />,
    children: [
      { key: '7-1', label: 'Performance Graph' },
      { key: '7-2', label: 'Report' },
      { key: '7-3', label: 'Revenue History' },
    ],
  },
  {
    key: '8',
    label: 'Employee Management',
    icon: <TeamOutlined />,
    children: [
      { key: '8-1', label: <Link to={AllEmployeesRoute}>All Employees</Link> },
      { key: '8-2', label: <Link to={AllGeneralStaffRoute}>All General Staff</Link> },
      { key: '8-3', label: <Link to={AllTrainersRoute}>All Trainer</Link> },
    ],
  },
  {
    key: '9',
    label: 'User Management',
    icon: <UserOutlined />,
    children: [
      { key: '9-1', label: <Link to={AllUsersRoute}>All Users</Link> },
      { key: '9-2', label: <Link to={AddUserRoute}>Add User</Link> },
      { key: '9-3', label: "All Add-On's Users" },
      { key: '9-4', label: 'user-assissment' },
      { key: '9-5', label: 'Activity Log' },
      { key: '9-6', label: 'Blacklist User' },
      { key: '9-7', label: 'Search Users' },
    ],
  },
  {
    key: '10',
    label: 'Data Management',
    icon: <FolderOpenOutlined />,
    children: [
      { key: '10-1', label: 'Upload Data' },
      { key: '10-2', label: 'View Data' },
      { key: '10-3', label: 'Search Data' },
      { key: '10-4', label: 'Walkin incoming' },
    ],
  },
  {
    key: '11',
    label: 'Group Class',
    icon: <StarOutlined />,
    children: [
      { key: '11-1', label: 'All Group Class' },
      { key: '11-2', label: 'Add Group Class' },
      { key: '11-3', label: 'All Group Class Slots' },
      { key: '11-4', label: 'Add Group Class Slot' },
    ],
  },
  {
    key: '12',
    label: 'Membership Management',
    icon: <ShopOutlined />,
    children: [
      { key: '12-1', label: <Link to={AllPackagesRoute}>All Packages</Link> },
      { key: '12-2', label: <Link to={AllAddOnSlotsRoute}>All Add-on's Slots</Link> },
      { key: '12-3', label: <Link to={AllAddOnPackagesRoute}>All Add On's Package</Link> },
    ],
  },
  {
    key: '13',
    label: 'Trial Bookings',
    icon: <SmileOutlined />,
    children: [
      { key: '13-1', label: 'All Trial Bookings' },
    ],
  },
  {
    key: '14',
    label: 'Branch',
    icon: <ShopOutlined />,
    children: [
      { key: '14-1', label: <Link to={AllBranchesRoute}>All Branches</Link> },
      { key: '14-2', label: <Link to={AddBranchRoute}>Add Branch</Link> },
    ],
  },
  {
    key: '15',
    label: 'Invoice Management',
    icon: <CreditCardOutlined />,
    children: [
      { key: '15-1', label: 'All Invoice' },
      { key: '15-2', label: 'All Invoice' },
      { key: '15-3', label: 'Add Invoice' },
      { key: '15-4', label: 'Partial Invoice' },
      { key: '15-5', label: 'Credit Notes' },
      { key: '15-6', label: "All User's Credit" },
      { key: '15-7', label: 'Activity Log' },
    ],
  },
  {
    key: '16',
    label: 'Coupon',
    icon: <GiftOutlined />,
    children: [
      { key: '16-1', label: <Link to={AllCouponsRoute}>All Coupons</Link> },
      { key: '16-3', label: 'Activity Log' },
    ],
  },
  {
    key: '17',
    label: 'Banner',
    icon: <FileTextOutlined />,
    children: [
      { key: '17-1', label: 'All Banner' },
      { key: '17-2', label: 'Add Banner' },
    ],
  },
  {
    key: '18',
    label: 'Social Media',
    icon: <MessageOutlined />,
    children: [
      { key: '18-1', label: 'All Socials Links' },
      { key: '18-2', label: 'Add Socials Links' },
    ],
  },
  {
    key: '19',
    label: 'Parking Management',
    icon: <CarOutlined />,
    children: [
      { key: '19-1', label: 'All valet' },
      { key: '19-2', label: 'All Vehicles' },
      { key: '19-3', label: 'Vehicles history' },
    ],
  },
  {
    key: '20',
    label: 'Wallet Management',
    icon: <WalletOutlined />,
    children: [
      { key: '20-1', label: 'All Transaction' },
    ],
  },
  {
    key: '21',
    label: 'Feedback',
    icon: <SmileOutlined />,
    children: [
      { key: '21-1', label: <Link to={AllFeedbacksRoute}>All Feedback</Link> },
    ],
  },
];

export { items };
