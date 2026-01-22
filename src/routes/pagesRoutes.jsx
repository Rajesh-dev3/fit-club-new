import AllFeedbacks from "../pages/allFeedbacks";
import { AllFeedbacksRoute, EditRoleRoute, userFeedbackRoute } from "./routepath";
import AddCoupon from "../pages/addCoupon";
import { AddCouponRoute } from "./routepath";
import AllCoupons from "../pages/allCoupons";
import { AllCouponsRoute } from "./routepath";
 

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { AddEmployeeRoute, AddUserRoute, AllEmployeesRoute, AllGeneralStaffRoute, AddGeneralStaffRoute, AllTrainersRoute, AddTrainerRoute, AllRolesRoute, AddRoleRoute, AllDirectorsRoute, AddDirectorRoute, EditDirectorRoute, AllPackagesRoute, AddPackageRoute, AllAddOnSlotsRoute, AddAddOnSlotRoute, AllAddOnPackagesRoute, Home, loginRoute, AllUsersRoute, DirectorAttendanceRoute, EmployeeDetailRoute, EmployeeDetailAttendanceRoute, EmployeeDetailEmployeeIdRoute, EmployeeDetailSalaryRoute, EmployeeDetailSalesHistoryRoute, EmployeeDetailParkingHistoryRoute, EmployeeDetailBiometricAccessRoute, EmployeeDetailAddBiometricAccessRoute, GeneralStaffDetailRoute, GeneralStaffDetailAttendanceRoute, GeneralStaffDetailIdRoute, GeneralStaffDetailSalaryRoute, GeneralStaffDetailBiometricAccessRoute, GeneralStaffDetailAddBiometricAccessRoute, TrainerDetailRoute, TrainerDetailAttendanceRoute, TrainerDetailCoachIdRoute, TrainerDetailClassesRoute, TrainerDetailTransactionsRoute, TrainerDetailParkingHistoryRoute, TrainerDetailBiometricAccessRoute, TrainerDetailAddBiometricAccessRoute, UserDetailAttendanceRoute, UserDetailMembershipRoute, UserDetailAddonPackageRoute, UserDetailAssessmentRoute, UserDetailRefundHistoryRoute, UserDetailParkingHistoryRoute, UserDetailDietsPlanRoute, UserDetailBiometricAccessRoute, UserDetailRoute, AllBranchesRoute, AddBranchRoute, EditBranchRoute, UserDetailMembershipFreezabilityRoute, UserDetailMembershipDaysRoute, DirectorDetailPageRoute, DirectorAttendancePageRoute, DirectorBiometricAccessPageRoute, AddAddOnPackageRoute } from "./routepath";
import AddBranch from "../pages/addBranch";
import AllBranches from "../pages/allBranches";
import MainLayout from "../common/mainLayout";
import Dashboard from "../pages/Dashboard";
import AddUser from "../pages/addUser";
import AddEmployee from "../pages/addEmployee";
import AllEmployees from "../pages/allEmployees";
import AllGeneralStaff from "../pages/allGeneralStaff";
import AddGeneralStaff from "../pages/addGeneralStaff";
import AllTrainers from "../pages/allTrainers";
import AddTrainer from "../pages/addTrainer";
import AllRoles from "../pages/allRoles";
import AddRole from "../pages/addRole";
import AddDirector from "../pages/addDirector";
import EditDirector from "../pages/editDirector";
import AllDirectors from "../pages/allDirectors";
import AllPackages from "../pages/allPackages";
import AddPackage from "../pages/addPackage";
import AllAddOnSlots from "../pages/allAddOnSlots";
import AddAddOnSlot from "../pages/addAddOnSlot";
import Login from "../pages/auth/login";
import AllUsers from "../pages/allUsers";
import DirectorAttendance from "../pages/directorAttendance";

import EmployeeDetailPage from "../pages/employeeDetail";
import EmployeeDetailAttendance from "../components/employeeDetail/attendance";
import EditRole from "../pages/editRole";
import EmployeeIdSection from "../components/employeeDetail/employeeId";
import SalarySection from "../components/employeeDetail/salary";
import SalesHistorySection from "../components/employeeDetail/salesHistory";
import ParkingHistorySection from "../components/employeeDetail/parkingHistory";
import BiometricAccessSection from "../components/employeeDetail/biometricAccess";
import AddBiometricAccess from "../components/employeeDetail/biometricAccess/AddBiometricAccess";

