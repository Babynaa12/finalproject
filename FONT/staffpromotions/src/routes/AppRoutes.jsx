import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import StaffLayout from "../layouts/StaffLayout";

import Dashboard from "../pages/staff/Dashboard";
import ApplyPromotion from "../pages/staff/ApplyPromotion";
import MyApplications from "../pages/staff/MyApplications";
import PromotionHistory from "../pages/staff/PromotionHistory";
import Notifications from "../pages/staff/Notifications";
import Profile from "../pages/staff/Profile";

function AppRoutes() {
  return (
    <Routes>

      {/* DEFAULT ROUTE */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      {/* STAFF */}
      <Route path="/staff/Dashboard" element={<StaffLayout><Dashboard /></StaffLayout>} />
      <Route path="/staff/apply" element={<StaffLayout><ApplyPromotion /></StaffLayout>} />
      <Route path="/staff/my-applications" element={<StaffLayout><MyApplications /></StaffLayout>} />
      <Route path="/staff/history" element={<StaffLayout><PromotionHistory /></StaffLayout>} />
      <Route path="/staff/notifications" element={<StaffLayout><Notifications /></StaffLayout>} />
      <Route path="/staff/profile" element={<StaffLayout><Profile /></StaffLayout>} />



    </Routes>
  );
}

export default AppRoutes;