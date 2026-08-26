import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    assigned: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  });

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (role && role.toUpperCase() !== "REVIEWER") {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, []);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/reviewer-assignments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let assignments = response.data;

      // DRF pagination
      if (assignments?.results) {
        assignments = assignments.results;
      }

      // Some APIs return { assignments: [] }
      if (assignments?.assignments) {
        assignments = assignments.assignments;
      }

      if (!Array.isArray(assignments)) {
        assignments = [];
      }

      console.log(
        "Reviewer assignments:",
        assignments
      );

      setApplications(assignments);

      // ========================================================
      // CALCULATE REVIEW STATUS FROM ASSIGNMENT
      // ========================================================

      const assigned = assignments.length;

      const completed = assignments.filter(
        (assignment) =>
          assignment.completed === true
      ).length;

      const pending = assignments.filter(
        (assignment) =>
          assignment.completed !== true
      ).length;

      // Overdue can be supplied by backend if available.
      const overdue = assignments.filter(
        (assignment) =>
          assignment.overdue === true
      ).length;

      setSummary({
        assigned,
        pending,
        completed,
        overdue,
      });
    } catch (err) {
      console.error(
        "Reviewer dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to access the Reviewer Dashboard."
        );
        return;
      }

      setError(
        "Failed to load reviewer assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET APPLICATION
  // ============================================================

  const getApplication = (assignment) => {
    return (
      assignment.application ||
      assignment.promotion_application ||
      assignment.promotionApplication ||
      {}
    );
  };

  // ============================================================
  // GET APPLICATION ID
  // ============================================================

  const getApplicationId = (assignment) => {
    const application = getApplication(
      assignment
    );

    return (
      application.id ||
      assignment.application_id ||
      assignment.promotion_application_id ||
      null
    );
  };

  // ============================================================
  // GET APPLICANT NAME
  // ============================================================

  const getApplicantName = (assignment) => {
    const application =
      getApplication(assignment);

    const employee =
      application.employee ||
      assignment.employee ||
      {};

    return (
      assignment.employee_name ||
      assignment.applicant_name ||
      application.employee_name ||
      application.applicant_name ||
      employee.full_name ||
      employee.name ||
      employee.username ||
      `${employee.first_name || ""} ${
        employee.last_name || ""
      }`.trim() ||
      "N/A"
    );
  };

  // ============================================================
  // GET DEPARTMENT
  // ============================================================

  const getDepartment = (assignment) => {
    const application =
      getApplication(assignment);

    const employee =
      application.employee ||
      assignment.employee ||
      {};

    return (
      assignment.department_name ||
      application.department_name ||
      application.department?.name ||
      employee.department_name ||
      employee.department?.name ||
      employee.department ||
      "N/A"
    );
  };

  // ============================================================
  // GET CURRENT RANK
  // ============================================================

  const getCurrentRank = (assignment) => {
    const application =
      getApplication(assignment);

    return (
      application.current_title_name ||
      application.current_title?.title_name ||
      application.current_title?.name ||
      application.current_title ||
      "N/A"
    );
  };

  // ============================================================
  // GET TARGET RANK
  // ============================================================

  const getTargetRank = (assignment) => {
    const application =
      getApplication(assignment);

    return (
      application.targeted_title_name ||
      application.targeted_title?.title_name ||
      application.targeted_title?.name ||
      application.targeted_title ||
      "N/A"
    );
  };

  // ============================================================
  // GET REVIEW STATUS
  // ============================================================

  const getStatus = (assignment) => {
    /*
     * IMPORTANT:
     *
     * ReviewerAssignment has:
     *
     * completed = Boolean
     *
     * Therefore the review status must come from
     * assignment.completed.
     *
     * Do NOT use application.status here because
     * application.status represents the promotion
     * application, not this reviewer's assignment.
     */

    if (assignment.completed === true) {
      return "COMPLETED";
    }

    if (assignment.overdue === true) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const formatStatus = (status) => {
    return String(status || "PENDING")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const statusStyle = (status) => {
    const value = String(
      status || ""
    ).toUpperCase();

    if (value === "COMPLETED") {
      return {
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    }

    if (value === "OVERDUE") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }

    if (value === "PENDING") {
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    }

    return {
      background: "#e0e7ff",
      color: "#3730a3",
      border: "1px solid #c7d2fe",
    };
  };

  // ============================================================
  // REVIEW BUTTON
  // ============================================================

  const openReview = (assignment) => {
    const applicationId =
      getApplicationId(assignment);

    if (!applicationId) {
      setError(
        "This reviewer assignment does not have a valid application ID."
      );
      return;
    }

    navigate(
      `/reviewer/review/${applicationId}`
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            ⟳
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Reviewer Dashboard
          </h2>

          <p style={styles.loadingText}>
            Retrieving your assigned promotion
            applications...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Reviewer Dashboard
            </h1>

            <p style={styles.subtitle}>
              Welcome to the Academic Staff Promotion
              Reviewer Portal.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div style={styles.error}>
            <strong>
              Error
            </strong>

            <div style={styles.errorMessage}>
              {error}
            </div>
          </div>
        )}

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div style={styles.cardsGrid}>

          {/* ASSIGNED */}

          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>
              📋
            </div>

            <div>
              <div style={styles.cardLabel}>
                Assigned Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.assigned}
              </div>

              <div style={styles.cardDescription}>
                Applications assigned to you
              </div>
            </div>
          </div>

          {/* PENDING */}

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.cardIcon,
                background: "#fef3c7",
              }}
            >
              ⏳
            </div>

            <div>
              <div style={styles.cardLabel}>
                Pending Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.pending}
              </div>

              <div style={styles.cardDescription}>
                Awaiting academic assessment
              </div>
            </div>
          </div>

          {/* COMPLETED */}

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.cardIcon,
                background: "#dcfce7",
              }}
            >
              ✓
            </div>

            <div>
              <div style={styles.cardLabel}>
                Completed Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.completed}
              </div>

              <div style={styles.cardDescription}>
                Fully reviewed applications
              </div>
            </div>
          </div>

          {/* OVERDUE */}

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.cardIcon,
                background: "#fee2e2",
              }}
            >
              !
            </div>

            <div>
              <div style={styles.cardLabel}>
                Overdue Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.overdue}
              </div>

              <div style={styles.cardDescription}>
                Reviews past their due date
              </div>
            </div>
          </div>

        </div>

        {/* ====================================================
            ASSIGNED APPLICATIONS
        ==================================================== */}

        <div style={styles.mainCard}>

          <div style={styles.tableHeader}>

            <div>
              <h2 style={styles.tableTitle}>
                Assigned Applications
              </h2>

              <p style={styles.tableSubtitle}>
                Promotion applications assigned
                specifically to you.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/reviewer/assigned-reviews"
                )
              }
              style={styles.primaryButton}
            >
              View All
            </button>

          </div>

          {/* ==================================================
              EMPTY
          ================================================== */}

          {applications.length === 0 ? (
            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                📭
              </div>

              <h3 style={styles.emptyTitle}>
                No Applications Assigned
              </h3>

              <p style={styles.emptyText}>
                You currently have no promotion
                applications assigned for review.
              </p>

            </div>
          ) : (

            /* ==================================================
               TABLE
            ================================================== */

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr style={styles.tableHeadRow}>

                    <th style={styles.th}>
                      Application ID
                    </th>

                    <th style={styles.th}>
                      Applicant
                    </th>

                    <th style={styles.th}>
                      Department
                    </th>

                    <th style={styles.th}>
                      Current Rank
                    </th>

                    <th style={styles.th}>
                      Promotion To
                    </th>

                    <th style={styles.th}>
                      Review Status
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {applications
                    .slice(0, 10)
                    .map((assignment) => {

                      const applicationId =
                        getApplicationId(
                          assignment
                        );

                      const status =
                        getStatus(
                          assignment
                        );

                      return (
                        <tr
                          key={
                            assignment.id
                          }
                          style={
                            styles.tableRow
                          }
                        >

                          {/* APPLICATION ID */}

                          <td
                            style={styles.td}
                          >
                            <strong
                              style={
                                styles.applicationId
                              }
                            >
                              APP-
                              {String(
                                applicationId ||
                                  assignment.id
                              ).padStart(
                                3,
                                "0"
                              )}
                            </strong>
                          </td>

                          {/* APPLICANT */}

                          <td
                            style={styles.td}
                          >
                            <div
                              style={
                                styles.applicant
                              }
                            >
                              <div
                                style={
                                  styles.avatar
                                }
                              >
                                {getApplicantName(
                                  assignment
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {
                                  getApplicantName(
                                    assignment
                                  )
                                }
                              </span>
                            </div>
                          </td>

                          {/* DEPARTMENT */}

                          <td
                            style={styles.td}
                          >
                            {
                              getDepartment(
                                assignment
                              )
                            }
                          </td>

                          {/* CURRENT RANK */}

                          <td
                            style={styles.td}
                          >
                            {
                              getCurrentRank(
                                assignment
                              )
                            }
                          </td>

                          {/* TARGET RANK */}

                          <td
                            style={styles.td}
                          >
                            {
                              getTargetRank(
                                assignment
                              )
                            }
                          </td>

                          {/* REVIEW STATUS */}

                          <td
                            style={styles.td}
                          >
                            <span
                              style={{
                                ...statusStyle(
                                  status
                                ),
                                padding:
                                  "6px 12px",
                                borderRadius:
                                  "20px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  "700",
                                display:
                                  "inline-block",
                              }}
                            >
                              {formatStatus(
                                status
                              )}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td
                            style={styles.td}
                          >
                            <button
                              onClick={() =>
                                openReview(
                                  assignment
                                )
                              }
                              style={
                                status ===
                                "COMPLETED"
                                  ? styles.viewButton
                                  : styles.reviewButton
                              }
                            >
                              {status ===
                              "COMPLETED"
                                ? "View Review"
                                : "Review"}
                            </button>
                          </td>

                        </tr>
                      );
                    })}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ====================================================
            REVIEW WORKFLOW INFORMATION
        ==================================================== */}

        <div style={styles.infoCard}>

          <div style={styles.infoIcon}>
            ℹ
          </div>

          <div>

            <h3 style={styles.infoTitle}>
              Reviewer Workflow
            </h3>

            <p style={styles.infoText}>
              Each assignment represents a specific
              promotion application assigned to you.
              Open an assignment to review all
              submitted promotion materials.
            </p>

            <div style={styles.workflow}>

              <div style={styles.workflowStep}>
                <span>1</span>
                Assignment received
              </div>

              <div style={styles.workflowArrow}>
                →
              </div>

              <div style={styles.workflowStep}>
                <span>2</span>
                Review materials
              </div>

              <div style={styles.workflowArrow}>
                →
              </div>

              <div style={styles.workflowStep}>
                <span>3</span>
                Submit academic evaluations
              </div>

              <div style={styles.workflowArrow}>
                →
              </div>

              <div style={styles.workflowStep}>
                <span>4</span>
                Assignment completed
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  refreshButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingCard: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "#ffffff",
    padding: "45px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  spinner: {
    fontSize: "35px",
    marginBottom: "15px",
  },

  loadingTitle: {
    color: "#111827",
    marginBottom: "8px",
  },

  loadingText: {
    color: "#6b7280",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  errorMessage: {
    marginTop: "5px",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "22px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.04)",
  },

  cardIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  cardLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "600",
  },

  cardValue: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
    margin: "5px 0",
  },

  cardDescription: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  mainCard: {
    background: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    marginBottom: "25px",
  },

  tableHeader: {
    padding: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #e5e7eb",
  },

  tableTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
  },

  tableSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  tableHeadRow: {
    background: "#f8fafc",
  },

  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    color: "#6b7280",
    borderBottom:
      "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom:
      "1px solid #f1f5f9",
  },

  td: {
    padding: "15px 16px",
    color: "#374151",
    fontSize: "14px",
  },

  applicationId: {
    color: "#1d4ed8",
  },

  applicant: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "600",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  reviewButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  viewButton: {
    background: "#ffffff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  emptyTitle: {
    color: "#374151",
    marginBottom: "8px",
  },

  emptyText: {
    maxWidth: "500px",
    margin: "0 auto",
  },

  infoCard: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  infoTitle: {
    margin: "0 0 6px",
    color: "#1e3a8a",
  },

  infoText: {
    margin: 0,
    color: "#475569",
    lineHeight: "1.6",
  },

  workflow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#1e3a8a",
    fontSize: "13px",
    fontWeight: "600",
  },

  workflowArrow: {
    color: "#93c5fd",
    fontWeight: "700",
  },
};

export default Dashboard;