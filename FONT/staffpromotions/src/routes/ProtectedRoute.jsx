import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  // ============================================================
  // GET AUTH DATA
  // ============================================================

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  const storedUser = localStorage.getItem("user");
  const storedRole = localStorage.getItem("role");

  // ============================================================
  // DASHBOARDS
  // ============================================================

  const dashboards = {
    STAFF: "/staff/dashboard",
    STUDENT: "/student/dashboard",
    HOD: "/hod/dashboard",
    DEAN: "/dean/dashboard",
    REVIEWER: "/reviewer/dashboard",
  };

  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ============================================================
  // READ USER
  // ============================================================

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user JSON:", error);
    }
  }

  // ============================================================
  // GET ROLE
  // ============================================================

  const role = String(
    user?.role ||
      user?.user_role ||
      user?.userRole ||
      storedRole ||
      ""
  )
    .trim()
    .toUpperCase();

  // ============================================================
  // ROLE NOT AVAILABLE
  // ============================================================

  if (!role) {
    console.error("Authenticated user has no role.");

    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "Arial",
        }}
      >
        <h2>Authorization Error</h2>

        <p>
          Your account is logged in, but no user role was found.
        </p>

        <p>
          Please logout and login again.
        </p>
      </div>
    );
  }

  // ============================================================
  // CHECK AUTHORIZATION
  // ============================================================

  const normalizedAllowedRoles = allowedRoles.map((item) =>
    String(item).trim().toUpperCase()
  );

  const isAuthorized =
    normalizedAllowedRoles.length === 0 ||
    normalizedAllowedRoles.includes(role);

  // ============================================================
  // LOGGED IN BUT NOT AUTHORIZED
  // ============================================================

  if (!isAuthorized) {
    const dashboard = dashboards[role];

    if (dashboard) {
      return (
        <Navigate
          to={dashboard}
          replace
          state={{
            unauthorized: true,
            attemptedPath: location.pathname,
          }}
        />
      );
    }

    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "Arial",
        }}
      >
        <h2>Access Denied</h2>
        <p>You are not authorized to access this page.</p>
      </div>
    );
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================

  return children;
}

export default ProtectedRoute;