import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaSyncAlt,
  FaUserGraduate,
  FaArrowRight,
  FaFileAlt,
  FaUniversity,
  FaUserTie,
  FaUsers,
  FaFlagCheckered,
} from "react-icons/fa";

const API_URL = "http://127.0.0.1:8000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
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
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ");
  };

  // ============================================================
  // GET DATA FROM DIFFERENT POSSIBLE DRF RESPONSE SHAPES
  // ============================================================

  const extractArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.assignments)) {
      return data.assignments;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  };

  // ============================================================
  // LOAD REVIEWER ASSIGNMENTS
  // ============================================================

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      if (!refreshing) {
        setLoading(true);
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/reviewer-assignments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "============================================"
      );
      console.log("REVIEWER DASHBOARD - DJANGO RESPONSE");
      console.log(response.data);
      console.log(
        "============================================"
      );

      const data = extractArray(response.data);

      console.log("REVIEWER ASSIGNMENTS:", data);

      setAssignments(data);
    } catch (err) {
      console.error(
        "REVIEWER DASHBOARD ERROR:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("role");

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
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load reviewer assignments from Django."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, refreshing]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (
      role &&
      role.toUpperCase() !== "REVIEWER"
    ) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate, loadDashboard]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const token = getToken();

      const response = await axios.get(
        `${API_URL}/reviewer-assignments/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = extractArray(response.data);

      setAssignments(data);
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to refresh reviewer dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // GET APPLICATION
  // ============================================================

  const getApplication = (assignment) => {
    return (
      assignment?.application ||
      assignment?.promotion_application ||
      assignment?.promotionApplication ||
      assignment?.promotion ||
      {}
    );
  };

  // ============================================================
  // APPLICATION ID
  // ============================================================

  const getApplicationId = (assignment) => {
    const application = getApplication(assignment);

    return (
      application?.id ||
      assignment?.application_id ||
      assignment?.promotion_application_id ||
      assignment?.promotionApplicationId ||
      null
    );
  };

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (assignment) => {
    const application = getApplication(assignment);

    const employee =
      application?.employee ||
      assignment?.employee ||
      application?.user ||
      {};

    const firstName =
      employee?.first_name ||
      employee?.firstName ||
      "";

    const lastName =
      employee?.last_name ||
      employee?.lastName ||
      "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    return (
      assignment?.employee_name ||
      assignment?.applicant_name ||
      application?.employee_name ||
      application?.applicant_name ||
      application?.full_name ||
      employee?.full_name ||
      employee?.name ||
      combinedName ||
      employee?.username ||
      application?.user?.username ||
      "N/A"
    );
  };

  // ============================================================
  // DEPARTMENT
  // ============================================================

  const getDepartment = (assignment) => {
    const application = getApplication(assignment);

    const employee =
      application?.employee ||
      assignment?.employee ||
      {};

    return (
      assignment?.department_name ||
      application?.department_name ||
      application?.department?.name ||
      application?.department?.department_name ||
      employee?.department_name ||
      employee?.department?.name ||
      employee?.department?.department_name ||
      employee?.department ||
      "N/A"
    );
  };

  // ============================================================
  // CURRENT RANK
  // ============================================================

  const getCurrentRank = (assignment) => {
    const application = getApplication(assignment);

    return (
      application?.current_title_name ||
      application?.current_position_name ||
      application?.current_rank ||
      application?.current_title?.title_name ||
      application?.current_title?.name ||
      application?.current_title ||
      application?.current_position ||
      "N/A"
    );
  };

  // ============================================================
  // TARGET RANK
  // ============================================================

  const getTargetRank = (assignment) => {
    const application = getApplication(assignment);

    return (
      application?.targeted_title_name ||
      application?.target_position_name ||
      application?.target_rank ||
      application?.targeted_title?.title_name ||
      application?.targeted_title?.name ||
      application?.targeted_title ||
      application?.target_position ||
      application?.position_applied_for_name ||
      application?.position_applied_for?.title_name ||
      application?.position_applied_for?.name ||
      "N/A"
    );
  };

  // ============================================================
  // APPLICATION STATUS
  //
  // IMPORTANT:
  // This is the promotion application's workflow status.
  // It is NOT the reviewer assignment status.
  // ============================================================

  const getApplicationStatus = (assignment) => {
    const application = getApplication(assignment);

    return normalize(
      application?.final_status ||
        application?.workflow_status ||
        application?.application_status ||
        application?.status ||
        assignment?.application_status ||
        assignment?.workflow_status ||
        ""
    );
  };

  // ============================================================
  // HOD RECOMMENDATION
  // ============================================================

  const getHodRecommendation = (assignment) => {
    const application = getApplication(assignment);

    return normalize(
      application?.hod_recommendation ||
        application?.hod_status ||
        application?.hod_decision ||
        assignment?.hod_recommendation ||
        ""
    );
  };

  // ============================================================
  // DEAN RECOMMENDATION
  // ============================================================

  const getDeanRecommendation = (assignment) => {
    const application = getApplication(assignment);

    return normalize(
      application?.dean_recommendation ||
        application?.dean_status ||
        application?.dean_decision ||
        assignment?.dean_recommendation ||
        ""
    );
  };

  // ============================================================
  // REVIEWER ASSIGNMENT STATUS
  //
  // This comes directly from ReviewerAssignment.completed.
  // ============================================================

  const isReviewerCompleted = (assignment) => {
    return assignment?.completed === true;
  };

  // ============================================================
  // OVERDUE
  // ============================================================

  const isOverdue = (assignment) => {
    if (assignment?.overdue === true) {
      return true;
    }

    if (isReviewerCompleted(assignment)) {
      return false;
    }

    const dueDate =
      assignment?.due_date ||
      assignment?.deadline ||
      assignment?.review_due_date;

    if (!dueDate) {
      return false;
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date < new Date();
  };

  // ============================================================
  // REVIEWER STATUS
  // ============================================================

  const getReviewerStatus = (assignment) => {
    if (isReviewerCompleted(assignment)) {
      return "COMPLETED";
    }

    if (isOverdue(assignment)) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  // ============================================================
  // WORKFLOW STAGE
  //
  // This determines where the promotion application currently is.
  // ============================================================

  const getWorkflowStage = (assignment) => {
    const application = getApplication(assignment);

    const status = getApplicationStatus(assignment);
    const hod = getHodRecommendation(assignment);
    const dean = getDeanRecommendation(assignment);

    /*
     * FINAL
     */

    if (
      [
        "final",
        "completed",
        "promoted",
        "promotion approved",
        "approved",
        "final approved",
      ].includes(status)
    ) {
      return "FINAL";
    }

    /*
     * COMMITTEE
     */

    if (
      status.includes("committee") ||
      status.includes("board") ||
      application?.committee_status ||
      application?.board_status
    ) {
      return "COMMITTEE";
    }

    /*
     * REVIEWER
     *
     * If this application is assigned to the current reviewer,
     * this stage should be visible even if Django's application
     * status has not yet been updated.
     */

    if (
      status.includes("reviewer") ||
      status.includes("review") ||
      assignment?.id
    ) {
      if (!isReviewerCompleted(assignment)) {
        return "REVIEWER";
      }

      /*
       * Reviewer completed.
       * If Django still says reviewer/review, show Reviewer
       * completed rather than pretending Committee has started.
       */
      if (
        status.includes("reviewer") ||
        status === "under review" ||
        status === "review"
      ) {
        return "REVIEWER COMPLETED";
      }
    }

    /*
     * DEAN
     */

    if (
      status.includes("dean") ||
      dean
    ) {
      return "DEAN";
    }

    /*
     * HOD
     */

    if (
      status.includes("hod") ||
      status.includes("head") ||
      hod
    ) {
      return "HOD";
    }

    /*
     * SUBMITTED
     */

    if (
      status.includes("submitted") ||
      status.includes("pending") ||
      status.includes("application")
    ) {
      return "SUBMITTED";
    }

    /*
     * Because this record is a reviewer assignment,
     * reviewer is the safest stage when Django does not
     * expose a workflow status.
     */

    return isReviewerCompleted(assignment)
      ? "REVIEWER COMPLETED"
      : "REVIEWER";
  };

  // ============================================================
  // WORKFLOW NUMBER
  // ============================================================

  const getWorkflowNumber = (stage) => {
    switch (stage) {
      case "SUBMITTED":
        return 1;

      case "HOD":
        return 2;

      case "DEAN":
        return 3;

      case "REVIEWER":
      case "REVIEWER COMPLETED":
        return 4;

      case "COMMITTEE":
        return 5;

      case "FINAL":
        return 6;

      default:
        return 4;
    }
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const assigned = assignments.length;

    const completed = assignments.filter(
      (assignment) =>
        assignment?.completed === true
    ).length;

    const overdue = assignments.filter(
      (assignment) =>
        isOverdue(assignment)
    ).length;

    const pending = assignments.filter(
      (assignment) =>
        assignment?.completed !== true &&
        !isOverdue(assignment)
    ).length;

    return {
      assigned,
      pending,
      completed,
      overdue,
    };
  }, [assignments]);

  // ============================================================
  // PROCESS STATISTICS
  // ============================================================

  const processStats = useMemo(() => {
    const submitted = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 1
    ).length;

    const hod = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 2
    ).length;

    const dean = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 3
    ).length;

    const reviewer = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 4
    ).length;

    const committee = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 5
    ).length;

    const final = assignments.filter(
      (assignment) =>
        getWorkflowNumber(
          getWorkflowStage(assignment)
        ) === 6
    ).length;

    return {
      submitted,
      hod,
      dean,
      reviewer,
      committee,
      final,
    };
  }, [assignments]);

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // WORKFLOW BADGE
  // ============================================================

  const getWorkflowBadge = (assignment) => {
    const stage = getWorkflowStage(assignment);

    const stageStyles = {
      SUBMITTED: {
        background: "#f1f5f9",
        color: "#475569",
      },

      HOD: {
        background: "#ede9fe",
        color: "#6d28d9",
      },

      DEAN: {
        background: "#dbeafe",
        color: "#1d4ed8",
      },

      REVIEWER: {
        background: "#fef3c7",
        color: "#92400e",
      },

      "REVIEWER COMPLETED": {
        background: "#dcfce7",
        color: "#166534",
      },

      COMMITTEE: {
        background: "#e0e7ff",
        color: "#3730a3",
      },

      FINAL: {
        background: "#dcfce7",
        color: "#166534",
      },
    };

    return (
      <span
        style={{
          ...styles.workflowBadge,
          ...(stageStyles[stage] || {
            background: "#f1f5f9",
            color: "#475569",
          }),
        }}
      >
        {stage}
      </span>
    );
  };

  // ============================================================
  // REVIEW STATUS BADGE
  // ============================================================

  const getReviewerBadge = (assignment) => {
    const status = getReviewerStatus(
      assignment
    );

    if (status === "COMPLETED") {
      return (
        <span
          style={{
            ...styles.statusBadge,
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          }}
        >
          <FaCheckCircle />
          Completed
        </span>
      );
    }

    if (status === "OVERDUE") {
      return (
        <span
          style={{
            ...styles.statusBadge,
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          <FaExclamationTriangle />
          Overdue
        </span>
      );
    }

    return (
      <span
        style={{
          ...styles.statusBadge,
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fde68a",
        }}
      >
        <FaClock />
        Pending
      </span>
    );
  };

  // ============================================================
  // OPEN REVIEW
  // ============================================================

  const openReview = (assignment) => {
    const applicationId =
      getApplicationId(assignment);

    if (!applicationId) {
      setError(
        "This reviewer assignment does not contain a valid application ID."
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
          <FaSyncAlt
            style={styles.loadingSpinner}
          />

          <h2 style={styles.loadingTitle}>
            Loading Reviewer Dashboard
          </h2>

          <p style={styles.loadingText}>
            Retrieving your assigned promotion
            applications from Django...
          </p>
        </div>

        <style>
          {`
            @keyframes reviewerSpin {
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
      <div style={styles.container}>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div style={styles.header}>

          <div>
            <div style={styles.breadcrumb}>
              Reviewer Portal / Dashboard
            </div>

            <h1 style={styles.title}>
              Reviewer Dashboard
            </h1>

            <p style={styles.subtitle}>
              Academic Staff Promotion Review Management
            </p>
          </div>

          <div style={styles.headerActions}>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                ...styles.refreshButton,
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              <FaSyncAlt
                style={
                  refreshing
                    ? styles.refreshSpinner
                    : {}
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              onClick={() =>
                navigate(
                  "/reviewer/assigned-reviews"
                )
              }
              style={styles.primaryButton}
            >
              <FaClipboardList />
              View All Assignments
            </button>

          </div>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div style={styles.errorBox}>

            <FaExclamationTriangle />

            <div style={{ flex: 1 }}>
              <strong>
                Dashboard Error
              </strong>

              <div style={styles.errorText}>
                {error}
              </div>
            </div>

            <button
              onClick={handleRefresh}
              style={styles.retryButton}
            >
              Retry
            </button>

          </div>
        )}

        {/* ======================================================
            WORKFLOW TRACKER
        ====================================================== */}

        <div style={styles.workflowCard}>

          <div style={styles.workflowHeader}>

            <div>
              <h2 style={styles.workflowTitle}>
                Promotion Process Tracking
              </h2>

              <p style={styles.workflowSubtitle}>
                Track where assigned promotion applications
                are within the academic promotion process.
              </p>
            </div>

            <span style={styles.currentStageBadge}>
              Reviewer Stage
            </span>

          </div>

          <div style={styles.workflow}>

            {/* SUBMITTED */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  background:
                    processStats.submitted > 0
                      ? "#16a34a"
                      : "#e2e8f0",
                  color:
                    processStats.submitted > 0
                      ? "#fff"
                      : "#64748b",
                }}
              >
                <FaFileAlt />
              </div>

              <strong>
                Submitted
              </strong>

              <small>
                {processStats.submitted}
              </small>
            </div>

            <div style={styles.workflowLine} />

            {/* HOD */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  background:
                    processStats.hod > 0
                      ? "#16a34a"
                      : "#e2e8f0",
                  color:
                    processStats.hod > 0
                      ? "#fff"
                      : "#64748b",
                }}
              >
                <FaUserTie />
              </div>

              <strong>
                HOD
              </strong>

              <small>
                {processStats.hod}
              </small>
            </div>

            <div style={styles.workflowLine} />

            {/* DEAN */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  background:
                    processStats.dean > 0
                      ? "#2563eb"
                      : "#e2e8f0",
                  color:
                    processStats.dean > 0
                      ? "#fff"
                      : "#64748b",
                }}
              >
                <FaUniversity />
              </div>

              <strong>
                Dean
              </strong>

              <small>
                {processStats.dean}
              </small>
            </div>

            <div style={styles.workflowLine} />

            {/* REVIEWER */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  width: "42px",
                  height: "42px",
                  background: "#2563eb",
                  color: "#fff",
                  border:
                    "3px solid #bfdbfe",
                }}
              >
                <FaEye />
              </div>

              <strong style={{ color: "#1d4ed8" }}>
                Reviewer
              </strong>

              <small>
                {processStats.reviewer}
              </small>
            </div>

            <div style={styles.workflowLine} />

            {/* COMMITTEE */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  background:
                    processStats.committee > 0
                      ? "#16a34a"
                      : "#e2e8f0",
                  color:
                    processStats.committee > 0
                      ? "#fff"
                      : "#64748b",
                }}
              >
                <FaUsers />
              </div>

              <strong>
                Committee
              </strong>

              <small>
                {processStats.committee}
              </small>
            </div>

            <div style={styles.workflowLine} />

            {/* FINAL */}

            <div style={styles.workflowItem}>
              <div
                style={{
                  ...styles.workflowCircle,
                  background:
                    processStats.final > 0
                      ? "#16a34a"
                      : "#e2e8f0",
                  color:
                    processStats.final > 0
                      ? "#fff"
                      : "#64748b",
                }}
              >
                <FaFlagCheckered />
              </div>

              <strong>
                Final
              </strong>

              <small>
                {processStats.final}
              </small>
            </div>

          </div>
        </div>

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div style={styles.cardsGrid}>

          {/* ASSIGNED */}

          <div style={styles.summaryCard}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#dbeafe",
                color: "#2563eb",
              }}
            >
              <FaClipboardList />
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
                color: "#d97706",
              }}
            >
              <FaClock />
            </div>

            <div>
              <div style={styles.cardLabel}>
                Pending Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.pending}
              </div>

              <div style={styles.cardDescription}>
                Awaiting your assessment
              </div>
            </div>

          </div>

          {/* COMPLETED */}

          <div style={styles.summaryCard}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#dcfce7",
                color: "#16a34a",
              }}
            >
              <FaCheckCircle />
            </div>

            <div>
              <div style={styles.cardLabel}>
                Completed Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.completed}
              </div>

              <div style={styles.cardDescription}>
                Reviews submitted by you
              </div>
            </div>

          </div>

          {/* OVERDUE */}

          <div style={styles.summaryCard}>

            <div
              style={{
                ...styles.cardIcon,
                background: "#fee2e2",
                color: "#dc2626",
              }}
            >
              <FaExclamationTriangle />
            </div>

            <div>
              <div style={styles.cardLabel}>
                Overdue Reviews
              </div>

              <div style={styles.cardValue}>
                {summary.overdue}
              </div>

              <div style={styles.cardDescription}>
                Reviews past their deadline
              </div>
            </div>

          </div>

        </div>

        {/* ======================================================
            ASSIGNED APPLICATIONS
        ====================================================== */}

        <div style={styles.mainCard}>

          <div style={styles.tableHeader}>

            <div>
              <h2 style={styles.tableTitle}>
                Assigned Promotion Applications
              </h2>

              <p style={styles.tableSubtitle}>
                Applications assigned to you by the promotion
                workflow.
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
              <FaArrowRight />
            </button>

          </div>

          {/* ==================================================
              EMPTY
          ================================================== */}

          {assignments.length === 0 ? (
            <div style={styles.empty}>

              <FaUserGraduate
                size={50}
                style={styles.emptyIcon}
              />

              <h3 style={styles.emptyTitle}>
                No Applications Assigned
              </h3>

              <p style={styles.emptyText}>
                Django has not assigned any promotion
                applications to your reviewer account.
              </p>

              <button
                onClick={handleRefresh}
                style={styles.retryButton}
              >
                <FaSyncAlt />
                Refresh
              </button>

            </div>
          ) : (

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>

                    <th style={styles.th}>
                      Application
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
                      Process Stage
                    </th>

                    <th style={styles.th}>
                      Review Status
                    </th>

                    <th style={styles.th}>
                      Due Date
                    </th>

                    {/* <th style={styles.th}>
                      Action
                    </th> */}

                  </tr>
                </thead>

                <tbody>

                  {assignments
                    .slice(0, 10)
                    .map((assignment) => {

                      const applicationId =
                        getApplicationId(
                          assignment
                        );

                      const applicant =
                        getApplicantName(
                          assignment
                        );

                      const workflowStage =
                        getWorkflowStage(
                          assignment
                        );

                      const reviewerStatus =
                        getReviewerStatus(
                          assignment
                        );

                      const dueDate =
                        assignment?.due_date ||
                        assignment?.deadline ||
                        assignment?.review_due_date;

                      return (
                        <tr
                          key={
                            assignment?.id ||
                            applicationId
                          }
                          style={styles.tableRow}
                        >

                          {/* APPLICATION */}

                          <td style={styles.td}>

                            <strong
                              style={
                                styles.applicationId
                              }
                            >
                              APP-
                              {String(
                                applicationId ||
                                  assignment?.id ||
                                  ""
                              ).padStart(
                                3,
                                "0"
                              )}
                            </strong>

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
                                {applicant
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {applicant}
                              </span>

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          <td style={styles.td}>
                            {getDepartment(
                              assignment
                            )}
                          </td>

                          {/* CURRENT RANK */}

                          <td style={styles.td}>
                            {getCurrentRank(
                              assignment
                            )}
                          </td>

                          {/* TARGET RANK */}

                          <td style={styles.td}>
                            {getTargetRank(
                              assignment
                            )}
                          </td>

                          {/* PROCESS */}

                          <td style={styles.td}>
                            {getWorkflowBadge(
                              assignment
                            )}
                          </td>

                          {/* REVIEW STATUS */}

                          <td style={styles.td}>
                            {getReviewerBadge(
                              assignment
                            )}
                          </td>

                          {/* DUE DATE */}

                          <td style={styles.td}>
                            {formatDate(
                              dueDate
                            )}
                          </td>

                          {/* ACTION */}

                          {/* <td style={styles.td}>

                            <button
                              onClick={() =>
                                openReview(
                                  assignment
                                )
                              }
                              style={
                                reviewerStatus ===
                                "COMPLETED"
                                  ? styles.viewButton
                                  : styles.reviewButton
                              }
                            >

                              <FaEye />

                              {reviewerStatus ===
                              "COMPLETED"
                                ? "View Review"
                                : "Review"}

                            </button>

                          </td> */}

                        </tr>
                      );
                    })}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* ======================================================
            PROCESS EXPLANATION
        ====================================================== */}

        <div style={styles.infoCard}>

          <div style={styles.infoIcon}>
            <FaUniversity />
          </div>

          <div style={{ flex: 1 }}>

            <h3 style={styles.infoTitle}>
              Promotion Workflow
            </h3>

            <p style={styles.infoText}>
              The dashboard tracks the promotion
              application through the academic approval
              process. Your reviewer assignment status is
              tracked separately from the overall application
              status.
            </p>

            <div style={styles.processList}>

              <div style={styles.processItem}>
                <span style={styles.processNumber}>
                  1
                </span>

                <div>
                  <strong>
                    Submitted
                  </strong>

                  <small>
                    Staff submits promotion application
                  </small>
                </div>
              </div>

              <div style={styles.processArrow}>
                →
              </div>

              <div style={styles.processItem}>
                <span style={styles.processNumber}>
                  2
                </span>

                <div>
                  <strong>
                    HOD
                  </strong>

                  <small>
                    Departmental recommendation
                  </small>
                </div>
              </div>

              <div style={styles.processArrow}>
                →
              </div>

              <div style={styles.processItem}>
                <span style={styles.processNumber}>
                  3
                </span>

                <div>
                  <strong>
                    Dean
                  </strong>

                  <small>
                    Dean recommendation
                  </small>
                </div>
              </div>

              <div style={styles.processArrow}>
                →
              </div>

              <div style={styles.processItem}>
                <span
                  style={{
                    ...styles.processNumber,
                    background: "#2563eb",
                  }}
                >
                  4
                </span>

                <div>
                  <strong>
                    Reviewer
                  </strong>

                  <small>
                    Academic assessment
                  </small>
                </div>
              </div>

              <div style={styles.processArrow}>
                →
              </div>

              <div style={styles.processItem}>
                <span style={styles.processNumber}>
                  5
                </span>

                <div>
                  <strong>
                    Committee
                  </strong>

                  <small>
                    Promotion committee decision
                  </small>
                </div>
              </div>

              <div style={styles.processArrow}>
                →
              </div>

              <div style={styles.processItem}>
                <span style={styles.processNumber}>
                  6
                </span>

                <div>
                  <strong>
                    Final
                  </strong>

                  <small>
                    Final promotion outcome
                  </small>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          INLINE CSS
      ======================================================== */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          button {
            font-family: inherit;
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          tr:hover {
            background: #f8fafc;
          }

          @keyframes reviewerSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1100px) {
            .reviewer-workflow {
              overflow-x: auto;
            }
          }

          @media (max-width: 700px) {
            body {
              overflow-x: hidden;
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
    background: "#f5f7fb",
    padding: "30px",
    color: "#1e293b",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1450px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
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
    flexWrap: "wrap",
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

  refreshSpinner: {
    animation:
      "reviewerSpin 1s linear infinite",
  },

  primaryButton: {
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
    marginTop: "4px",
    fontSize: "13px",
  },

  retryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  // ==========================================================
  // WORKFLOW
  // ==========================================================

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
    flexWrap: "wrap",
  },

  workflowTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#172554",
  },

  workflowSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  currentStageBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },

  workflow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflowX: "auto",
    paddingBottom: "5px",
    gap: "0",
  },

  workflowItem: {
    minWidth: "95px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    color: "#475569",
    fontSize: "11px",
    textAlign: "center",
  },

  workflowCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "800",
  },

  workflowLine: {
    height: "4px",
    flex: 1,
    minWidth: "25px",
    background: "#cbd5e1",
  },

  // ==========================================================
  // CARDS
  // ==========================================================

  cardsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(200px, 1fr))",
    gap: "17px",
    marginBottom: "25px",
  },

  summaryCard: {
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

  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  cardLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
  },

  cardValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#172554",
    margin: "4px 0 2px",
  },

  cardDescription: {
    fontSize: "10px",
    color: "#94a3b8",
  },

  // ==========================================================
  // TABLE
  // ==========================================================

  mainCard: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginBottom: "25px",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.04)",
  },

  tableHeader: {
    padding: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #e2e8f0",
  },

  tableTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "20px",
    fontWeight: "800",
  },

  tableSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1250px",
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

  tableRow: {
    borderBottom:
      "1px solid #eef2f7",
  },

  td: {
    padding: "14px 12px",
    fontSize: "12px",
    color: "#334155",
    verticalAlign: "middle",
  },

  applicationId: {
    color: "#2563eb",
    fontWeight: "800",
  },

  applicant: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: "170px",
    fontWeight: "700",
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

  workflowBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  reviewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "7px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
  },

  emptyIcon: {
    color: "#94a3b8",
    marginBottom: "10px",
  },

  emptyTitle: {
    color: "#374151",
    margin: "5px 0 8px",
  },

  emptyText: {
    maxWidth: "550px",
    margin: "0 auto 18px",
    lineHeight: "1.6",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoCard: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: "13px",
  },

  processList: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  processItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#1e3a8a",
    fontSize: "12px",
  },

  processItemSmall: {
    display: "block",
  },

  processNumber: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#93c5fd",
    color: "#1e3a8a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },

  processArrow: {
    color: "#93c5fd",
    fontWeight: "800",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingCard: {
    maxWidth: "550px",
    margin: "100px auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "60px 30px",
    textAlign: "center",
    boxShadow:
      "0 4px 20px rgba(15,23,42,0.08)",
  },

  loadingSpinner: {
    fontSize: "38px",
    color: "#2563eb",
    animation:
      "reviewerSpin 1s linear infinite",
  },

  loadingTitle: {
    margin: "18px 0 6px",
    color: "#172554",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
};

export default Dashboard;