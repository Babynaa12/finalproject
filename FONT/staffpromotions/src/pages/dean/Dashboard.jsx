import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    applications: 0,
    pending: 0,
    under_review: 0,
    rejected: 0,
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchDashboard();
    fetchApplications();
  }, []);

  // =========================================================
  // FETCH DEAN DASHBOARD
  // =========================================================

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard-stats/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(
        response.data.summary || {
          applications: 0,
          pending: 0,
          under_review: 0,
          rejected: 0,
        }
      );
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to load dashboard statistics.");
      }
    }
  };

  // =========================================================
  // FETCH APPLICATIONS
  // =========================================================

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/promotion-applications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data || []);
    } catch (err) {
      console.error("Applications error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to load applications.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REVIEW APPLICATION
  // =========================================================

  const handleReview = (applicationId) => {
    navigate(`/dean/applications/${applicationId}`);
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =========================================================
  // FORMAT RECOMMENDATION
  // =========================================================

  const formatRecommendation = (recommendation) => {
    if (!recommendation) return "Pending";

    return recommendation
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Dean Dashboard</h1>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="page-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <h1>Dean Dashboard</h1>

        <p>
          Academic Staff Promotion Management
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="dashboard-cards">

        {/* PENDING */}

        <div className="dashboard-card">
          <h3>Pending Applications</h3>

          <p>
            {summary.pending || 0}
          </p>

          <span>
            Awaiting Dean Review
          </span>
        </div>

        {/* UNDER REVIEW */}

        <div className="dashboard-card">
          <h3>Under Review</h3>

          <p>
            {summary.under_review || 0}
          </p>

          <span>
            Currently being reviewed
          </span>
        </div>

        {/* TOTAL */}

        <div className="dashboard-card">
          <h3>Total Applications</h3>

          <p>
            {summary.applications || 0}
          </p>

          <span>
            Applications assigned to Dean
          </span>
        </div>

        {/* REJECTED */}

        <div className="dashboard-card">
          <h3>Rejected</h3>

          <p>
            {summary.rejected || 0}
          </p>

          <span>
            Not recommended
          </span>
        </div>

      </div>

      {/* =====================================================
          APPLICATION OVERVIEW
      ===================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>Recent Applications</h2>

            <p>
              Promotion applications requiring Dean attention
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() => navigate("/dean/applications")}
          >
            View All
          </button>

        </div>

        {applications.length === 0 ? (

          <div className="empty-state">
            <p>No promotion applications found.</p>
          </div>

        ) : (

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>Department</th>
                  <th>Applied Rank</th>
                  <th>HOD Recommendation</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {applications
                  .slice(0, 10)
                  .map((application) => (

                    <tr key={application.id}>

                      {/* APPLICATION ID */}

                      <td>
                        APP-{String(application.id).padStart(3, "0")}
                      </td>

                      {/* APPLICANT */}

                      <td>
                        {application.employee_name ||
                          application.employee?.name ||
                          application.employee?.username ||
                          "N/A"}
                      </td>

                      {/* DEPARTMENT */}

                      <td>
                        {application.department_name ||
                          application.employee?.department ||
                          "N/A"}
                      </td>

                      {/* TARGET RANK */}

                      <td>
                        {application.targeted_title_name ||
                          application.targeted_title?.title_name ||
                          application.targeted_title ||
                          "N/A"}
                      </td>

                      {/* HOD RECOMMENDATION */}

                      <td>
                        {formatRecommendation(
                          application.hod_recommendation
                        )}
                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${String(
                            application.status || ""
                          ).toLowerCase()}`}
                        >
                          {formatStatus(application.status)}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          className="review-btn"
                          onClick={() =>
                            handleReview(application.id)
                          }
                        >
                          Review
                        </button>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="dashboard-section">

        <h2>Quick Actions</h2>

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/dean/applications")
            }
          >
            View Applications
          </button>

          <button
            onClick={() =>
              navigate("/dean/applications?status=DEAN_REVIEW")
            }
          >
            Review Pending
          </button>

          <button
            onClick={() =>
              navigate("/dean/promotion-history")
            }
          >
            Promotion History
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;

