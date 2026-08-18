import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const response = await api.get(
        "/api/applications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data || []);

    } catch (error) {
      console.error(
        "Error loading HOD applications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STATUS COUNTS
  // ============================================================

  const pending = applications.filter(
    (app) =>
      String(app.final_status || "").toLowerCase() ===
      "pending"
  ).length;

  const underReview = applications.filter(
    (app) =>
      String(app.final_status || "").toLowerCase() ===
      "under review"
  ).length;

  const recommended = applications.filter(
    (app) =>
      String(
        app.hod_recommendation || ""
      ).toLowerCase() === "recommended"
  ).length;

  const rejected = applications.filter(
    (app) =>
      String(app.final_status || "").toLowerCase() ===
      "rejected"
  ).length;

  // ============================================================
  // RECENT APPLICATIONS
  // ============================================================

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(
          b.created_at || b.submitted_at
        ) -
        new Date(
          a.created_at || a.submitted_at
        )
    )
    .slice(0, 5);

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    return (
      app.employee_name ||
      app.employee?.name ||
      app.employee?.username ||
      "Unknown Applicant"
    );
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (app) => {
    const status = String(
      app.final_status || "Pending"
    ).toLowerCase();

    if (status === "approved") {
      return (
        <span style={styles.approved}>
          <FaCheckCircle />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span style={styles.rejected}>
          <FaTimesCircle />
          Rejected
        </span>
      );
    }

    if (status === "under review") {
      return (
        <span style={styles.review}>
          <FaEye />
          Under Review
        </span>
      );
    }

    return (
      <span style={styles.pending}>
        <FaClock />
        Pending
      </span>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading HOD Dashboard...
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
            Overview of promotion activities in your
            department.
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
          STATISTICS
      ====================================================== */}

      <div style={styles.cards}>

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

                        <strong>
                          {getApplicantName(app)}
                        </strong>

                      </td>

                      <td style={styles.td}>
                        {app.current_title_name ||
                          "—"}
                      </td>

                      <td style={styles.td}>
                        {app.targeted_title_name ||
                          "—"}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          app.created_at ||
                          app.submitted_at
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
                      No promotion applications
                      found.
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
      "repeat(4, 1fr)",
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
  },

  tr: {
    borderBottom:
      "1px solid #eef2f7",
  },

  td: {
    padding: "14px 13px",
    fontSize: "13px",
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

  loading: {
    background: "#ffffff",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
  },

};

export default Dashboard;