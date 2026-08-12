import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {

  const location = useLocation();

  // ============================================================
  // GET AUTHENTICATION DATA
  // ============================================================

  const token = localStorage.getItem("token");
  const accessToken = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user");

  // ============================================================
  // CHECK LOGIN
  // ============================================================

  if (!token && !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ============================================================
  // GET USER
  // ============================================================

  let user = null;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error("Invalid user data:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================================================
  // GET ROLE
  // ============================================================

  const role = String(
    user?.role || localStorage.getItem("role") || ""
  )
    .trim()
    .toUpperCase();

  // ============================================================
  // USER MUST HAVE ROLE
  // ============================================================

  if (!role) {

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================================================
  // CHECK ROLE PERMISSION
  // ============================================================

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {

    // ==========================================================
    // SEND USER TO THEIR OWN DASHBOARD
    // ==========================================================

    const dashboards = {

      STAFF: "/staff/dashboard",

      STUDENT: "/student/dashboard",

      HOD: "/hod/dashboard",

      DEAN: "/dean/dashboard",

      REVIEWER: "/reviewer/dashboard",

    };

    return (
      <Navigate
        to={dashboards[role] || "/login"}
        replace
      />
    );
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================

  return children;
}

export default ProtectedRoute;