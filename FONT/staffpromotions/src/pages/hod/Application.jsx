import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Application() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ============================================================
  // FETCH HOD APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setApplications(data);

    } catch (err) {
      console.error(
        "Failed to load applications:",
        err.response?.data || err
      );

      setError(
        "Failed to load promotion applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase();

    if (
      value === "approved" ||
      value === "recommended"
    ) {
      return "approved";
    }

    if (
      value === "rejected"
    ) {
      return "rejected";
    }

    if (
      value === "pending" ||
      value === "under review" ||
      value === "submitted"
    ) {
      return "pending";
    }

    return "default";
  };

  // ============================================================
  // FILTER APPLICATIONS
  // ============================================================

  const filteredApplications = applications.filter(
    (application) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const employeeName =
        application.employee_name ||
        application.full_name ||
        application.employee?.full_name ||
        application.employee?.name ||
        "";

      const currentPosition =
        application.current_title_name ||
        application.current_title?.title_name ||
        "";

      const targetPosition =
        application.targeted_title_name ||
        application.targeted_title?.title_name ||
        "";

      const matchesSearch =
        !searchText ||
        employeeName
          .toLowerCase()
          .includes(searchText) ||
        currentPosition
          .toLowerCase()
          .includes(searchText) ||
        targetPosition
          .toLowerCase()
          .includes(searchText);

      const applicationStatus = String(
        application.manager_status ||
          application.hod_status ||
          application.final_status ||
          "Pending"
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        applicationStatus ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // ============================================================
  // COUNTS
  // ============================================================

  const total = applications.length;

  const pending = applications.filter(
    (application) => {
      const status = String(
        application.manager_status ||
          application.hod_status ||
          application.final_status ||
          "Pending"
      ).toLowerCase();

      return (
        status === "pending" ||
        status === "submitted" ||
        status === "under review"
      );
    }
  ).length;

  const recommended = applications.filter(
    (application) => {
      const status = String(
        application.manager_status ||
          application.hod_status ||
          ""
      ).toLowerCase();

      return status === "recommended";
    }
  ).length;

  const rejected = applications.filter(
    (application) => {
      const status = String(
        application.manager_status ||
          application.hod_status ||
          application.final_status ||
          ""
      ).toLowerCase();

      return status === "rejected";
    }
  ).length;

  // ============================================================
  // OPEN APPLICATION
  // ============================================================

  const openApplication = (id) => {
    navigate(`/hod/application/${id}`);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>
          <h2 style={styles.title}>
            Promotion Applications
          </h2>

          <p style={styles.subtitle}>
            Review promotion applications submitted
            by academic staff in your department.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          style={styles.refreshButton}
        >
          ↻ Refresh
        </button>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div style={styles.cards}>

        <div style={styles.card}>
          <span style={styles.cardLabel}>
            Total Applications
          </span>

          <strong style={styles.cardNumber}>
            {total}
          </strong>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>
            Pending Review
          </span>

          <strong style={styles.cardNumber}>
            {pending}
          </strong>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>
            Recommended
          </span>

          <strong style={styles.cardNumber}>
            {recommended}
          </strong>
        </div>

        <div style={styles.card}>
          <span style={styles.cardLabel}>
            Rejected
          </span>

          <strong style={styles.cardNumber}>
            {rejected}
          </strong>
        </div>

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div style={styles.filterBox}>

        <input
          type="text"
          placeholder="Search staff, current position or target position..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={styles.statusSelect}
        >

          <option value="ALL">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Recommended">
            Recommended
          </option>

          <option value="Rejected">
            Rejected
          </option>

        </select>

      </div>

      {/* ======================================================
          APPLICATION TABLE
      ====================================================== */}

      <div style={styles.tableContainer}>

        <div style={styles.tableHeader}>

          <h3 style={styles.tableTitle}>
            Staff Applications
          </h3>

          <span style={styles.resultCount}>
            {filteredApplications.length} application(s)
          </span>

        </div>

        {loading ? (

          <div style={styles.loading}>
            Loading applications...
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    ID
                  </th>

                  <th style={styles.th}>
                    Staff Name
                  </th>

                  <th style={styles.th}>
                    Current Position
                  </th>

                  <th style={styles.th}>
                    Applied Position
                  </th>

                  <th style={styles.th}>
                    Material Points
                  </th>

                  <th style={styles.th}>
                    HOD Status
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
                    (application) => {

                      const employeeName =
                        application.employee_name ||
                        application.full_name ||
                        application.employee?.full_name ||
                        application.employee?.name ||
                        "Unknown";

                      const currentPosition =
                        application.current_title_name ||
                        application.current_title?.title_name ||
                        "-";

                      const targetPosition =
                        application.targeted_title_name ||
                        application.targeted_title?.title_name ||
                        "-";

                      const points =
                        application.other_publication_points ??
                        application.total_material_points ??
                        application.total_points ??
                        "0.00";

                      const status =
                        application.manager_status ||
                        application.hod_status ||
                        application.final_status ||
                        "Pending";

                      return (

                        <tr
                          key={application.id}
                          style={styles.tr}
                        >

                          <td style={styles.td}>
                            #{application.id}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              fontWeight: "600",
                            }}
                          >
                            {employeeName}
                          </td>

                          <td style={styles.td}>
                            {currentPosition}
                          </td>

                          <td style={styles.td}>
                            {targetPosition}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              fontWeight: "600",
                            }}
                          >
                            {points}
                          </td>

                          <td style={styles.td}>

                            <span
                              style={{
                                ...styles.badge,
                                ...getBadgeStyle(
                                  status
                                ),
                              }}
                            >
                              {status}
                            </span>

                          </td>

                          <td style={styles.td}>

                            {application.created_at
                              ? new Date(
                                  application.created_at
                                ).toLocaleDateString()
                              : application.submitted_at
                              ? new Date(
                                  application.submitted_at
                                ).toLocaleDateString()
                              : "-"}

                          </td>

                          <td style={styles.td}>

                            <button
                              onClick={() =>
                                openApplication(
                                  application.id
                                )
                              }
                              style={styles.viewButton}
                            >
                              View / Review
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      style={styles.empty}
                    >
                      No promotion applications found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// ============================================================
// BADGE STYLE
// ============================================================

const getBadgeStyle = (status) => {
  const value = String(status || "")
    .toLowerCase();

  if (
    value === "approved" ||
    value === "recommended"
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (value === "rejected") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (
    value === "pending" ||
    value === "submitted" ||
    value === "under review"
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  return {
    background: "#e5e7eb",
    color: "#374151",
  };
};

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    padding: "25px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "25px",
  },

  subtitle: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "14px",
  },

  refreshButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
    border:
      "1px solid #e5e7eb",
  },

  cardLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "8px",
  },

  cardNumber: {
    fontSize: "28px",
    color: "#1e3a8a",
  },

  filterBox: {
    display: "flex",
    gap: "12px",
    background: "white",
    padding: "18px",
    borderRadius: "10px",
    marginBottom: "20px",
    border:
      "1px solid #e5e7eb",
  },

  searchInput: {
    flex: 1,
    padding: "11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    outline: "none",
  },

  statusSelect: {
    width: "180px",
    padding: "11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    background: "white",
  },

  tableContainer: {
    background: "white",
    borderRadius: "10px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom:
      "1px solid #e5e7eb",
  },

  tableTitle: {
    margin: 0,
    color: "#1f2937",
  },

  resultCount: {
    color: "#64748b",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    padding: "13px",
    textAlign: "left",
    background: "#f1f5f9",
    borderBottom:
      "1px solid #d1d5db",
    fontSize: "13px",
    color: "#374151",
  },

  td: {
    padding: "13px",
    borderBottom:
      "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#374151",
  },

  tr: {
    background: "white",
  },

  badge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  viewButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
};

export default Application;