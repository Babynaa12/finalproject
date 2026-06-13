import "../styles/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Promotion System</h2>

      <ul>
        <Link to="/staff/Dashboard">Dashboard</Link>
        <Link to="/staff/apply">Apply Promotion</Link>
        <Link to="/staff/my-applications">My Applications</Link>
        <Link to="/staff/history">History</Link>
        <Link to="/staff/notifications">Notifications</Link>
        <Link to="/staff/profile">Profile</Link>
      </ul>
    </div>
  );
}

export default Sidebar;