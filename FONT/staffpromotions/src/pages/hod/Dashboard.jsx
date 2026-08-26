import React, { useEffect, useState } from "react";
import api from "../../services/api";

import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("HOD Applications:", response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.results)) {
        data = response.data.results;
      }

      setApplications(data);
    } catch (error) {
      console.error("Error loading HOD applications:", error);

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to view these applications."
        );
      } else {
        setError(
          error.response?.data?.detail ||
            "Unable to load promotion applications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NORMALIZE VALUE
  // ============================================================

  const normalizeStatus = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ");
  };

  // ============================================================
  // GET APPLICATION STATUS
  // ============================================================

  const getApplicationStatus = (app) => {
    return normalizeStatus(
      app.final_status ||
        app.status ||
        app.application_status ||
        app.workflow_status
    );
  };

  // ============================================================
  // GET HOD RECOMMENDATION
  // ============================================================

  const getRecommendation = (app) => {
    return normalizeStatus(
      app.hod_recommendation ||
        app.recommendation ||
        app.hod_status
    );
  };

  // ============================================================
  // TOTAL APPLICATIONS
  // ============================================================

  const totalApplications = applications.length;

  // ============================================================
  // PENDING
  //
  // Includes applications submitted/pending and waiting
  // for HOD action.
  // ============================================================

  const pending = applications.filter((app) => {
    const status = getApplicationStatus(app);
    const recommendation = getRecommendation(app);

    return (
      (
        status === "pending" ||
        status === "submitted" ||
        status === "new"
      ) &&
      !recommendation
    );
  }).length;

  // ============================================================
  // UNDER REVIEW
  // ============================================================

  const underReview = applications.filter((app) => {
    const status = getApplicationStatus(app);

    return (
      status === "under review" ||
      status === "review" ||
      status === "in review" ||
      status === "under_review"
    );
  }).length;

  // ============================================================
  // RECOMMENDED
  // ============================================================

  const recommended = applications.filter((app) => {
    const recommendation = getRecommendation(app);

    return (
      recommendation === "recommended" ||
      recommendation === "recommend"
    );
  }).length;

  // ============================================================
  // REJECTED
  // ============================================================

  const rejected = applications.filter((app) => {
    const status = getApplicationStatus(app);
    const recommendation = getRecommendation(app);

    return (
      status === "rejected" ||
      status === "not recommended" ||
      recommendation === "rejected" ||
      recommendation === "not recommended" ||
      recommendation === "not recommend"
    );
  }).length;

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    return (
      app.employee_name ||
      app.applicant_name ||
      app.employee?.name ||
      app.employee?.full_name ||
      app.employee?.username ||
      app.user?.name ||
      app.user?.full_name ||
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
      app.current_title ||
      app.employee?.current_position ||
      app.employee?.position ||
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
  // STATUS BADGE
  // ============================================================

  const getStatus = (app) => {
    const status = getApplicationStatus(app);
    const recommendation = getRecommendation(app);

    // REJECTED
    if (
      status === "rejected" ||
      status === "not recommended" ||
      recommendation === "rejected" ||
      recommendation === "not recommended" ||
      recommendation === "not recommend"
    ) {
      return (
        <span style={styles.rejected}>
          <FaTimesCircle />
          Rejected
        </span>
      );
    }

    // APPROVED
    if (
      status === "approved" ||
      status === "promoted"
    ) {
      return (
        <span style={styles.approved}>
          <FaCheckCircle />
          Approved
        </span>
      );
    }

    // RECOMMENDED
    if (
      recommendation === "recommended" ||
      recommendation === "recommend"
    ) {
      return (
        <span style={styles.recommended}>
          <FaCheckCircle />
          Recommended
        </span>
      );
    }

    // UNDER REVIEW
    if (
      status === "under review" ||
      status === "review" ||
      status === "in review"
    ) {
      return (
        <span style={styles.review}>
          <FaEye />
          Under Review
        </span>
      );
    }

    // PENDING
    return (
      <span style={styles.pending}>
        <FaClock />
        Pending
      </span>
    );
  };

  // ============================================================
  // RECENT APPLICATIONS
  // ============================================================

  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at ||
          a.submitted_at ||
          a.application_date ||
          0
      );

      const dateB = new Date(
        b.created_at ||
          b.submitted_at ||
          b.application_date ||
          0
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <FaSpinner style={styles.spinner} />

          <p>
            Loading HOD Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            HOD Dashboard
          </h1>

          <p style={styles.subtitle}>
            Overview of promotion activities in your department.
          </p>
        </div>

        <button
          style={styles.applicationButton}
          onClick={() =>
            navigate("/hod/applications")
          }
        >
          <FaClipboardList />
          View Applications
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={styles.errorBox}>

          <FaTimesCircle />

          <span>
            {error}
          </span>

          <button
            style={styles.retryButton}
            onClick={fetchApplications}
          >
            Retry
          </button>

        </div>
      )}


      {/* ======================================================
          STATISTICS
      ====================================================== */}

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
              {pending}
            </h2>
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
          </div>

        </div>

      </div>


      {/* ======================================================
          RECENT APPLICATIONS
      ====================================================== */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>

          <div>

            <h2 style={styles.sectionTitle}>
              Recent Applications
            </h2>

            <p style={styles.sectionSubtitle}>
              Latest promotion applications submitted
              by academic staff.
            </p>

          </div>

          <button
            style={styles.viewAll}
            onClick={() =>
              navigate("/hod/applications")
            }
          >
            View All
            <FaArrowRight />
          </button>

        </div>


        {/* ====================================================
            TABLE
        ==================================================== */}

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
                  Target Position
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

                      <td style={styles.td}>
                        {index + 1}
                      </td>


                      <td style={styles.td}>

                        <div
                          style={styles.applicantCell}
                        >

                          <div style={styles.avatar}>
                            {getApplicantName(app)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {getApplicantName(app)}
                          </strong>

                        </div>

                      </td>


                      <td style={styles.td}>
                        {getCurrentPosition(app)}
                      </td>


                      <td style={styles.td}>
                        {getTargetPosition(app)}
                      </td>


                      <td style={styles.td}>
                        {formatDate(
                          app.created_at ||
                            app.submitted_at ||
                            app.application_date
                        )}
                      </td>


                      <td style={styles.td}>
                        {getStatus(app)}
                      </td>


                      <td style={styles.td}>

                        <button
                          style={styles.viewButton}
                          onClick={() =>
                            navigate(
                              `/hod/application/${app.id}`
                            )
                          }
                        >

                          <FaEye />

                          View

                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    style={styles.empty}
                  >

                    <FaClipboardList
                      size={35}
                    />

                    <p>
                      No promotion applications found.
                    </p>

                    <button
                      style={styles.emptyButton}
                      onClick={fetchApplications}
                    >
                      Refresh
                    </button>

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
// INLINE CSS
// ============================================================

const styles = {

  page: {
    padding: "30px",
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#1e293b",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#172554",
  },

  subtitle: {
    marginTop: "7px",
    marginBottom: 0,
    color: "#64748b",
  },

  applicationButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 17px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(180px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
    minHeight: "85px",
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  cardTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  number: {
    margin: "5px 0 0",
    fontSize: "25px",
    color: "#172554",
  },

  section: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#172554",
  },

  sectionSubtitle: {
    marginTop: "5px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "13px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    borderBottom:
      "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom:
      "1px solid #eef2f7",
  },

  td: {
    padding: "14px 13px",
    fontSize: "13px",
  },

  applicantCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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

  approved: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "600",
    fontSize: "12px",
  },

  recommended: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "600",
    fontSize: "12px",
  },

  rejected: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: "600",
    fontSize: "12px",
  },

  pending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: "600",
    fontSize: "12px",
  },

  review: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 9px",
    borderRadius: "15px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: "12px",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 11px",
    border: "none",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    padding: "45px",
    color: "#94a3b8",
  },

  emptyButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  loading: {
    background: "#ffffff",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
  },

  spinner: {
    fontSize: "28px",
    animation: "spin 1s linear infinite",
  },

  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  retryButton: {
    marginLeft: "auto",
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Dashboard;