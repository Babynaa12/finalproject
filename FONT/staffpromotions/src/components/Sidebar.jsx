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
  FaGraduationCap,
  FaUniversity,
  FaSearch,
  FaSignOutAlt,
  FaFileAlt,
  FaChalkboardTeacher,
} from "react-icons/fa";


function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // GET LOGGED-IN USER
  // ============================================================

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  const role = String(user?.role || "")
    .trim()
    .toUpperCase();


  // ============================================================
  // MENU ITEMS
  // ============================================================

  const menuItems = {

    // ==========================================================
    // STAFF
    // ==========================================================

    STAFF: [

      {
        path: "/staff/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
      },

      {
        path: "/staff/apply",
        label: "Apply Promotion",
        icon: <FaUserPlus />,
      },

      {
        path: "/staff/my-applications",
        label: "My Applications",
        icon: <FaFolderOpen />,
      },

      {
        path: "/staff/history",
        label: "Promotion History",
        icon: <FaHistory />,
      },

      {
        path: "/staff/appeals",
        label: "Appeals",
        icon: <FaFileAlt />,
      },

      {
        path: "/staff/notifications",
        label: "Notifications",
        icon: <FaBell />,
      },

      {
        path: "/staff/profile",
        label: "Profile",
        icon: <FaUser />,
      },

    ],


    // ==========================================================
    // STUDENT
    // ==========================================================

    STUDENT: [

      {
        path: "/student/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
      },

      {
        path: "/student/teaching-evaluation",
        label: "Teaching Evaluation",
        icon: <FaChalkboardTeacher />,
      },

      {
        path: "/student/evaluation-history",
        label: "Evaluation History",
        icon: <FaHistory />,
      },

      {
        path: "/student/profile",
        label: "Profile",
        icon: <FaUser />,
      },

    ],


    // ==========================================================
    // HOD
    // ==========================================================

    HOD: [

      {
        path: "/hod/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
      },

      {
        path: "/hod/applications",
        label: "Applications",
        icon: <FaFolderOpen />,
      },

      {
        path: "/hod/reviews",
        label: "Reviews",
        icon: <FaClipboardCheck />,
      },

      {
        path: "/hod/employees",
        label: "Employees",
        icon: <FaUsers />,
      },

      {
        path: "/hod/reports",
        label: "Reports",
        icon: <FaChartBar />,
      },

    ],


    // ==========================================================
    // DEAN
    // ==========================================================

    DEAN: [

      {
        path: "/dean/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
      },

      {
        path: "/dean/applications",
        label: "Applications",
        icon: <FaFolderOpen />,
      },

      {
        path: "/dean/reviews",
        label: "Reviews",
        icon: <FaClipboardCheck />,
      },

      {
        path: "/dean/reports",
        label: "Reports",
        icon: <FaChartBar />,
      },

    ],


    // ==========================================================
    // REVIEWER
    // ==========================================================

    REVIEWER: [

      {
        path: "/reviewer/dashboard",
        label: "Dashboard",
        icon: <FaHome />,
      },

      {
        path: "/reviewer/assigned-reviews",
        label: "Assigned Reviews",
        icon: <FaClipboardList />,
      },

      {
        path: "/reviewer/completed-reviews",
        label: "Completed Reviews",
        icon: <FaHistory />,
      },

      {
        path: "/reviewer/profile",
        label: "Profile",
        icon: <FaUser />,
      },

    ],

  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });

  };


  // ============================================================
  // ROLE NAME
  // ============================================================

  const roleNames = {

    STAFF: "Academic Staff",

    STUDENT: "Student",

    HOD: "Head of Department",

    DEAN: "Dean",

    REVIEWER: "Reviewer",

  };


  // ============================================================
  // CURRENT MENU
  // ============================================================

  const currentMenu = menuItems[role] || [];


  // ============================================================
  // SIDEBAR
  // ============================================================

  return (

    <aside className="sidebar">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="sidebar-header">

        <div className="sidebar-logo-icon">
          <FaUniversity />
        </div>

        <div>

          <h2>
            Promotion System
          </h2>

          <p className="role-badge">
            {roleNames[role] || role || "User"}
          </p>

        </div>

      </div>


      {/* ======================================================
          USER INFORMATION
      ====================================================== */}

      <div className="sidebar-user">

        <div className="user-avatar">
          {user?.first_name?.charAt(0)?.toUpperCase() ||
            user?.username?.charAt(0)?.toUpperCase() ||
            "U"}
        </div>

        <div className="user-info">

          <strong>
            {user?.name ||
              `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
              user?.username ||
              "User"}
          </strong>

          <span>
            {roleNames[role] || role}
          </span>

        </div>

      </div>


      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="sidebar-navigation">

        <p className="menu-title">
          MAIN MENU
        </p>

        <ul className="sidebar-menu">

          {currentMenu.map((item) => (

            <li key={item.path}>

              <Link
                to={item.path}
                className={
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
              >

                <span className="icon">
                  {item.icon}
                </span>

                <span className="link-label">
                  {item.label}
                </span>

              </Link>

            </li>

          ))}

        </ul>

      </nav>


      {/* ======================================================
          LOGOUT
      ====================================================== */}

      <div className="logout-section">

        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <FaSignOutAlt />

          <span>
            Logout
          </span>

        </button>

      </div>


      {/* ======================================================
          NO ROLE
      ====================================================== */}

      {!menuItems[role] && (

        <div className="no-role">

          <p>
            No menu available for this role.
          </p>

        </div>

      )}

    </aside>

  );

}


export default Sidebar;