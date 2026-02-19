import { useSelector } from 'react-redux';
import Bargraph from '../../components/Graphs/BarGraph';
import LineGraph from '../../components/Graphs/LineGraph';
import PieChartGraph from '../../components/Graphs/PieChart';
import RadialBarGraph from '../../components/Graphs/RadialBarGraph';
import HierarchicalChart from '../../components/charts/HierarchicalChart';
import { useGetSalesTodayQuery, useGetSalesMonthlyQuery } from '../../services/upline';
import "./styles.scss";

const firstSectionGraphs = [{ comp: <LineGraph /> }, { comp: <RadialBarGraph /> }];

function Dashboard() {
  // Fetch real API data
  const { data: salesTodayData, isLoading: salesTodayLoading, error: salesTodayError } = useGetSalesTodayQuery();
  const { data: salesMonthlyData, isLoading: salesMonthlyLoading } = useGetSalesMonthlyQuery();

  // Transform today's sales data to match chart format
  const transformTodayData = (apiData) => {
    if (!apiData?.data) return { employees: [], trainers: [], totalSales: 0, totalTrainers: 0 };
    
    const employees = apiData.data.employee?.map(item => ({
      id: item.id,
      name: item.name || item.employeeId?.name,
      revenue: item.todaySales || 0,
      image: item.photo || item.employeeId?.photo,
      branchName: item.branchName
    })) || [];

    const trainers = apiData.data.trainer?.map(item => ({
      id: item.id,
      name: item.name || item.employeeId?.name,
      revenue: item.todaySales || 0,
      image: item.photo || item.employeeId?.photo,
      branchName: item.branchName
    })) || [];

    const totalSales = employees.reduce((sum, emp) => sum + emp.revenue, 0);
    const totalTrainers = trainers.reduce((sum, trainer) => sum + trainer.revenue, 0);

    return { employees, trainers, totalSales, totalTrainers };
  };

  const todayData = transformTodayData(salesTodayData);

  // Transform monthly sales data to match chart format
  const transformMonthlyData = (apiData) => {
    if (!apiData?.data) return { employees: [], trainers: [], totalSales: 0, totalTrainers: 0 };
    
    const employees = apiData.data.employee?.map(item => ({
      id: item.id,
      name: item.name || item.employeeId?.name,
      revenue: item.thisMonthSales || 0,
      image: item.photo || item.employeeId?.photo,
      branchName: item.branchName
    })) || [];

    const trainers = apiData.data.trainer?.map(item => ({
      id: item.id,
      name: item.name || item.employeeId?.name,
      revenue: item.thisMonthSales || 0,
      image: item.photo || item.employeeId?.photo,
      branchName: item.branchName
    })) || [];

    const totalSales = employees.reduce((sum, emp) => sum + emp.revenue, 0);
    const totalTrainers = trainers.reduce((sum, trainer) => sum + trainer.revenue, 0);

    return { employees, trainers, totalSales, totalTrainers };
  };

  const monthlyData = transformMonthlyData(salesMonthlyData);

  // const { user } = useSelector((state) => state.loggedInUserDetails.user);
  // const isAdmin = user?.isEmployee ? !user?.isEmployee : false;
  return (
    <div className="dashboard-wrapper">
      {/* {isAdmin ? ( */}
        {/* Hierarchical Revenue Charts Section */}
        <div className="revenue-charts-section">
          <div className="charts-grid">
            <HierarchicalChart
              title="Sales Today Revenue"
              amount={todayData.totalSales.toLocaleString('en-IN')}
              data={todayData.employees}
              type="sales"
            />
            
            <HierarchicalChart
              title="Trainers Today Revenue"
              amount={todayData.totalTrainers.toLocaleString('en-IN')}
              data={todayData.trainers}
              type="trainers"
            />
          </div>
          
          <div className="charts-grid">
            <HierarchicalChart
              title="Sales Revenue"
              amount={monthlyData.totalSales.toLocaleString('en-IN')}
              period="This Month"
              data={monthlyData.employees}
              type="sales"
            />
            
            <HierarchicalChart
              title="Trainers Revenue"
              amount={monthlyData.totalTrainers.toLocaleString('en-IN')}
              period="This Month"
              data={monthlyData.trainers}
              type="trainers"
            />
          </div>
        </div>

        {/* Existing Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-5 w-full">
          <div className="col-span-3">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-5">
              {firstSectionGraphs.map((item, index) => (
                <div className="bg-secondary-accent-color panel shadow-xl rounded-md col-span-2 h-[300px] p-2" key={index}>
                  {item.comp}
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-3 lg:col-span-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-[400px] lg:h-full">
              {Array(4)
                .fill('')
                .map((item, index) => (
                  <div className="bg-secondary-accent-color panel shadow-xl rounded-md col-span-1" key={index}></div>
                ))}
            </div>
          </div>
          <div className="bg-secondary-accent-color panel shadow-xl rounded-md col-span-3 h-[400px] p-2">
            <Bargraph />
          </div>
          <div className="bg-secondary-accent-color panel shadow-xl rounded-md col-span-3  md:col-span-1 h-[400px] md:h-full">
            <PieChartGraph />
          </div>
          <div className="bg-secondary-accent-color panel shadow-xl rounded-md col-span-3 h-[200px] mb-5"></div>
        </div>
      {/* ) : (
        <GraphDash />
      )} */}
    </div>
  );
}

export default Dashboard;


