import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  FaHistory,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

function History() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH PROMOTION HISTORY
  // ============================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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
      setFilteredApplications(response.data || []);

    } catch (error) {
      console.error(
        "Failed to fetch promotion history:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  useEffect(() => {
    let result = [...applications];

    // SEARCH
    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((app) => {

        const applicant =
          app.employee_name ||
          app.employee?.name ||
          app.employee?.username ||
          "";

        return (
          String(applicant)
            .toLowerCase()
            .includes(value) ||

          String(
            app.current_title_name || ""
          )
            .toLowerCase()
            .includes(value) ||

          String(
            app.targeted_title_name || ""
          )
            .toLowerCase()
            .includes(value)
        );
      });
    }

    // STATUS
    if (statusFilter !== "All") {
      result = result.filter(
        (app) =>
          String(app.final_status || "")
            .toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    setFilteredApplications(result);

  }, [search, statusFilter, applications]);

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (status) => {

    const value = String(status || "Pending")
      .toLowerCase();

    if (value === "approved") {
      return (
        <span style={styles.approved}>
          <FaCheckCircle />
          Approved
        </span>
      );
    }

    if (value === "rejected") {
      return (
        <span style={styles.rejected}>
          <FaTimesCircle />
          Rejected
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
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {

    if (app.employee_name) {
      return app.employee_name;
    }

    if (app.employee?.name) {
      return app.employee.name;
    }

    if (app.employee?.username) {
      return app.employee.username;
    }

    return "Unknown Applicant";
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {

    if (!date) {
      return "—";
    }

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
  // SUMMARY
  // ============================================================

  const total = applications.length;

  const approved = applications.filter(
    (app) =>
      String(app.final_status).toLowerCase() ===
      "approved"
  ).length;

  const rejected = applications.filter(
    (app) =>
      String(app.final_status).toLowerCase() ===
      "rejected"
  ).length;

  const pending = applications.filter(
    (app) =>
      String(app.final_status).toLowerCase() ===
      "pending"
  ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading promotion history...
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
            Promotion History
          </h1>

          <p style={styles.subtitle}>
            View previous promotion applications and
            HOD recommendations.
          </p>

        </div>

        <div style={styles.historyIcon}>
          <FaHistory />
        </div>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div style={styles.cards}>

        <div style={styles.card}>
          <span>Total Applications</span>
          <strong>{total}</strong>
        </div>

        <div style={styles.card}>
          <span>Approved</span>
          <strong>{approved}</strong>
        </div>

        <div style={styles.card}>
          <span>Rejected</span>
          <strong>{rejected}</strong>
        </div>

        <div style={styles.card}>
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div style={styles.toolbar}>

        <div style={styles.searchBox}>

          <FaSearch style={styles.searchIcon} />

          <input
            type="text"
            placeholder="Search applicant or position..."
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
          <option value="All">
            All Status
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>

          <option value="Pending">
            Pending
          </option>

        </select>

      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div style={styles.tableCard}>

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
                Date Submitted
              </th>

              <th style={styles.th}>
                HOD Recommendation
              </th>

              <th style={styles.th}>
                Final Status
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

                      <strong>
                        {getApplicantName(app)}
                      </strong>

                    </td>

                    {/* CURRENT POSITION */}

                    <td style={styles.td}>
                      {app.current_title_name || "—"}
                    </td>

                    {/* TARGET POSITION */}

                    <td style={styles.td}>
                      {app.targeted_title_name || "—"}
                    </td>

                    {/* DATE */}

                    <td style={styles.td}>
                      {formatDate(
                        app.created_at ||
                        app.submitted_at
                      )}
                    </td>

                    {/* RECOMMENDATION */}

                    <td style={styles.td}>

                      {app.hod_recommendation ||
                        "Not available"}

                    </td>

                    {/* STATUS */}

                    <td style={styles.td}>
                      {getStatus(
                        app.final_status
                      )}
                    </td>

                    {/* ACTION */}

                    <td style={styles.td}>

                      <button
                        style={styles.viewButton}
                        onClick={() =>
                          window.location.href =
                            `/hod/application/${app.id}`
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
                  colSpan="8"
                  style={styles.empty}
                >

                  <FaHistory size={35} />

                  <p>
                    No promotion history found.
                  </p>

                </td>

              </tr>

            )}

          </tbody>

        </table>

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
    background: "#f5f7fb",
    minHeight: "100vh",
    color: "#1e293b",
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
    marginTop: "7px",
    color: "#64748b",
  },

  historyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  searchBox: {
    position: "relative",
    width: "400px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "13px",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding:
      "11px 15px 11px 40px",
    border:
      "1px solid #dbe2ea",
    borderRadius: "8px",
    outline: "none",
    background: "#ffffff",
  },

  select: {
    padding: "11px 15px",
    border:
      "1px solid #dbe2ea",
    borderRadius: "8px",
    background: "#ffffff",
    outline: "none",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: "14px",
    textAlign: "left",
    fontSize: "13px",
    color: "#475569",
    borderBottom:
      "1px solid #e2e8f0",
  },

  tr: {
    borderBottom:
      "1px solid #eef2f7",
  },

  td: {
    padding: "14px",
    fontSize: "13px",
  },

  approved: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "600",
  },

  rejected: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "600",
  },

  pending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#fef3c7",
    color: "#92400e",
    padding: "5px 9px",
    borderRadius: "15px",
    fontWeight: "600",
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
    padding: "50px",
    color: "#94a3b8",
  },

  loading: {
    background: "#ffffff",
    padding: "40px",
    textAlign: "center",
    borderRadius: "10px",
  },

};

export default History;