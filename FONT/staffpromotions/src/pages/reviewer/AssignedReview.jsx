import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function AssignedReviews() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ============================================================
  // AUTHENTICATION
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

    loadAssignments();
  }, []);

  // ============================================================
  // LOAD REVIEWER ASSIGNMENTS
  // ============================================================

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/reviewer-assignments/`,
        {
          headers,
        }
      );

      console.log(
        "Reviewer assignments:",
        response.data
      );

      let data = response.data;

      if (data?.results) {
        data = data.results;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      setAssignments(data);
    } catch (err) {
      console.error(
        "Failed to load reviewer assignments:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to view reviewer assignments."
        );
        return;
      }

      setError(
        "Failed to load your assigned promotion reviews."
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
    const application = getApplication(assignment);

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
    const application = getApplication(assignment);

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
      employee.employee_name ||
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
    const application = getApplication(assignment);

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
    const application = getApplication(assignment);

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
    const application = getApplication(assignment);

    return (
      application.targeted_title_name ||
      application.targeted_title?.title_name ||
      application.targeted_title?.name ||
      application.targeted_title ||
      "N/A"
    );
  };

  // ============================================================
  // GET REVIEWER
  // ============================================================

  const getReviewerName = (assignment) => {
    return (
      assignment.reviewer_name ||
      assignment.reviewer?.full_name ||
      assignment.reviewer?.name ||
      `${assignment.reviewer?.first_name || ""} ${
        assignment.reviewer?.last_name || ""
      }`.trim() ||
      "You"
    );
  };

  // ============================================================
  // GET STATUS
  // ============================================================

  const getStatus = (assignment) => {
    if (assignment.completed === true) {
      return "COMPLETED";
    }

    return (
      assignment.review_status ||
      assignment.status ||
      "PENDING"
    );
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
    const value = String(status).toLowerCase();

    if (
      value.includes("completed") ||
      value.includes("submitted")
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      value.includes("review") ||
      value.includes("assigned")
    ) {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  // ============================================================
  // OPEN SPECIFIC REVIEW
  // ============================================================

  const openReview = (assignment) => {
    const applicationId =
      getApplicationId(assignment);

    if (!applicationId) {
      setError(
        "This assignment does not have a valid promotion application."
      );
      return;
    }

    /*
      IMPORTANT:

      We send BOTH applicationId and assignmentId.

      applicationId = whose promotion application is being reviewed.

      assignmentId = proves that THIS reviewer was assigned
      to that application.
    */

    navigate(
      `/reviewer/review/${applicationId}?assignment=${assignment.id}`
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <h2>Assigned Reviews</h2>

          <p>
            Loading promotion applications assigned
            to you...
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

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Assigned Reviews
            </h1>

            <p style={styles.subtitle}>
              Promotion applications assigned to you
              for academic material review.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/reviewer/dashboard")
            }
            style={styles.secondaryButton}
          >
            ← Dashboard
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            <strong>Error</strong>

            <div style={{ marginTop: "5px" }}>
              {error}
            </div>
          </div>
        )}

        {/* SUMMARY */}

        <div style={styles.summaryGrid}>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              ASSIGNED
            </span>

            <strong style={styles.summaryValue}>
              {assignments.length}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              PENDING
            </span>

            <strong style={styles.summaryValue}>
              {
                assignments.filter(
                  (item) =>
                    !item.completed
                ).length
              }
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>
              COMPLETED
            </span>

            <strong style={styles.summaryValue}>
              {
                assignments.filter(
                  (item) =>
                    item.completed === true
                ).length
              }
            </strong>
          </div>

        </div>

        {/* ASSIGNMENTS */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                My Assigned Promotion Applications
              </h2>

              <p style={styles.cardDescription}>
                Select an application to review its
                submitted academic materials.
              </p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                ✓
              </div>

              <h3>
                No Reviews Assigned
              </h3>

              <p>
                You currently have no promotion
                applications assigned to you.
              </p>

            </div>
          ) : (
            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

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
                      Reviewer
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

                  {assignments.map(
                    (assignment) => {

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
                            <strong>
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
                                {
                                  getApplicantName(
                                    assignment
                                  )
                                    .charAt(0)
                                    .toUpperCase()
                                }
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

                          {/* REVIEWER */}

                          <td
                            style={styles.td}
                          >
                            {
                              getReviewerName(
                                assignment
                              )
                            }
                          </td>

                          {/* STATUS */}

                          <td
                            style={styles.td}
                          >
                            <span
                              style={{
                                ...statusStyle(
                                  status
                                ),
                                padding:
                                  "6px 11px",
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
                                styles.reviewButton
                              }
                            >
                              {assignment.completed
                                ? "View Review"
                                : "Review Materials"}
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* GUIDANCE */}

        <div style={styles.guidance}>

          <h3 style={styles.guidanceTitle}>
            Reviewer Guidance
          </h3>

          <ul style={styles.guidanceList}>

            <li>
              Review only promotion applications
              assigned to you.
            </li>

            <li>
              Open the assigned application to
              view all submitted promotion materials.
            </li>

            <li>
              Every submitted academic material must
              be reviewed.
            </li>

            <li>
              Assess authenticity, originality,
              contribution to knowledge and relevance
              to the discipline.
            </li>

            <li>
              Provide objective and evidence-based
              comments.
            </li>

            <li>
              Select an appropriate academic grade.
            </li>

            <li>
              Reviewer status becomes COMPLETED only
              after all required materials have been
              reviewed.
            </li>

          </ul>

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
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  secondaryButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "15px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.04)",
  },

  summaryLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  summaryValue: {
    display: "block",
    marginTop: "8px",
    fontSize: "28px",
    color: "#111827",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    padding: "22px",
    borderBottom: "1px solid #e5e7eb",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardDescription: {
    margin: "7px 0 0",
    color: "#6b7280",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    textAlign: "left",
    padding: "14px 16px",
    background: "#f8fafc",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
    borderBottom:
      "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px 16px",
    color: "#374151",
    fontSize: "14px",
    borderBottom:
      "1px solid #f1f5f9",
    verticalAlign: "middle",
  },

  tableRow: {
    background: "#ffffff",
  },

  applicant: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "180px",
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
    flexShrink: 0,
  },

  reviewButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "700",
  },

  guidance: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "22px",
    marginTop: "25px",
  },

  guidanceTitle: {
    marginTop: 0,
    color: "#1e3a8a",
  },

  guidanceList: {
    marginBottom: 0,
    paddingLeft: "20px",
    color: "#374151",
    lineHeight: "1.8",
  },

  loading: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "40px",
    textAlign: "center",
  },
};

export default AssignedReviews;