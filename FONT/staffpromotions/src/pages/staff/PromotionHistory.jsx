import { useEffect, useState } from "react";
import api from "../../services/api";

function PromotionHistory() {
  // ============================================================
  // CURRENT USER
  // ============================================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ============================================================
  // STATES
  // ============================================================

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH PROMOTION HISTORY
  // ============================================================

  useEffect(() => {
    fetchPromotionHistory();
  }, []);

  const fetchPromotionHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/api/promotion-history/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // --------------------------------------------------------
      // SHOW ONLY CURRENT STAFF HISTORY
      // --------------------------------------------------------

      const myHistory = data.filter((item) => {
        const employeeId =
          item.employee ||
          item.employee_id ||
          item.employee?.id;

        return String(employeeId) === String(user?.id);
      });

      setHistory(myHistory);

    } catch (err) {
      console.error(
        "Promotion history error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to load promotion history."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ============================================================
  // GET POSITION NAME
  // ============================================================

  const getOldPosition = (item) => {
    return (
      item.old_title_name ||
      item.old_position ||
      item.old_title?.title_name ||
      item.old_title?.name ||
      "N/A"
    );
  };

  const getNewPosition = (item) => {
    return (
      item.new_title_name ||
      item.new_position ||
      item.new_title?.title_name ||
      item.new_title?.name ||
      "N/A"
    );
  };

  // ============================================================
  // PROMOTION LETTER
  // ============================================================

  const getLetterUrl = (file) => {
    if (!file) {
      return null;
    }

    if (file.startsWith("http")) {
      return file;
    }

    return `http://127.0.0.1:8000${file}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.container}>

        <div style={styles.loadingCard}>

          <div style={styles.spinner}></div>

          <p style={styles.loadingText}>
            Loading promotion history...
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>
            Promotion History
          </h2>

          <p style={styles.subtitle}>
            View your approved promotion records and
            promotion history.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchPromotionHistory}
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
          ⚠ {error}
        </div>
      )}

      {/* ======================================================
          STAFF INFORMATION
      ====================================================== */}

      <div style={styles.employeeCard}>

        <div style={styles.employeeItem}>

          <span style={styles.employeeLabel}>
            FULL NAME
          </span>

          <strong style={styles.employeeValue}>
            {user?.full_name ||
              user?.name ||
              `${user?.first_name || ""} ${
                user?.last_name || ""
              }`.trim() ||
              "Staff Member"}
          </strong>

        </div>

        <div style={styles.employeeItem}>

          <span style={styles.employeeLabel}>
            EMAIL
          </span>

          <span style={styles.employeeValue}>
            {user?.email || "N/A"}
          </span>

        </div>

        <div style={styles.employeeItem}>

          <span style={styles.employeeLabel}>
            TOTAL PROMOTIONS
          </span>

          <strong style={styles.totalNumber}>
            {history.length}
          </strong>

        </div>

      </div>

      {/* ======================================================
          NO HISTORY
      ====================================================== */}

      {history.length === 0 ? (

        <div style={styles.emptyCard}>

          <div style={styles.emptyIcon}>
            📜
          </div>

          <h3 style={styles.emptyTitle}>
            No Promotion History
          </h3>

          <p style={styles.emptyText}>
            You do not have any approved promotion
            records yet.
          </p>

          <p style={styles.emptyHint}>
            Once your promotion is finally approved,
            the record will appear here.
          </p>

        </div>

      ) : (

        <>

          {/* ==================================================
              HISTORY TABLE
          ================================================== */}

          <div style={styles.tableCard}>

            <div style={styles.tableHeader}>

              <div>

                <h3 style={styles.tableTitle}>
                  Previous Promotions
                </h3>

                <p style={styles.tableSubtitle}>
                  Your completed promotion records
                </p>

              </div>

              <span style={styles.recordBadge}>
                {history.length}{" "}
                {history.length === 1
                  ? "Record"
                  : "Records"}
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
                      Old Position
                    </th>

                    <th style={styles.th}>
                      New Position
                    </th>

                    <th style={styles.th}>
                      Approval Date
                    </th>

                    <th style={styles.th}>
                      Promotion Letter
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {history.map((item, index) => {

                    const letterUrl =
                      getLetterUrl(
                        item.promotion_letter
                      );

                    return (
                      <tr key={item.id}>

                        {/* NUMBER */}

                        <td style={styles.td}>
                          {index + 1}
                        </td>

                        {/* OLD POSITION */}

                        <td style={styles.td}>

                          <span
                            style={
                              styles.oldPosition
                            }
                          >
                            {getOldPosition(item)}
                          </span>

                        </td>

                        {/* NEW POSITION */}

                        <td style={styles.td}>

                          <span
                            style={
                              styles.newPosition
                            }
                          >
                            {getNewPosition(item)}
                          </span>

                        </td>

                        {/* APPROVAL DATE */}

                        <td style={styles.td}>

                          {formatDate(
                            item.approval_date ||
                            item.created_at
                          )}

                        </td>

                        {/* PROMOTION LETTER */}

                        <td style={styles.td}>

                          {letterUrl ? (

                            <a
                              href={letterUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={
                                styles.viewButton
                              }
                            >
                              📄 View Letter
                            </a>

                          ) : (

                            <span
                              style={
                                styles.notAvailable
                              }
                            >
                              Not Available
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          </div>

          {/* ==================================================
              PROMOTION TIMELINE
          ================================================== */}

          <div style={styles.timelineCard}>

            <h3 style={styles.timelineTitle}>
              Promotion Timeline
            </h3>

            <p style={styles.timelineSubtitle}>
              Your successful promotion progression
            </p>

            <div style={styles.timeline}>

              {history.map((item, index) => (

                <div
                  key={item.id}
                  style={styles.timelineItem}
                >

                  {/* CIRCLE */}

                  <div style={styles.timelineLeft}>

                    <div
                      style={
                        styles.timelineCircle
                      }
                    >
                      ✓
                    </div>

                    {index <
                      history.length - 1 && (
                      <div
                        style={
                          styles.timelineLine
                        }
                      />
                    )}

                  </div>

                  {/* CONTENT */}

                  <div
                    style={
                      styles.timelineContent
                    }
                  >

                    <span
                      style={
                        styles.timelineDate
                      }
                    >
                      {formatDate(
                        item.approval_date ||
                        item.created_at
                      )}
                    </span>

                    <h4
                      style={
                        styles.timelineContentTitle
                      }
                    >
                      {getNewPosition(item)}
                    </h4>

                    <p
                      style={
                        styles.timelineText
                      }
                    >
                      Promoted from{" "}

                      <strong>
                        {getOldPosition(item)}
                      </strong>

                      {" "}to{" "}

                      <strong>
                        {getNewPosition(item)}
                      </strong>
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </>

      )}

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    maxWidth: "1150px",
    margin: "30px auto",
    padding: "0 20px 50px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
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
  },

  title: {
    margin: 0,
    color: "#1e40af",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  refreshButton: {
    border: "1px solid #2563eb",
    background: "#ffffff",
    color: "#2563eb",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  error: {
    padding: "14px 18px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  // ==========================================================
  // EMPLOYEE CARD
  // ==========================================================

  employeeCard: {
    display: "grid",
    gridTemplateColumns:
      "2fr 2fr 1fr",
    gap: "20px",
    padding: "20px",
    marginBottom: "25px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    boxSizing: "border-box",
  },

  employeeItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  employeeLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: "0.5px",
  },

  employeeValue: {
    color: "#1e3a8a",
    fontSize: "15px",
  },

  totalNumber: {
    color: "#2563eb",
    fontSize: "22px",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "70px 20px",
    textAlign: "center",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border:
      "4px solid #e5e7eb",
    borderTop:
      "4px solid #2563eb",
    borderRadius: "50%",
    margin:
      "0 auto 15px",
  },

  loadingText: {
    color: "#6b7280",
    margin: 0,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    textAlign: "center",
    padding: "70px 20px",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: "0 0 10px",
    color: "#1f2937",
  },

  emptyText: {
    margin: "0 0 8px",
    color: "#6b7280",
  },

  emptyHint: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "13px",
  },

  // ==========================================================
  // TABLE
  // ==========================================================

  tableCard: {
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    borderBottom:
      "1px solid #e5e7eb",
  },

  tableTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "18px",
  },

  tableSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  recordBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    padding: "13px",
    border:
      "1px solid #e5e7eb",
    background: "#f3f4f6",
    textAlign: "left",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "700",
  },

  td: {
    padding: "13px",
    border:
      "1px solid #e5e7eb",
    color: "#4b5563",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  oldPosition: {
    color: "#374151",
    fontWeight: "600",
  },

  newPosition: {
    color: "#166534",
    fontWeight: "700",
  },

  viewButton: {
    display: "inline-block",
    background: "#eff6ff",
    color: "#2563eb",
    textDecoration: "none",
    padding: "7px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },

  notAvailable: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  // ==========================================================
  // TIMELINE
  // ==========================================================

  timelineCard: {
    background: "#ffffff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "12px",
    marginTop: "25px",
    padding: "25px",
  },

  timelineTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "18px",
  },

  timelineSubtitle: {
    margin:
      "5px 0 25px",
    color: "#6b7280",
    fontSize: "13px",
  },

  timeline: {
    width: "100%",
  },

  timelineItem: {
    display: "flex",
    gap: "15px",
    minHeight: "90px",
  },

  timelineLeft: {
    width: "35px",
    minWidth: "35px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  timelineCircle: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    zIndex: 2,
  },

  timelineLine: {
    width: "2px",
    flex: 1,
    background: "#bbf7d0",
    marginTop: "3px",
  },

  timelineContent: {
    paddingBottom: "25px",
  },

  timelineDate: {
    display: "block",
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "5px",
  },

  // IMPORTANT:
  // This is a valid React style property.
  // Do NOT write "timelineContent h4".
  timelineContentTitle: {
    margin: "0 0 7px",
    color: "#166534",
    fontSize: "16px",
  },

  timelineText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },
};

export default PromotionHistory;