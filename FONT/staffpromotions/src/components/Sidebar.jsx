import "../styles/Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserPlus,
  FaFolderOpen,
  FaHistory,
  FaBell,
  FaUser,
  FaUsers,
  FaChartBar,
  FaClipboardList,
  FaClipboardCheck,
  FaCrown,
  FaSignOutAlt
} from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase();

  const menuItems = {
    staff: [
      { path: "/staff/dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/staff/apply", label: "Apply Promotion", icon: <FaUserPlus /> },
      { path: "/staff/my-applications", label: "My Applications", icon: <FaFolderOpen /> },
      { path: "/staff/history", label: "History", icon: <FaHistory /> },
      { path: "/staff/notifications", label: "Notifications", icon: <FaBell /> },
      { path: "/staff/profile", label: "Profile", icon: <FaUser /> },
    ],

    manager: [
      { path: "/manager/dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/manager/employees", label: "Employees", icon: <FaUsers /> },
      { path: "/manager/appraisals", label: "Appraisals", icon: <FaClipboardCheck /> },
      { path: "/manager/reviews", label: "Reviews", icon: <FaClipboardList /> },
      { path: "/manager/reports", label: "Reports", icon: <FaChartBar /> },
    ],

    hr: [
      { path: "/hr/dashboard", label: "Dashboard", icon: <FaCrown /> },
      { path: "/hr/employees", label: "Employees", icon: <FaUsers /> },
      { path: "/hr/applications", label: "Applications", icon: <FaFolderOpen /> },
      { path: "/hr/reports", label: "Reports", icon: <FaChartBar /> },
      { path: "/hr/notifications", label: "Notifications", icon: <FaBell /> },
      { path: "/hr/history", label: "Promotion History", icon: <FaHistory /> },
    ],
  };

  // =========================
  // LOGOUT FUNCTION
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="sidebar">

      {/* HEADER */}
      <div className="sidebar-header">
        <h2>Promotion System</h2>
        <p className="role-badge">{role}</p>
      </div>

      {/* MENU */}
      <ul className="sidebar-menu">
        {menuItems[role]?.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* LOGOUT SECTION */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {!menuItems[role] && (
        <p className="no-role">No menu for role: {role}</p>
      )}
    </div>
  );
}

export default Sidebar;