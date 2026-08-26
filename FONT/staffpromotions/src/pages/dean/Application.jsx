import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaClipboardList,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaSync,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Application() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ============================================================
  // FETCH APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  // ============================================================
  // FETCH
  // ============================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DEAN APPLICATIONS:", response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.results)) {
        data = response.data.results;
      }

      /*
       * IMPORTANT
       *
       * We retrieve all applications first.
       *
       * The Dean page then determines which applications
       * have passed the HOD stage.
       */

      setApplications(data);
      setFilteredApplications(data);

    } catch (err) {
      console.error(
        "Failed to load Dean applications:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access Dean applications."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to load promotion applications."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NORMALIZE
  // ============================================================

  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ");
  };

  // ============================================================
  // GET HOD RECOMMENDATION
  // ============================================================

  const getHODRecommendation = (app) => {
    return (
      app.hod_recommendation ||
      app.hod_status ||
      app.recommendation ||
      app.manager_status ||
      "Pending"
    );
  };

  // ============================================================
  // GET DEAN STATUS
  // ============================================================

  const getDeanStatus = (app) => {
    return (
      app.dean_status ||
      app.dean_decision ||
      app.dean_recommendation ||
      "Pending"
    );
  };

  // ============================================================
  // GET REVIEWER STATUS
  // ============================================================

  const getReviewerStatus = (app) => {
    return (
      app.reviewer_status ||
      app.reviewer_decision ||
      app.academic_reviewer_status ||
      "Waiting"
    );
  };

  // ============================================================
  // GET STUDENT EVALUATION STATUS
  // ============================================================

  const getStudentEvaluationStatus = (app) => {
    return (
      app.student_evaluation_status ||
      app.student_review_status ||
      app.teaching_evaluation_status ||
      "Waiting"
    );
  };

  // ============================================================
  // GET COMMITTEE STATUS
  // ============================================================

  const getCommitteeStatus = (app) => {
    return (
      app.committee_status ||
      app.committee_decision ||
      "Waiting"
    );
  };

  // ============================================================
  // CHECK IF APPLICATION REACHED DEAN
  // ============================================================

  const hasReachedDean = (app) => {
    const hod = normalize(getHODRecommendation(app));

    /*
     * An application reaches Dean after HOD recommends it.
     */

    return (
      hod === "recommended" ||
      hod === "recommend" ||
      hod === "approved" ||
      normalize(app.status) === "dean review" ||
      normalize(app.status) === "pending dean review"
    );
  };

  // ============================================================
  // FILTER APPLICATIONS
  // ============================================================

  useEffect(() => {

    let result = [...applications];

    // ----------------------------------------------------------
    // ONLY APPLICATIONS THAT REACHED DEAN
    // ----------------------------------------------------------

    result = result.filter((app) => hasReachedDean(app));

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search.trim()) {

      const keyword = search.toLowerCase();

      result = result.filter((app) => {

        const applicant =
          app.employee_name ||
          app.applicant_name ||
          app.employee?.full_name ||
          app.employee?.name ||
          app.employee?.username ||
          app.user?.full_name ||
          app.user?.username ||
          "";

        const currentPosition =
          app.current_title_name ||
          app.current_position ||
          app.current_title?.title_name ||
          "";

        const targetPosition =
          app.targeted_title_name ||
          app.target_position ||
          app.targeted_title?.title_name ||
          "";

        return (
          String(applicant)
            .toLowerCase()
            .includes(keyword) ||

          String(currentPosition)
            .toLowerCase()
            .includes(keyword) ||

          String(targetPosition)
            .toLowerCase()
            .includes(keyword) ||

          String(app.id)
            .toLowerCase()
            .includes(keyword)
        );
      });
    }

    // ----------------------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------------------

    if (statusFilter !== "all") {

      result = result.filter((app) => {

        const status = normalize(getDeanStatus(app));

        if (statusFilter === "pending") {
          return (
            status === "pending" ||
            status === "waiting" ||
            status === ""
          );
        }

        if (statusFilter === "approved") {
          return (
            status.includes("approved") ||
            status.includes("recommended")
          );
        }

        if (statusFilter === "rejected") {
          return (
            status.includes("rejected") ||
            status.includes("not recommended")
          );
        }

        return true;
      });
    }

    setFilteredApplications(result);

  }, [
    applications,
    search,
    statusFilter,
  ]);

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {

    return (
      app.employee_name ||
      app.applicant_name ||
      app.employee?.full_name ||
      app.employee?.name ||
      app.employee?.username ||
      app.user?.full_name ||
      app.user?.name ||
      app.user?.username ||
      "Unknown Applicant"
    );
  };

  // ============================================================
  // CURRENT POSITION
  // ============================================================

  const getCurrentPosition = (app) => {

    return (
      app.current_title_name ||
      app.current_position ||
      app.current_title?.title_name ||
      app.employee?.current_position ||
      "—"
    );
  };

  // ============================================================
  // TARGET POSITION
  // ============================================================

  const getTargetPosition = (app) => {

    return (
      app.targeted_title_name ||
      app.target_position ||
      app.target_title ||
      app.targeted_title?.title_name ||
      app.promotion_title ||
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
  // STATUS BADGE
  // ============================================================

  const StatusBadge = ({ value }) => {

    const status = normalize(value);

    if (
      status.includes("approved") ||
      status.includes("recommended") ||
      status.includes("complete")
    ) {
      return (
        <span style={styles.approved}>
          <FaCheckCircle />
          {value}
        </span>
      );
    }

    if (
      status.includes("reject") ||
      status.includes("not recommended")
    ) {
      return (
        <span style={styles.rejected}>
          <FaTimesCircle />
          {value}
        </span>
      );
    }

    if (
      status.includes("review")
    ) {
      return (
        <span style={styles.review}>
          <FaEye />
          {value}
        </span>
      );
    }

    return (
      <span style={styles.pending}>
        <FaClock />
        {value || "Pending"}
      </span>
    );
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const deanApplications = applications.filter(
    hasReachedDean
  );

  const pendingCount = deanApplications.filter((app) => {

    const status = normalize(getDeanStatus(app));

    return (
      status === "pending" ||
      status === "waiting" ||
      status === ""
    );

  }).length;

  const approvedCount = deanApplications.filter((app) => {

    const status = normalize(getDeanStatus(app));

    return (
      status.includes("approved") ||
      status.includes("recommended")
    );

  }).length;

  const rejectedCount = deanApplications.filter((app) => {

    const status = normalize(getDeanStatus(app));

    return (
      status.includes("rejected") ||
      status.includes("not recommended")
    );

  }).length;

  // ============================================================
  // OPEN APPLICATION
  // ============================================================

  const openApplication = (app) => {

    navigate(`/dean/application/${app.id}`);

  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div style={styles.page}>

        <div style={styles.loading}>

          <div style={styles.spinner}></div>

          <p>
            Loading Dean applications...
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

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Dean Applications
          </h1>

          <p style={styles.subtitle}>
            Review promotion applications recommended by
            the Head of Department.
          </p>

        </div>

        <button
          style={styles.refreshButton}
          onClick={fetchApplications}
        >
          <FaSync />
          Refresh
        </button>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div style={styles.error}>

          <FaTimesCircle />

          <span>
            {error}
          </span>

          <button
            onClick={fetchApplications}
            style={styles.retry}
          >
            Retry
          </button>

        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div style={styles.stats}>

        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#eef2ff",
              color: "#4f46e5",
            }}
          >
            <FaClipboardList />
          </div>

          <div>

            <span style={styles.statLabel}>
              Dean Applications
            </span>

            <strong style={styles.statNumber}>
              {deanApplications.length}
            </strong>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fff7ed",
              color: "#ea580c",
            }}
          >
            <FaClock />
          </div>

          <div>

            <span style={styles.statLabel}>
              Pending Review
            </span>

            <strong style={styles.statNumber}>
              {pendingCount}
            </strong>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#ecfdf5",
              color: "#16a34a",
            }}
          >
            <FaCheckCircle />
          </div>

          <div>

            <span style={styles.statLabel}>
              Approved / Recommended
            </span>

            <strong style={styles.statNumber}>
              {approvedCount}
            </strong>

          </div>

        </div>


        <div style={styles.statCard}>

          <div
            style={{
              ...styles.statIcon,
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            <FaTimesCircle />
          </div>

          <div>

            <span style={styles.statLabel}>
              Rejected
            </span>

            <strong style={styles.statNumber}>
              {rejectedCount}
            </strong>

          </div>

        </div>

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div style={styles.filterCard}>

        <div style={styles.searchBox}>

          <FaSearch />

          <input
            type="text"
            placeholder="Search applicant, position or application ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.searchInput}
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={styles.select}
        >
          <option value="all">
            All Dean Applications
          </option>

          <option value="pending">
            Pending Dean Review
          </option>

          <option value="approved">
            Approved / Recommended
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

      </div>

      {/* ======================================================
          APPLICATIONS TABLE
      ====================================================== */}

      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>

          <div>

            <h2 style={styles.tableTitle}>
              Promotion Applications
            </h2>

            <p style={styles.tableSubtitle}>
              Applications forwarded from HOD for Dean review.
            </p>

          </div>

          <span style={styles.resultCount}>
            {filteredApplications.length} applications
          </span>

        </div>

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
                  Current Position
                </th>

                <th style={styles.th}>
                  Applied Position
                </th>

                <th style={styles.th}>
                  HOD Recommendation
                </th>

                <th style={styles.th}>
                  Dean Status
                </th>

                <th style={styles.th}>
                  Date
                </th>

                <th style={styles.th}>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredApplications.length > 0 ? (

                filteredApplications.map(
                  (app, index) => (

                    <tr
                      key={app.id}
                      style={styles.tr}
                    >

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      {/* APPLICANT */}

                      <td style={styles.td}>

                        <div style={styles.applicant}>

                          <div style={styles.avatar}>
                            {getApplicantName(app)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {getApplicantName(app)}
                            </strong>

                            <small>
                              Application #{app.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* CURRENT POSITION */}

                      <td style={styles.td}>
                        {getCurrentPosition(app)}
                      </td>

                      {/* TARGET */}

                      <td style={styles.td}>

                        <strong style={styles.target}>
                          {getTargetPosition(app)}
                        </strong>

                      </td>

                      {/* HOD */}

                      <td style={styles.td}>

                        <StatusBadge
                          value={
                            getHODRecommendation(app)
                          }
                        />

                      </td>

                      {/* DEAN */}

                      <td style={styles.td}>

                        <StatusBadge
                          value={
                            getDeanStatus(app)
                          }
                        />

                      </td>

                      {/* DATE */}

                      <td style={styles.td}>

                        {formatDate(
                          app.created_at ||
                          app.submitted_at ||
                          app.application_date
                        )}

                      </td>

                      {/* ACTION */}

                      <td style={styles.td}>

                        <button
                          style={styles.viewButton}
                          onClick={() =>
                            openApplication(app)
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
                    colSpan="8"
                    style={styles.empty}
                  >

                    <FaFileAlt
                      size={40}
                      color="#94a3b8"
                    />

                    <h3>
                      No Dean Applications
                    </h3>

                    <p>
                      There are currently no promotion
                      applications waiting for Dean review.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

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
    background: "#f5f7fb",
    padding: "30px",
    color: "#1e293b",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#172554",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 17px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  retry: {
    marginLeft: "auto",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "18px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "5px",
  },

  statNumber: {
    fontSize: "25px",
    color: "#172554",
  },

  filterCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  searchBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0 13px",
    color: "#64748b",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "11px 0",
    fontSize: "14px",
  },

  select: {
    minWidth: "220px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
  },

  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px",
    borderBottom: "1px solid #e2e8f0",
  },

  tableTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#172554",
  },

  tableSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  resultCount: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

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
    padding: "13px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #eef2f7",
  },

  td: {
    padding: "14px 13px",
    fontSize: "13px",
    verticalAlign: "middle",
  },

  applicant: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  target: {
    color: "#1d4ed8",
  },

  approved: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  rejected: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  review: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  pending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },

  loading: {
    background: "#fff",
    borderRadius: "12px",
    padding: "70px",
    textAlign: "center",
    color: "#64748b",
  },

  spinner: {
    width: "35px",
    height: "35px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 15px",
    animation:
      "spin 1s linear infinite",
  },
};

export default Application;

