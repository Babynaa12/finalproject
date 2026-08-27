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
    "Content-Type": "application/json",
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
        "============================================"
      );

      console.log(
        "REVIEWER ASSIGNMENTS:",
        response.data
      );

      console.log(
        "============================================"
      );

      let data = response.data;

      // DRF pagination support
      if (data && Array.isArray(data.results)) {
        data = data.results;
      }

      // Make sure data is always an array
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");

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
        err.response?.data?.detail ||
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
    if (!assignment) {
      return {};
    }

    /*
      Depending on the serializer, application can be:

      application: 1

      OR

      application: {
        id: 1,
        ...
      }
    */

    if (
      assignment.application &&
      typeof assignment.application === "object"
    ) {
      return assignment.application;
    }

    if (
      assignment.promotion_application &&
      typeof assignment.promotion_application === "object"
    ) {
      return assignment.promotion_application;
    }

    if (
      assignment.promotionApplication &&
      typeof assignment.promotionApplication === "object"
    ) {
      return assignment.promotionApplication;
    }

    return {};
  };

  // ============================================================
  // GET APPLICATION ID
  // ============================================================

  const getApplicationId = (assignment) => {
    if (!assignment) {
      return null;
    }

    const application = getApplication(assignment);

    /*
      Priority:

      1. application.id
      2. application_id
      3. promotion_application_id
      4. promotionApplicationId
      5. application if it is already an ID
    */

    if (application?.id) {
      return application.id;
    }

    if (assignment.application_id) {
      return assignment.application_id;
    }

    if (assignment.promotion_application_id) {
      return assignment.promotion_application_id;
    }

    if (assignment.promotionApplicationId) {
      return assignment.promotionApplicationId;
    }

    if (
      assignment.application &&
      typeof assignment.application !== "object"
    ) {
      return assignment.application;
    }

    return null;
  };

  // ============================================================
  // GET APPLICANT NAME
  // ============================================================

  const getApplicantName = (assignment) => {
    const application = getApplication(assignment);

    const employee =
      application?.employee ||
      assignment?.employee ||
      {};

    const name =
      assignment?.employee_name ||
      assignment?.applicant_name ||
      application?.employee_name ||
      application?.applicant_name ||
      employee?.full_name ||
      employee?.name ||
      employee?.employee_name ||
      `${employee?.first_name || ""} ${
        employee?.last_name || ""
      }`.trim();

    return name || "N/A";
  };

  // ============================================================
  // GET DEPARTMENT
  // ============================================================

  const getDepartment = (assignment) => {
    const application = getApplication(assignment);

    const employee =
      application?.employee ||
      assignment?.employee ||
      {};

    const department =
      assignment?.department_name ||
      application?.department_name ||
      application?.department?.name ||
      employee?.department_name ||
      employee?.department?.name ||
      employee?.department;

    if (
      department &&
      typeof department === "object"
    ) {
      return (
        department.name ||
        department.department_name ||
        "N/A"
      );
    }

    return department || "N/A";
  };

  // ============================================================
  // GET CURRENT RANK
  // ============================================================

  const getCurrentRank = (assignment) => {
    const application = getApplication(assignment);

    const rank =
      application?.current_title_name ||
      application?.current_title?.title_name ||
      application?.current_title?.name ||
      application?.current_title ||
      assignment?.current_title_name ||
      assignment?.current_rank ||
      "N/A";

    if (typeof rank === "object") {
      return (
        rank.title_name ||
        rank.name ||
        "N/A"
      );
    }

    return rank;
  };

  // ============================================================
  // GET TARGET RANK
  // ============================================================

  const getTargetRank = (assignment) => {
    const application = getApplication(assignment);

    const rank =
      application?.targeted_title_name ||
      application?.targeted_title?.title_name ||
      application?.targeted_title?.name ||
      application?.targeted_title ||
      application?.target_title_name ||
      application?.target_rank ||
      assignment?.targeted_title_name ||
      assignment?.target_rank ||
      "N/A";

    if (typeof rank === "object") {
      return (
        rank.title_name ||
        rank.name ||
        "N/A"
      );
    }

    return rank;
  };

  // ============================================================
  // GET REVIEWER NAME
  // ============================================================

  const getReviewerName = (assignment) => {
    if (!assignment) {
      return "You";
    }

    const reviewer =
      assignment.reviewer || {};

    const name =
      assignment.reviewer_name ||
      reviewer.full_name ||
      reviewer.name ||
      `${reviewer.first_name || ""} ${
        reviewer.last_name || ""
      }`.trim();

    return name || "You";
  };

  // ============================================================
  // GET STATUS
  // ============================================================

  const getStatus = (assignment) => {
    if (!assignment) {
      return "PENDING";
    }

    if (assignment.completed === true) {
      return "COMPLETED";
    }

    return (
      assignment.review_status ||
      assignment.status ||
      assignment.assignment_status ||
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
    const value = String(status || "")
      .toLowerCase();

    if (
      value.includes("completed") ||
      value.includes("submitted") ||
      value.includes("approved")
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      value.includes("review") ||
      value.includes("assigned") ||
      value.includes("in_progress")
    ) {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (
      value.includes("rejected") ||
      value.includes("declined")
    ) {
      return {
        background: "#fee2e2",
        color: "#991b1b",
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
    if (!assignment) {
      setError("Invalid reviewer assignment.");
      return;
    }

    const assignmentId = assignment.id;

    const applicationId =
      getApplicationId(assignment);

    console.log(
      "============================================"
    );

    console.log(
      "OPENING REVIEW"
    );

    console.log(
      "Assignment ID:",
      assignmentId
    );

    console.log(
      "Application ID:",
      applicationId
    );

    console.log(
      "============================================"
    );

    if (!assignmentId) {
      setError(
        "This reviewer assignment does not have a valid assignment ID."
      );
      return;
    }

    if (!applicationId) {
      setError(
        "This assignment does not have a valid promotion application."
      );
      return;
    }

    /*
      IMPORTANT

      Example:

      assignment.id = 2
      application_id = 1

      URL:

      /reviewer/review/1?assignment=2

      1 = promotion application
      2 = reviewer assignment
    */

    navigate(
      `/reviewer/review/${applicationId}?assignment=${assignmentId}`
    );
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    loadAssignments();
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>

          <h2 style={styles.loadingTitle}>
            Assigned Reviews
          </h2>

          <p style={styles.loadingText}>
            Loading promotion applications assigned
            to you...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const assignedCount =
    assignments.length;

  const completedCount =
    assignments.filter(
      (item) =>
        item.completed === true ||
        String(
          getStatus(item)
        ).toLowerCase().includes("completed")
    ).length;

  const pendingCount =
    assignedCount - completedCount;

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
              Assigned Reviews
            </h1>

            <p style={styles.subtitle}>
              Promotion applications assigned to you
              for academic material review.
            </p>
          </div>

          <div style={styles.headerActions}>

            <button
              onClick={handleRefresh}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>

            <button
              onClick={() =>
                navigate("/reviewer/dashboard")
              }
              style={styles.secondaryButton}
            >
              ← Dashboard
            </button>

          </div>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div style={styles.error}>

            <div style={styles.errorIcon}>
              !
            </div>

            <div>
              <strong>Error</strong>

              <div style={styles.errorMessage}>
                {error}
              </div>
            </div>

          </div>
        )}


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div style={styles.summaryGrid}>

          {/* ASSIGNED */}

          <div style={styles.summaryCard}>

            <div style={styles.summaryIconBlue}>
              📋
            </div>

            <div>
              <span style={styles.summaryLabel}>
                ASSIGNED
              </span>

              <strong style={styles.summaryValue}>
                {assignedCount}
              </strong>
            </div>

          </div>


          {/* PENDING */}

          <div style={styles.summaryCard}>

            <div style={styles.summaryIconYellow}>
              ⏳
            </div>

            <div>
              <span style={styles.summaryLabel}>
                PENDING
              </span>

              <strong style={styles.summaryValue}>
                {pendingCount}
              </strong>
            </div>

          </div>


          {/* COMPLETED */}

          <div style={styles.summaryCard}>

            <div style={styles.summaryIconGreen}>
              ✓
            </div>

            <div>
              <span style={styles.summaryLabel}>
                COMPLETED
              </span>

              <strong style={styles.summaryValue}>
                {completedCount}
              </strong>
            </div>

          </div>

        </div>


        {/* ====================================================
            ASSIGNMENTS CARD
        ==================================================== */}

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

            <div style={styles.assignmentCount}>
              {assignments.length} Assignment
              {assignments.length !== 1
                ? "s"
                : ""}
            </div>

          </div>


          {/* ==================================================
              NO ASSIGNMENTS
          ================================================== */}

          {assignments.length === 0 ? (

            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                ✓
              </div>

              <h3 style={styles.emptyTitle}>
                No Reviews Assigned
              </h3>

              <p style={styles.emptyText}>
                You currently have no promotion
                applications assigned to you.
              </p>

              <button
                onClick={handleRefresh}
                style={styles.reviewButton}
              >
                Refresh Assignments
              </button>

            </div>

          ) : (

            /* ==================================================
               TABLE
            ================================================== */

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

                      const applicantName =
                        getApplicantName(
                          assignment
                        );

                      const department =
                        getDepartment(
                          assignment
                        );

                      const currentRank =
                        getCurrentRank(
                          assignment
                        );

                      const targetRank =
                        getTargetRank(
                          assignment
                        );

                      const reviewerName =
                        getReviewerName(
                          assignment
                        );

                      const status =
                        getStatus(
                          assignment
                        );

                      const isCompleted =
                        assignment.completed ===
                          true ||
                        String(status)
                          .toLowerCase()
                          .includes(
                            "completed"
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

                          <td style={styles.td}>

                            <div
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
                            </div>

                          </td>


                          {/* APPLICANT */}

                          <td style={styles.td}>

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
                                {applicantName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <div
                                  style={
                                    styles.applicantName
                                  }
                                >
                                  {applicantName}
                                </div>

                                <div
                                  style={
                                    styles.smallText
                                  }
                                >
                                  Application #
                                  {applicationId ||
                                    assignment.id}
                                </div>

                              </div>

                            </div>

                          </td>


                          {/* DEPARTMENT */}

                          <td style={styles.td}>
                            {department}
                          </td>


                          {/* CURRENT RANK */}

                          <td style={styles.td}>
                            {currentRank}
                          </td>


                          {/* TARGET RANK */}

                          <td style={styles.td}>

                            <span
                              style={
                                styles.targetRank
                              }
                            >
                              {targetRank}
                            </span>

                          </td>


                          {/* REVIEWER */}

                          <td style={styles.td}>
                            {reviewerName}
                          </td>


                          {/* STATUS */}

                          <td style={styles.td}>

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
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatStatus(
                                status
                              )}
                            </span>

                          </td>


                          {/* ACTION */}

                          <td style={styles.td}>

                            <button
                              onClick={() =>
                                openReview(
                                  assignment
                                )
                              }
                              style={
                                isCompleted
                                  ? styles.viewButton
                                  : styles.reviewButton
                              }
                            >

                              {isCompleted
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


        {/* ====================================================
            GUIDANCE
        ==================================================== */}

        <div style={styles.guidance}>

          <div style={styles.guidanceHeader}>

            <div style={styles.guidanceIcon}>
              i
            </div>

            <h3 style={styles.guidanceTitle}>
              Reviewer Guidance
            </h3>

          </div>


          <ul style={styles.guidanceList}>

            <li>
              Review only promotion applications
              assigned to you.
            </li>

            <li>
              Open the assigned application to
              view all submitted academic materials.
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
              Reviewer status becomes
              <strong> COMPLETED </strong>
              only after all required materials have
              been reviewed.
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
    maxWidth: "1450px",
    margin: "0 auto",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

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
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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

  secondaryButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "15px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  errorIcon: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#dc2626",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  errorMessage: {
    marginTop: "5px",
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
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
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  summaryIconBlue: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryIconYellow: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryIconGreen: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
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
    marginTop: "5px",
    fontSize: "27px",
    color: "#111827",
  },

  // ==========================================================
  // CARD
  // ==========================================================

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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardDescription: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  assignmentCount: {
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "20px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: "700",
  },

  // ==========================================================
  // TABLE
  // ==========================================================

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
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

  applicationId: {
    fontWeight: "700",
    color: "#1d4ed8",
  },

  // ==========================================================
  // APPLICANT
  // ==========================================================

  applicant: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "200px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  applicantName: {
    fontWeight: "600",
    color: "#111827",
  },

  smallText: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#9ca3af",
  },

  targetRank: {
    fontWeight: "600",
    color: "#1d4ed8",
  },

  // ==========================================================
  // BUTTONS
  // ==========================================================

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

  viewButton: {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    textAlign: "center",
    padding: "65px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    fontWeight: "700",
  },

  emptyTitle: {
    color: "#111827",
    marginBottom: "8px",
  },

  emptyText: {
    marginBottom: "20px",
  },

  // ==========================================================
  // GUIDANCE
  // ==========================================================

  guidance: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "22px",
    marginTop: "25px",
  },

  guidanceHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  guidanceIcon: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  guidanceTitle: {
    margin: 0,
    color: "#1e3a8a",
  },

  guidanceList: {
    marginBottom: 0,
    paddingLeft: "20px",
    color: "#374151",
    lineHeight: "1.8",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "45px",
    textAlign: "center",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.04)",
  },

  spinner: {
    width: "38px",
    height: "38px",
    border:
      "4px solid #e5e7eb",
    borderTop:
      "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation:
      "spin 1s linear infinite",
  },

  loadingTitle: {
    marginBottom: "8px",
    color: "#111827",
  },

  loadingText: {
    color: "#6b7280",
  },
};

export default AssignedReviews;