
import "./styles.scss";

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <h1 className="db-title">Dashboard</h1>
        {/* RIGHT SIDE SMALL STATS CARDS */}
        <div className="stats-grid">
          {[1,2,3,4].map((i) => (
            <div className="mini-card" key={i}>
              <h3>{i===1 ? "₹19.8 Mn" : i===2 ? "12k" : i===3 ? "12,983" : "$20,187"}</h3>
              <p className="label">{i===1 ? "Total Earning" : i===2 ? "New Bookings" : i===3 ? "New Users" : "Profitable order"}</p>
              <p className="green">+2.5% ↑</p>
              <small>Compared to ($27186 Last Year)</small>
            </div>
          ))}
        </div>
   
    </div>
  );
}

export default Dashboard;