import GeneralStaffDetailPage from "../pages/generalStaffDetail";
import GeneralStaffDetailAttendance from "../components/generalStaffDetail/attendance";
import GeneralStaffIdSection from "../components/generalStaffDetail/generalStaffId";
import GeneralStaffSalarySection from "../components/generalStaffDetail/salary";
import GeneralStaffBiometricAccessSection from "../components/generalStaffDetail/biometricAccess";
import AddGeneralStaffBiometricAccess from "../components/generalStaffDetail/biometricAccess/AddBiometricAccess";

import TrainerDetailPage from "../pages/trainerDetail";
import TrainerDetailAttendance from "../components/trainerDetail/attendance";
import CoachIdSection from "../components/trainerDetail/coachId";
import TrainerClasses from "../components/trainerDetail/classes";
import TrainerTransactions from "../components/trainerDetail/transactions";
import TrainerParkingHistory from "../components/trainerDetail/parkingHistory";
import TrainerBiometricAccessSection from "../components/trainerDetail/biometricAccess";
import AllAddOnPackages from "../pages/allAddOnPackages";
import AddAddOnPackage from "../pages/addAddOnPackage";
import UserDetailPage from "../pages/userDetail";
import UserProfile from "../components/userDetail/profile";
import UserAttendance from "../components/userDetail/attendance";
import UserMembership from "../components/userDetail/membership";
import AddonPackage from "../components/userDetail/addonPackage";
import Assessment from "../components/userDetail/assessment";
import RefundHistory from "../components/userDetail/refundHistory";
import DietsPlan from "../components/userDetail/dietsPlan";
import UserParkingHistory from "../components/userDetail/parkingHistory";
import UserBiometricAccess from "../components/userDetail/biometricAccess";
import AddUserBiometricAccess from "../components/userDetail/biometricAccess/AddUserBiometricAccess";
import {ErrorBoundary} from "../components/errorBoundery";
import EditBranch from "../pages/editBranch";
import FreezabilityForm from "../components/userDetail/membership/FreezabilityForm";
import DaysForm from "../components/userDetail/membership/DaysForm";
import DirectorDetailPage from "../pages/directorDetail";

import DirectorDetailAttendance from "../components/directorDetail/attendance";
import DirectorDetailBiometricAccess from "../components/directorDetail/biometricAccess";
import UserFeedback from "../components/userDetail/userFeedback";

