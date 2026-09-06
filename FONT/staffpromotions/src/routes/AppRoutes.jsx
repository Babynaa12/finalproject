import { Routes, Route, Navigate } from "react-router-dom";

// ============================================================
// AUTH
// ============================================================

import Login from "../pages/auth/Login";

// ============================================================
// PROTECTED ROUTE
// ============================================================

import ProtectedRoute from "./ProtectedRoute";

// ============================================================
// LAYOUTS
// ============================================================

import StaffLayout from "../layouts/StaffLayout";
import StudentLayout from "../layouts/StudentLayout";
import HODLayout from "../layouts/HODLayout";
import DeanLayout from "../layouts/DeanLayout";
import ReviewerLayout from "../layouts/ReviewerLayout";

// ============================================================
// STAFF PAGES
// ============================================================

import StaffDashboard from "../pages/staff/Dashboard";
import ApplyPromotion from "../pages/staff/ApplyPromotion";
import MyApplications from "../pages/staff/MyApplications";
import StaffApplicationDetail from "../pages/staff/ApplicationDetail";
import StaffPromotionHistory from "../pages/staff/PromotionHistory";
import StaffNotifications from "../pages/staff/Notifications";
import StaffProfile from "../pages/staff/Profile";
import StaffAppeal from "../pages/staff/Appeal";
import StaffPeerReviews from "../pages/staff/PeerReviews";
import StaffPromotionMaterial from "../pages/staff/PromotionMaterial";
import StaffStudentEvaluations from "../pages/staff/StudentEvaluations";

// ============================================================
// STUDENT PAGES
// ============================================================

import StudentDashboard from "../pages/student/Dashboard";
import StudentEvaluationHistory from "../pages/student/EvaluationHistory";
import StudentProfile from "../pages/student/Profile";
import StudentTeachingEvaluations from "../pages/student/TeachingEvaluations";

// ============================================================
// HOD PAGES
// ============================================================

import HODDashboard from "../pages/hod/Dashboard";
import HODApplication from "../pages/hod/Application";
import HODApplicationDetail from "../pages/hod/ApplicationDetail";
import HODHistory from "../pages/hod/History";
import HODReviewApplication from "../pages/hod/ReviewApplication";
import HODNotificationPage from "../pages/common/RoleNotifications";
import HODStaff from "../pages/hod/Staff";

// ============================================================
// DEAN PAGES
// ============================================================

import DeanDashboard from "../pages/dean/Dashboard";
import DeanApplication from "../pages/dean/Application";
import DeanApplicationDetail from "../pages/dean/ApplicationDetail";
import DeanHistory from "../pages/dean/History";
import DeanReviewApplication from "../pages/dean/ReviewApplication";
import DeanNotificationPage from "../pages/common/RoleNotifications";

// ============================================================
// REVIEWER PAGES
// IMPORTANT: folder is "reviewer" exactly as your tree shows
// ============================================================

import ReviewerDashboard from "../pages/reviewer/Dashboard";
import ReviewerAssignedReview from "../pages/reviewer/AssignedReview";
import ReviewerCompleteReviews from "../pages/reviewer/CompleteReviews";
import ReviewerProfile from "../pages/reviewer/Profile";
import ReviewerReviewMaterial from "../pages/reviewer/ReviewMaterial";
import ReviewerNotificationPage from "../pages/common/RoleNotifications";


// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
          DEFAULT
      ====================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ======================================================
          LOGIN
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ======================================================
          STAFF
      ====================================================== */}

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <Navigate
              to="/staff/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />


      {/* STAFF DASHBOARD */}

      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffDashboard />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLY PROMOTION */}

      <Route
        path="/staff/apply"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <ApplyPromotion />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* MY APPLICATIONS */}

      <Route
        path="/staff/my-applications"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <MyApplications />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLICATION DETAIL */}

      <Route
        path="/staff/application/:id"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffApplicationDetail />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* PROMOTION HISTORY */}

      <Route
        path="/staff/history"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffPromotionHistory />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* NOTIFICATIONS */}

      <Route
        path="/staff/notifications"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffNotifications />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* PROFILE */}

      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffProfile />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* APPEAL */}

      <Route
        path="/staff/appeal"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffAppeal />
            </StaffLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/appeals"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffAppeal />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* PEER REVIEWS */}

      <Route
        path="/staff/peer-reviews"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffPeerReviews />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* PROMOTION MATERIAL */}

      <Route
        path="/staff/promotion-material"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffPromotionMaterial />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* STUDENT EVALUATIONS */}

      <Route
        path="/staff/student-evaluations"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffLayout>
              <StaffStudentEvaluations />
            </StaffLayout>
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          STUDENT
      ====================================================== */}

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Navigate
              to="/student/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />


      {/* STUDENT DASHBOARD */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        }
      />


      {/* TEACHING EVALUATIONS */}

      <Route
        path="/student/teaching-evaluations"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout>
              <StudentTeachingEvaluations />
            </StudentLayout>
          </ProtectedRoute>
        }
      />


      {/* EVALUATION HISTORY */}

      <Route
        path="/student/evaluation-history"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout>
              <StudentEvaluationHistory />
            </StudentLayout>
          </ProtectedRoute>
        }
      />


      {/* STUDENT PROFILE */}

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout>
              <StudentProfile />
            </StudentLayout>
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          HOD
      ====================================================== */}

      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <Navigate
              to="/hod/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />


      {/* HOD DASHBOARD */}

      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODDashboard />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLICATIONS */}

      <Route
        path="/hod/applications"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODApplication />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLICATION DETAIL */}

      <Route
        path="/hod/application/:id"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODApplicationDetail />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* REVIEW APPLICATION */}

      <Route
        path="/hod/review/:id"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODReviewApplication />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* STAFF */}

      <Route
        path="/hod/staff"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODStaff />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* HISTORY */}

      <Route
        path="/hod/history"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODHistory />
            </HODLayout>
          </ProtectedRoute>
        }
      />

      {/* NOTIFICATIONS */}

      <Route
        path="/hod/notifications"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <HODLayout>
              <HODNotificationPage role="HOD" />
            </HODLayout>
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          DEAN
      ====================================================== */}

      <Route
        path="/dean"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <Navigate
              to="/dean/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />


      {/* DEAN DASHBOARD */}

      <Route
        path="/dean/dashboard"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanDashboard />
            </DeanLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLICATIONS */}

      <Route
        path="/dean/applications"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanApplication />
            </DeanLayout>
          </ProtectedRoute>
        }
      />


      {/* APPLICATION DETAIL */}

      <Route
        path="/dean/application/:id"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanApplicationDetail />
            </DeanLayout>
          </ProtectedRoute>
        }
      />


      {/* REVIEW APPLICATION */}

      <Route
        path="/dean/review/:id"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanReviewApplication />
            </DeanLayout>
          </ProtectedRoute>
        }
      />


      {/* HISTORY */}

      <Route
        path="/dean/history"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanHistory />
            </DeanLayout>
          </ProtectedRoute>
        }
      />

      {/* NOTIFICATIONS */}

      <Route
        path="/dean/notifications"
        element={
          <ProtectedRoute allowedRoles={["DEAN"]}>
            <DeanLayout>
              <DeanNotificationPage role="DEAN" />
            </DeanLayout>
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          REVIEWER
      ====================================================== */}

      <Route
        path="/reviewer"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <Navigate
              to="/reviewer/dashboard"
              replace
            />
          </ProtectedRoute>
        }
      />


      {/* REVIEWER DASHBOARD */}

      <Route
        path="/reviewer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerDashboard />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />


      {/* ASSIGNED REVIEWS */}

      <Route
        path="/reviewer/assigned-reviews"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerAssignedReview />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />


      {/* REVIEW MATERIAL */}

      <Route
        path="/reviewer/review/:id"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerReviewMaterial />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />


      {/* COMPLETED REVIEWS */}

      <Route
        path="/reviewer/completed-reviews"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerCompleteReviews />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />


      {/* REVIEWER PROFILE */}

      <Route
        path="/reviewer/profile"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerProfile />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />

      {/* NOTIFICATIONS */}

      <Route
        path="/reviewer/notifications"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerLayout>
              <ReviewerNotificationPage role="REVIEWER" />
            </ReviewerLayout>
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default AppRoutes;