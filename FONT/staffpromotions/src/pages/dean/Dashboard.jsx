// # Dean Dashboard.jsx

// ```jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaArrowRight,
  FaSpinner,
  FaSyncAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  // ============================================================
  // NORMALIZE
  // ============================================================

  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/-/g, " ");
  };

  // ============================================================
  // FETCH APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DEAN - ALL APPLICATIONS:", response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.results)) {
        data = response.data.results;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data?.applications)) {
        data = response.data.applications;
      }

      console.log("DEAN - PARSED APPLICATIONS:", data);

      setApplications(data);
    } catch (err) {
      console.error(
        "DEAN DASHBOARD ERROR:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");

        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access Dean applications."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Unable to load promotion applications."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // APPLICATION STATUS
  // ============================================================

  const getApplicationStatus = (app) => {
    return normalize(
      app?.final_status ||
        app?.status ||
        app?.application_status ||
        app?.workflow_status
    );
  };

  // ============================================================
  // HOD RECOMMENDATION
  // ============================================================

  const getHodRecommendation = (app) => {
    return normalize(
      app?.hod_recommendation ||
        app?.hod_status ||
        app?.recommendation
    );
  };

  // ============================================================
  // DEAN RECOMMENDATION
  // ============================================================

  const getDeanRecommendation = (app) => {
    return normalize(
      app?.dean_recommendation ||
        app?.dean_status
    );
  };

  // ============================================================
  // CHECK IF HOD HAS FINISHED
  // ============================================================

  const hodCompleted = (app) => {
    const recommendation = getHodRecommendation(app);

    return [
      "recommended",
      "recommend",
      "approved",
      "accepted",
      "not recommended",
      "not recommend",
      "rejected",
      "declined",
    ].includes(recommendation);
  };

  // ============================================================
  // CHECK IF REJECTED
  // ============================================================

  const isRejected = (app) => {
    const status = getApplicationStatus(app);

    const hodRecommendation = getHodRecommendation(app);
    const deanRecommendation = getDeanRecommendation(app);

    return (
      status === "rejected" ||
      status === "not recommended" ||
      status === "declined" ||
      hodRecommendation === "rejected" ||
      hodRecommendation === "not recommended" ||
      hodRecommendation === "not recommend" ||
      deanRecommendation === "rejected" ||
      deanRecommendation === "not recommended"
    );
  };

  // ============================================================
  // CHECK IF DEAN HAS COMPLETED
  // ============================================================

  const deanCompleted = (app) => {
    const recommendation = getDeanRecommendation(app);

    return [
      "recommended",
      "recommend",
      "approved",
      "accepted",
      "not recommended",
      "not recommend",
      "rejected",
      "declined",
    ].includes(recommendation);
  };

  // ============================================================
  // APPLICATIONS REQUIRING DEAN ATTENTION
  //
  // Main rule:
  //
  // HOD must have completed recommendation
  // AND Dean has not completed recommendation.
  //
  // ============================================================

  const deanPendingApplications = useMemo(() => {
    return applications.filter((app) => {
      if (isRejected(app)) {
        return false;
      }

      const hodFinished = hodCompleted(app);
      const deanFinished = deanCompleted(app);

      return hodFinished && !deanFinished;
    });
  }, [applications]);

  // ============================================================
  // UNDER DEAN REVIEW
  // ============================================================

  const deanUnderReview = useMemo(() => {
    return applications.filter((app) => {
      const status = getApplicationStatus(app);
      const deanRecommendation = getDeanRecommendation(app);

      return (
        !deanRecommendation &&
        (
          status === "dean review" ||
          status === "dean reviewing" ||
          status === "under dean review" ||
          status === "dean_review"
        )
      );
    });
  }, [applications]);

  // ============================================================
  // RECOMMENDED BY DEAN
  // ============================================================

  const deanRecommended = useMemo(() => {
    return applications.filter((app) => {
      const recommendation = getDeanRecommendation(app);

      return (
        recommendation === "recommended" ||
        recommendation === "recommend" ||
        recommendation === "approved" ||
        recommendation === "accepted"
      );
    });
  }, [applications]);

  // ============================================================
  // REJECTED
  // ============================================================

  const rejectedApplications = useMemo(() => {
    return applications.filter((app) => {
      return isRejected(app);
    });
  }, [applications]);

  // ============================================================
  // TOTAL APPLICATIONS
  // ============================================================

  const totalApplications = applications.length;

  // ============================================================
  // PENDING DEAN
  // ============================================================

  const pendingApplications =
    deanPendingApplications.length;

  // ============================================================
  // UNDER REVIEW
  // ============================================================

  const underReview =
    deanUnderReview.length;

  // ============================================================
  // RECOMMENDED
  // ============================================================

  const recommended =
    deanRecommended.length;

  // ============================================================
  // REJECTED
  // ============================================================

  const rejected =
    rejectedApplications.length;

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    return (
      app?.employee_name ||
      app?.applicant_name ||
      app?.full_name ||
      app?.employee?.full_name ||
      app?.employee?.name ||
      app?.employee?.username ||
      app?.user?.full_name ||
      app?.user?.name ||
      app?.user?.username ||
      "Unknown Applicant"
    );
  };

  // ============================================================
  // DEPARTMENT
  // ============================================================

  const getDepartment = (app) => {
    return (
      app?.department_name ||
      app?.department?.name ||
      app?.employee?.department_name ||
      app?.employee?.department?.name ||
      app?.employee?.department ||
      "—"
    );
  };

  // ============================================================
  // CURRENT POSITION
  // ============================================================

  const getCurrentPosition = (app) => {
    return (
      app?.current_title_name ||
      app?.current_position_name ||
      app?.current_position ||
      app?.current_title?.title_name ||
      app?.current_title?.name ||
      app?.employee?.current_position ||
      app?.employee?.position ||
      "—"
    );
  };

  // ============================================================
  // TARGET POSITION
  // ============================================================

  const getTargetPosition = (app) => {
    return (
      app?.targeted_title_name ||
      app?.target_position_name ||
      app?.target_position ||
      app?.target_title ||
      app?.position_applied_for_name ||
      app?.position_applied_for?.title_name ||
      app?.position_applied_for?.name ||
      "—"
    );
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // STATUS TEXT
  // ============================================================

  const formatStatus = (value) => {
    if (!value) {
      return "Pending";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (app) => {
    const status = getApplicationStatus(app);

    const deanRecommendation =
      getDeanRecommendation(app);

    if (
      isRejected(app)
    ) {
      return (
        <span style={styles.rejectedBadge}>
          <FaTimesCircle />
          Rejected
        </span>
      );
    }

    if (
      deanRecommendation === "recommended" ||
      deanRecommendation === "recommend"
    ) {
      return (
        <span style={styles.approvedBadge}>
          <FaCheckCircle />
          Recommended
        </span>
      );
    }

    if (
      status === "dean review" ||
      status === "under dean review" ||
      status === "dean reviewing"
    ) {
      return (
        <span style={styles.reviewBadge}>
          <FaEye />
          Dean Review
        </span>
      );
    }

    if (hodCompleted(app)) {
      return (
        <span style={styles.pendingBadge}>
          <FaClock />
          Awaiting Dean
        </span>
      );
    }

    return (
      <span style={styles.pendingBadge}>
        <FaClock />
        Pending
      </span>
    );
  };

  // ============================================================
  // HOD RECOMMENDATION BADGE
  // ============================================================

  const getHodBadge = (app) => {
    const recommendation =
      getHodRecommendation(app);

    if (
      recommendation === "recommended" ||
      recommendation === "recommend" ||
      recommendation === "approved" ||
      recommendation === "accepted"
    ) {
      return (
        <span style={styles.approvedBadge}>
          <FaCheckCircle />
          Recommended
        </span>
      );
    }

    if (
      recommendation === "rejected" ||
      recommendation === "not recommended" ||
      recommendation === "not recommend" ||
      recommendation === "declined"
    ) {
      return (
        <span style={styles.rejectedBadge}>
          <FaTimesCircle />
          Not Recommended
        </span>
      );
    }

    return (
      <span style={styles.pendingBadge}>
        <FaClock />
        Pending
      </span>
    );
  };

  // ============================================================
  // RECENT APPLICATIONS
  //
  // Dean should primarily see applications that have
  // completed the HOD stage.
  //
  // ============================================================

  const recentApplications = useMemo(() => {
    return [...deanPendingApplications]
      .sort((a, b) => {
        const dateA = new Date(
          a?.created_at ||
            a?.submitted_at ||
            a?.application_date ||
            0
        );

        const dateB = new Date(
          b?.created_at ||
            b?.submitted_at ||
            b?.application_date ||
            0
        );

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [deanPendingApplications]);

  // ============================================================
  // REVIEW APPLICATION
  // ============================================================

  const handleReview = (applicationId) => {
    navigate(
      `/dean/applications/${applicationId}`
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <FaSpinner style={styles.spinner} />

          <h3 style={styles.loadingTitle}>
            Loading Dean Dashboard
          </h3>

          <p style={styles.loadingText}>
            Retrieving promotion applications...
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div style={styles.header}>

        <div>

          <div style={styles.breadcrumb}>
            Dean Portal / Dashboard
          </div>

          <h1 style={styles.title}>
            Dean Dashboard
          </h1>

          <p style={styles.subtitle}>
            Academic Staff Promotion Management
          </p>

        </div>

        <div style={styles.headerActions}>

          <button
            onClick={fetchApplications}
            disabled={refreshing}
            style={{
              ...styles.refreshButton,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <FaSyncAlt
              style={
                refreshing
                  ? styles.refreshIcon
                  : {}
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            onClick={() =>
              navigate("/dean/applications")
            }
            style={styles.applicationButton}
          >
            <FaClipboardList />
            View Applications
          </button>

        </div>

      </div>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div style={styles.errorBox}>

          <FaTimesCircle />

          <div style={{ flex: 1 }}>

            <strong>
              Dashboard Error
            </strong>

            <div style={styles.errorText}>
              {error}
            </div>

          </div>

          <button
            onClick={fetchApplications}
            style={styles.retryButton}
          >
            Retry
          </button>

        </div>
      )}

      {/* ========================================================
          WORKFLOW INFORMATION
      ======================================================== */}

      <div style={styles.workflowCard}>

        <div style={styles.workflowHeader}>

          <div>

            <h2 style={styles.workflowTitle}>
              Promotion Workflow
            </h2>

            <p style={styles.workflowSubtitle}>
              Applications move through the following
              approval stages.
            </p>

          </div>

          <span style={styles.workflowCurrent}>
            Dean Stage
          </span>

        </div>

        <div style={styles.workflow}>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircleDone}>
              ✓
            </div>
            <span>Submitted</span>
          </div>

          <div style={styles.workflowLineDone}></div>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircleDone}>
              ✓
            </div>
            <span>HOD</span>
          </div>

          <div style={styles.workflowLineActive}></div>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircleActive}>
              3
            </div>
            <strong>Dean</strong>
          </div>

          <div style={styles.workflowLine}></div>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircle}>
              4
            </div>
            <span>Reviewer</span>
          </div>

          <div style={styles.workflowLine}></div>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircle}>
              5
            </div>
            <span>Committee</span>
          </div>

          <div style={styles.workflowLine}></div>

          <div style={styles.workflowStep}>
            <div style={styles.workflowCircle}>
              6
            </div>
            <span>Final</span>
          </div>

        </div>

      </div>

      {/* ========================================================
          STATISTICS
      ======================================================== */}

      <div style={styles.cards}>

        {/* TOTAL */}

        <div style={styles.card}>

          <div
            style={{
              ...styles.iconBox,
              background: "#eef2ff",
              color: "#4f46e5",
            }}
          >
            <FaClipboardList />
          </div>

          <div>

            <p style={styles.cardTitle}>
              Total Applications
            </p>

            <h2 style={styles.number}>
              {totalApplications}
            </h2>

            <span style={styles.cardDescription}>
              Applications received
            </span>

          </div>

        </div>

        {/* PENDING */}

        <div style={styles.card}>

          <div
            style={{
              ...styles.iconBox,
              background: "#fff7ed",
              color: "#ea580c",
            }}
          >
            <FaClock />
          </div>

          <div>

            <p style={styles.cardTitle}>
              Pending Applications
            </p>

            <h2 style={styles.number}>
              {pendingApplications}
            </h2>

            <span style={styles.cardDescription}>
              Awaiting Dean Review
            </span>

          </div>

        </div>

        {/* UNDER REVIEW */}

        <div style={styles.card}>

          <div
            style={{
              ...styles.iconBox,
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <FaEye />
          </div>

          <div>

            <p style={styles.cardTitle}>
              Under Review
            </p>

            <h2 style={styles.number}>
              {underReview}
            </h2>

            <span style={styles.cardDescription}>
              Currently being reviewed
            </span>

          </div>

        </div>

        {/* RECOMMENDED */}

        <div style={styles.card}>

          <div
            style={{
              ...styles.iconBox,
              background: "#ecfdf5",
              color: "#16a34a",
            }}
          >
            <FaCheckCircle />
          </div>

          <div>

            <p style={styles.cardTitle}>
              Recommended
            </p>

            <h2 style={styles.number}>
              {recommended}
            </h2>

            <span style={styles.cardDescription}>
              Dean recommendations
            </span>

          </div>

        </div>

        {/* REJECTED */}

        <div style={styles.card}>

          <div
            style={{
              ...styles.iconBox,
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            <FaTimesCircle />
          </div>

          <div>

            <p style={styles.cardTitle}>
              Rejected
            </p>

            <h2 style={styles.number}>
              {rejected}
            </h2>

            <span style={styles.cardDescription}>
              Not recommended
            </span>

          </div>

        </div>

      </div>

      {/* ========================================================
          RECENT APPLICATIONS
      ======================================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>

          <div>

            <h2 style={styles.sectionTitle}>
              Applications Requiring Dean Attention
            </h2>

            <p style={styles.sectionSubtitle}>
              Promotion applications that have completed
              HOD review and are waiting for Dean action.
            </p>

          </div>

          <button
            style={styles.viewAll}
            onClick={() =>
              navigate("/dean/applications")
            }
          >
            View All
            <FaArrowRight />
          </button>

        </div>

        {/* TABLE */}

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  #
                </th>

                <th style={styles.th}>
                  Applicant
                </th>

                <th style={styles.th}>
                  Department
                </th>

                <th style={styles.th}>
                  Current Position
                </th>

                <th style={styles.th}>
                  Target Position
                </th>

                <th style={styles.th}>
                  HOD Recommendation
                </th>

                <th style={styles.th}>
                  Date
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {recentApplications.length > 0 ? (

                recentApplications.map(
                  (app, index) => (

                    <tr
                      key={app.id}
                      style={styles.tr}
                    >

                      {/* NUMBER */}

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      {/* APPLICANT */}

                      <td style={styles.td}>

                        <div
                          style={styles.applicantCell}
                        >

                          <div
                            style={styles.avatar}
                          >
                            {getApplicantName(app)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {getApplicantName(app)}
                            </strong>

                            <small
                              style={styles.applicationId}
                            >
                              APP-
                              {String(app.id)
                                .padStart(3, "0")}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* DEPARTMENT */}

                      <td style={styles.td}>
                        {getDepartment(app)}
                      </td>

                      {/* CURRENT */}

                      <td style={styles.td}>
                        {getCurrentPosition(app)}
                      </td>

                      {/* TARGET */}

                      <td style={styles.td}>
                        {getTargetPosition(app)}
                      </td>

                      {/* HOD */}

                      <td style={styles.td}>
                        {getHodBadge(app)}
                      </td>

                      {/* DATE */}

                      <td style={styles.td}>
                        {formatDate(
                          app.created_at ||
                            app.submitted_at ||
                            app.application_date
                        )}
                      </td>

                      {/* STATUS */}

                      <td style={styles.td}>
                        {getStatusBadge(app)}
                      </td>

                      {/* ACTION */}

                      <td style={styles.td}>

                        <button
                          style={styles.viewButton}
                          onClick={() =>
                            handleReview(app.id)
                          }
                        >
                          <FaEye />
                          Review
                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    style={styles.empty}
                  >

                    <FaUserGraduate
                      size={40}
                      style={{
                        marginBottom: "10px",
                      }}
                    />

                    <h3>
                      No Applications Awaiting Dean Review
                    </h3>

                    <p>
                      Applications will appear here after
                      the HOD has completed the departmental
                      recommendation.
                    </p>

                    <button
                      style={styles.emptyButton}
                      onClick={fetchApplications}
                    >
                      <FaSyncAlt />
                      Refresh
                    </button>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================================================
          QUICK ACTIONS
      ======================================================== */}

      {/* <div style={styles.quickSection}>

        <h2 style={styles.sectionTitle}>
          Quick Actions
        </h2>

        <div style={styles.quickGrid}>

          <button
            style={styles.quickCard}
            onClick={() =>
              navigate("/dean/applications")
            }
          >
            <FaClipboardList
              style={styles.quickIconBlue}
            />

            <div>
              <strong>
                View Applications
              </strong>

              <span>
                Review all promotion applications
              </span>
            </div>

            <FaArrowRight
              style={styles.quickArrow}
            />
          </button>

          <button
            style={styles.quickCard}
            onClick={() =>
              navigate("/dean/applications?status=pending")
            }
          >
            <FaClock
              style={styles.quickIconOrange}
            />

            <div>
              <strong>
                Review Pending
              </strong>

              <span>
                Applications awaiting your decision
              </span>
            </div>

            <FaArrowRight
              style={styles.quickArrow}
            />
          </button>

          <button
            style={styles.quickCard}
            onClick={() =>
              navigate("/dean/history")
            }
          >
            <FaCheckCircle
              style={styles.quickIconGreen}
            />

            <div>
              <strong>
                Promotion History
              </strong>

              <span>
                View previous Dean decisions
              </span>
            </div>

            <FaArrowRight
              style={styles.quickArrow}
            />
          </button>

        </div>

      </div> */}

      {/* ========================================================
          INLINE CSS
      ======================================================== */}

      <style>
        {`

          * {
            box-sizing: border-box;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.25);
            }

            70% {
              box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
            }

            100% {
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
            }
          }

          button {
            font-family: inherit;
          }

          button:hover {
            transform: translateY(-1px);
          }

          tr:hover {
            background: #f8fafc;
          }

          @media (max-width: 1200px) {

            .dean-dashboard-cards {
              grid-template-columns:
                repeat(3, 1fr);
            }

          }

          @media (max-width: 850px) {

            .dean-dashboard-cards {
              grid-template-columns:
                repeat(2, 1fr);
            }

          }

          @media (max-width: 650px) {

            .dean-dashboard-cards {
              grid-template-columns: 1fr;
            }

          }

        `}
      </style>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f5f7fb",
    color: "#1e293b",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  breadcrumb: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    color: "#172554",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "700",
  },

  refreshIcon: {
    animation: "spin 1s linear infinite",
  },

  applicationButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 17px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 18px",
    marginBottom: "22px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#991b1b",
  },

  errorText: {
    marginTop: "3px",
    fontSize: "13px",
  },

  retryButton: {
    marginLeft: "auto",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  workflowCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.04)",
  },

  workflowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  workflowTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#172554",
  },

  workflowSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  workflowCurrent: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  workflow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflowX: "auto",
    paddingBottom: "5px",
  },

  workflowStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    minWidth: "75px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
  },

  workflowCircleDone: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  workflowCircleActive: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "3px solid #bfdbfe",
    animation: "pulse 2s infinite",
  },

  workflowCircle: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  workflowLineDone: {
    height: "4px",
    background: "#16a34a",
    flex: 1,
    minWidth: "30px",
  },

  workflowLineActive: {
    height: "4px",
    background: "#2563eb",
    flex: 1,
    minWidth: "30px",
  },

  workflowLine: {
    height: "4px",
    background: "#cbd5e1",
    flex: 1,
    minWidth: "30px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(170px, 1fr))",
    gap: "17px",
    marginBottom: "25px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    minHeight: "115px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.05)",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  cardTitle: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
  },

  number: {
    margin: "4px 0 2px",
    fontSize: "27px",
    color: "#172554",
    fontWeight: "800",
  },

  cardDescription: {
    fontSize: "10px",
    color: "#94a3b8",
  },

  section: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "23px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "19px",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    minWidth: "1050px",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "13px 12px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "800",
    borderBottom:
      "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom:
      "1px solid #eef2f7",
  },

  td: {
    padding: "14px 12px",
    fontSize: "12px",
    color: "#334155",
    verticalAlign: "middle",
  },

  applicantCell: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: "170px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    minWidth: "35px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  applicationId: {
    display: "block",
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  approvedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  rejectedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  reviewBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  pendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#94a3b8",
  },

  emptyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  quickSection: {
    marginTop: "25px",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "15px",
    marginTop: "15px",
  },

  quickCard: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    padding: "17px",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    background: "#fff",
    cursor: "pointer",
    color: "#1e293b",
  },

  quickCardText: {
    flex: 1,
  },

  quickCardSpan: {
    display: "block",
    marginTop: "3px",
    color: "#64748b",
    fontSize: "11px",
  },

  quickIconBlue: {
    fontSize: "21px",
    color: "#2563eb",
  },

  quickIconOrange: {
    fontSize: "21px",
    color: "#ea580c",
  },

  quickIconGreen: {
    fontSize: "21px",
    color: "#16a34a",
  },

  quickArrow: {
    marginLeft: "auto",
    color: "#94a3b8",
  },

  loadingCard: {
    maxWidth: "500px",
    margin: "100px auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "60px 30px",
    textAlign: "center",
    boxShadow:
      "0 4px 20px rgba(15,23,42,0.08)",
  },

  spinner: {
    fontSize: "35px",
    color: "#2563eb",
    animation:
      "spin 1s linear infinite",
  },

  loadingTitle: {
    margin: "18px 0 5px",
    color: "#172554",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
};

export default Dashboard;