export const router = createBrowserRouter([
  {
    path: Home,
    element:<MainLayout/>,
    children:[
      { path: Home, element:<Dashboard/> },
      { path: AddUserRoute, element:<AddUser/> },
      { path: AddEmployeeRoute, element:<AddEmployee/> },
      { path: AllEmployeesRoute, element:<AllEmployees/> },
      { path: AllGeneralStaffRoute, element:<AllGeneralStaff/> },
      { path: AddGeneralStaffRoute, element:<AddGeneralStaff/> },
      { path: AllTrainersRoute, element:<AllTrainers/> },
      { path: AddTrainerRoute, element:<AddTrainer/> },
      { path: AllRolesRoute, element:<AllRoles/> },
      { path: AddRoleRoute, element:<AddRole/> },
      { path: AllDirectorsRoute, element:<AllDirectors/> },
      { path: AddDirectorRoute, element:<AddDirector/> },
      { path: `${EditDirectorRoute}/:id`, element:<EditDirector/> },
      { path: AllPackagesRoute, element:<AllPackages/> },
      { path: AllUsersRoute, element:<AllUsers/> },
      { path: AllAddOnPackagesRoute, element: <AllAddOnPackages/> },
      { path: AddAddOnPackageRoute, element: <AddAddOnPackage/> },
      { path: DirectorAttendanceRoute, element:<DirectorAttendance/> },
      { path: AddPackageRoute, element:<AddPackage/> },
      { path: AllAddOnSlotsRoute, element:<AllAddOnSlots/> },
      { path: AddAddOnSlotRoute, element:<AddAddOnSlot/> },
      { path: AddBranchRoute, element: <AddBranch/> },
      { path: AllBranchesRoute, element: <AllBranches /> },
      { path: `${EditBranchRoute}/:id`, element: <EditBranch />, errorElement: <ErrorBoundary /> },
      {
        path: `${EmployeeDetailRoute}/:id`,
        element: <EmployeeDetailPage />,
        children: [
          {
            path: EmployeeDetailAttendanceRoute.slice(1),
            element: <EmployeeDetailAttendance />
          },
          {
            path: EmployeeDetailEmployeeIdRoute.slice(1),
            element: <EmployeeIdSection />
          },
          {
            path: EmployeeDetailSalaryRoute.slice(1),
            element: <SalarySection />
          },
          {
            path: EmployeeDetailSalesHistoryRoute.slice(1),
            element: <SalesHistorySection />
          },
          {
            path: EmployeeDetailParkingHistoryRoute.slice(1),
            element: <ParkingHistorySection />
          },
          {
            path: EmployeeDetailBiometricAccessRoute.slice(1),
            element: <BiometricAccessSection />
          },
          {
            path: EmployeeDetailAddBiometricAccessRoute.slice(1),
            element: <AddBiometricAccess />
          },
          {
            index: true,
            element: <EmployeeDetailAttendance />
          }
        ],
      },

      // User Detail Route
      {
        path: `${UserDetailRoute}/:id`,
        element: <UserDetailPage />, 
          errorElement: <ErrorBoundary />,  // Add error boundary
        children: [
          { path: UserDetailAttendanceRoute.slice(1), element: <UserAttendance /> },
          { path: UserDetailMembershipRoute.slice(1), element: <UserMembership /> },
          { path: UserDetailMembershipFreezabilityRoute.slice(1), element: <FreezabilityForm /> },
          { path: UserDetailMembershipDaysRoute.slice(1), element: <DaysForm /> },
          { path: UserDetailAddonPackageRoute.slice(1), element: <AddonPackage /> },
          { path: UserDetailAssessmentRoute.slice(1), element: <Assessment /> },
          { path: UserDetailRefundHistoryRoute.slice(1), element: <RefundHistory /> },
          { path: UserDetailParkingHistoryRoute.slice(1), element: <UserParkingHistory /> },
          { path: UserDetailDietsPlanRoute.slice(1), element: <DietsPlan /> },
          { path: UserDetailBiometricAccessRoute.slice(1), element: <UserBiometricAccess /> },
          { path: userFeedbackRoute.slice(1), element: <UserFeedback /> },
          { path: "add-biometric-access", element: <AddUserBiometricAccess /> },
          { index: true, element: <UserAttendance /> },
        ],
      },
      // director Detail Route
      {
        path: `${DirectorDetailPageRoute}/:id`,
        element: <DirectorDetailPage />, 
          errorElement: <ErrorBoundary />,  // Add error boundary
        children: [
          { path: DirectorAttendancePageRoute.slice(1), element: <DirectorDetailAttendance /> },
          { path: DirectorBiometricAccessPageRoute.slice(1), element: <DirectorDetailBiometricAccess /> },
       
          { index: true, element: <DirectorDetailAttendance /> },
        ],
      },

      {
        path: `${GeneralStaffDetailRoute}/:id`,
        element: <GeneralStaffDetailPage />,
        children: [
          {
            path: GeneralStaffDetailAttendanceRoute.slice(1),
            element: <GeneralStaffDetailAttendance />
          },
          {
            path: GeneralStaffDetailIdRoute.slice(1),
            element: <GeneralStaffIdSection />
          },
          {
            path: GeneralStaffDetailSalaryRoute.slice(1),
            element: <GeneralStaffSalarySection />
          },
          {
            path: GeneralStaffDetailBiometricAccessRoute.slice(1),
            element: <GeneralStaffBiometricAccessSection />
          },
          {
            path: GeneralStaffDetailAddBiometricAccessRoute.slice(1),
            element: <AddGeneralStaffBiometricAccess />
          },
          {
            index: true,
            element: <GeneralStaffDetailAttendance />
          }
        ],
      },

      {
        path: `${TrainerDetailRoute}/:id`,
        element: <TrainerDetailPage />,
        children: [
          {
            path: TrainerDetailAttendanceRoute.slice(1),
            element: <TrainerDetailAttendance />
          },
          {
            path: TrainerDetailCoachIdRoute.slice(1),
            element: <CoachIdSection />
          },
          {
            path: TrainerDetailClassesRoute.slice(1),
            element: <TrainerClasses />
          },
          {
            path: TrainerDetailTransactionsRoute.slice(1),
            element: <TrainerTransactions />
          },
          {
            path: TrainerDetailParkingHistoryRoute.slice(1),
            element: <TrainerParkingHistory />
          },
          {
            path: TrainerDetailBiometricAccessRoute.slice(1),
            element: <TrainerBiometricAccessSection />
          },
          {
            index: true,
            element: <TrainerDetailAttendance />
          }
        ],
      },
      { path: AllCouponsRoute, element: <AllCoupons /> },
      { path: AddCouponRoute, element: <AddCoupon /> },
      { path: AllFeedbacksRoute, element: <AllFeedbacks /> },
   { path: `${EditRoleRoute}/:id`, element: <EditRole /> },

    ]
    
  },
 
  {
    path: loginRoute,
    element: localStorage.getItem('token') ? <Navigate to={Home} replace /> : <Login />
  }
]);

