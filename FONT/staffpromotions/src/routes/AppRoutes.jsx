import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";

import StaffLayout from "../layouts/StaffLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import HRLayout from "../layouts/HRLayout";

/* STAFF */
import StaffDashboard from "../pages/staff/Dashboard";
import ApplyPromotion from "../pages/staff/ApplyPromotion";
import MyApplications from "../pages/staff/MyApplications";
import StaffPromotionHistory from "../pages/staff/PromotionHistory";
import StaffNotifications from "../pages/staff/Notifications";
import Profile from "../pages/staff/Profile";

/* MANAGER */
import ManagerDashboard from "../pages/manager/Dashboard";
import Appraisals from "../pages/manager/Appraisals";
import ManagerEmployees from "../pages/manager/Employees";
import ManagerReports from "../pages/manager/Reports";
import ManagerReviews from "../pages/manager/Reviews";

/* HR */
import HRDashboard from "../pages/hr/Dashboard";
import Applications from "../pages/hr/Applications";
import HREmployees from "../pages/hr/Employees";
import HRReports from "../pages/hr/Reports";
import HRNotifications from "../pages/hr/Notifications";
import HRPromotionHistory from "../pages/hr/PromotionHistory";

function AppRoutes() {
  return (
    <Routes>
      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      {/* STAFF REDIRECT */}
      <Route
        path="/staff"
        element={<Navigate to="/staff/dashboard" replace />}
      />

      {/* STAFF ROUTES */}
      <Route
        path="/staff/dashboard"
        element={
          <StaffLayout>
            <StaffDashboard />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/apply"
        element={
          <StaffLayout>
            <ApplyPromotion />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/my-applications"
        element={
          <StaffLayout>
            <MyApplications />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/history"
        element={
          <StaffLayout>
            <StaffPromotionHistory />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/notifications"
        element={
          <StaffLayout>
            <StaffNotifications />
          </StaffLayout>
        }
      />

      <Route
        path="/staff/profile"
        element={
          <StaffLayout>
            <Profile />
          </StaffLayout>
        }
      />

      {/* MANAGER REDIRECT */}
      <Route
        path="/manager"
        element={<Navigate to="/manager/dashboard" replace />}
      />

      {/* MANAGER ROUTES */}
      <Route
        path="/manager/dashboard"
        element={
          <ManagerLayout>
            <ManagerDashboard />
          </ManagerLayout>
        }
      />

      <Route
        path="/manager/employees"
        element={
          <ManagerLayout>
            <ManagerEmployees />
          </ManagerLayout>
        }
      />

      <Route
        path="/manager/appraisals"
        element={
          <ManagerLayout>
            <Appraisals />
          </ManagerLayout>
        }
      />

      <Route
        path="/manager/reviews"
        element={
          <ManagerLayout>
            <ManagerReviews />
          </ManagerLayout>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ManagerLayout>
            <ManagerReports />
          </ManagerLayout>
        }
      />

      {/* HR REDIRECT */}
      <Route
        path="/hr"
        element={<Navigate to="/hr/dashboard" replace />}
      />

      {/* HR ROUTES */}
      <Route
        path="/hr/dashboard"
        element={
          <HRLayout>
            <HRDashboard />
          </HRLayout>
        }
      />

      <Route
        path="/hr/applications"
        element={
          <HRLayout>
            <Applications />
          </HRLayout>
        }
      />

      <Route
        path="/hr/employees"
        element={
          <HRLayout>
            <HREmployees />
          </HRLayout>
        }
      />

      <Route
        path="/hr/reports"
        element={
          <HRLayout>
            <HRReports />
          </HRLayout>
        }
      />

      <Route
        path="/hr/notifications"
        element={
          <HRLayout>
            <HRNotifications />
          </HRLayout>
        }
      />

      <Route
        path="/hr/history"
        element={
          <HRLayout>
            <HRPromotionHistory />
          </HRLayout>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;