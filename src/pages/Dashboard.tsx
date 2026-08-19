import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCards from "../components/dashboard/StatsCards";
import RecentInterviews from "../components/dashboard/RecentInterviews";
import PerformanceChart from "../components/dashboard/PerformanceChart";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1">

        <Topbar />

        <div className="space-y-8 p-8">

          {/* Statistics */}
          <StatsCards />

          {/* Performance Chart */}
          <PerformanceChart />

          {/* Recent Interviews */}
          <RecentInterviews />

        </div>

      </main>

    </div>
  );
};

export default Dashboard;