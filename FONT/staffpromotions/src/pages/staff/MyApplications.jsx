import { useEffect, useState } from "react";
import api from "../../services/api";

function MyApplications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // FETCH MY PROMOTION APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // --------------------------------------------------------
      // FILTER CURRENT STAFF
      // --------------------------------------------------------

      const myApps = res.data.filter((app) => {
        return (
          String(app.employee) === String(user?.id) ||
          String(app.employee_id) === String(user?.id)
        );
      });

      setApplications(myApps);
    } catch (err) {
      console.error(
        "Failed to load applications:",
        err.response?.data || err
      );

      setError("Failed to load your promotion records.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW CHECKLIST
  // ============================================================

  const viewChecklist = async (application) => {
    try {
      setSelectedApplication(application);
      setLoadingMaterials(true);
      setMaterials([]);

      const token = localStorage.getItem("token");

      /*
       * IMPORTANT:
       * Change this endpoint if your backend uses another URL.
       *
       * Recommended:
       * /api/promotion-materials/?application=<id>
       */

      const res = await api.get(
        `/api/promotion-materials/?application=${application.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMaterials(res.data);
    } catch (err) {
      console.error(
        "Failed to load checklist:",
        err.response?.data || err
      );

      setMaterials([]);

      setError(
        "Unable to load the promotion checklist. Make sure the promotion-material API endpoint exists."
      );
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ============================================================
  // CLOSE CHECKLIST
  // ============================================================

  const closeChecklist = () => {
    setSelectedApplication(null);
    setMaterials([]);
    setError("");
  };

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusClass = (status) => {
    if (!status) return "status pending";

    const value = String(status).toLowerCase();

    if (
      value.includes("approved") ||
      value.includes("complete") ||
      value.includes("accepted")
    ) {
      return "status approved";
    }

    if (
      value.includes("reject") ||
      value.includes("declined") ||
      value.includes("failed")
    ) {
      return "status rejected";
    }

    if (
      value.includes("review") ||
      value.includes("pending") ||
      value.includes("waiting")
    ) {
      return "status review";
    }

    return "status pending";
  };

  // ============================================================
  // GET APPLICATION STATUS
  // ============================================================

  const getOverallStatus = (app) => {
    return (
      app.final_status ||
      app.status ||
      app.current_status ||
      "Pending"
    );
  };

  // ============================================================
  // GET CURRENT STAGE
  // ============================================================

  const getCurrentStage = (app) => {
    const finalStatus = String(
      app.final_status || ""
    ).toLowerCase();

    const hrStatus = String(
      app.hr_status || ""
    ).toLowerCase();

    const managerStatus = String(
      app.manager_status || ""
    ).toLowerCase();

    if (
      finalStatus.includes("approved") ||
      finalStatus.includes("rejected")
    ) {
      return "Final Decision";
    }

    if (
      hrStatus.includes("pending") ||
      hrStatus.includes("review")
    ) {
      return "HR Review";
    }

    if (
      managerStatus.includes("approved") ||
      managerStatus.includes("review")
    ) {
      return "HR Review";
    }

    return "Waiting for HOD / Manager Review";
  };

  // ============================================================
  // GET TOTAL POINTS
  // ============================================================

  const getTotalPoints = (app) => {
    const possibleFields = [
      app.total_points,
      app.total_material_points,
      app.other_publication_points,
      app.points,
    ];

    for (const value of possibleFields) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        return Number(value).toFixed(2);
      }
    }

    return "0.00";
  };

  // ============================================================
  // DOCUMENT URL
  // ============================================================

  const getDocumentUrl = (document) => {
    if (!document) return null;

    if (document.startsWith("http")) {
      return document;
    }

    /*
     * If Django returns:
     * /media/promotion_materials/file.pdf
     */

    return `http://127.0.0.1:8000${document}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>
          <p>Loading your promotion records...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            My Promotion Status
          </h2>

          <p style={styles.subtitle}>
            Track your promotion submission, checklist,
            scores and approval progress.
          </p>
        </div>

        <button
          onClick={fetchMyApplications}
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

          <button
            onClick={() => setError("")}
            style={styles.closeError}
          >
            ×
          </button>
        </div>
      )}

      {/* ======================================================
          STAFF INFORMATION
      ====================================================== */}

      <div style={styles.staffCard}>

        <div>
          <span style={styles.smallLabel}>
            STAFF MEMBER
          </span>

          <h3 style={styles.staffName}>
            {user?.full_name ||
              user?.name ||
              `${user?.first_name || ""} ${
                user?.last_name || ""
              }`.trim() ||
              "Staff Member"}
          </h3>
        </div>

        <div>
          <span style={styles.smallLabel}>
            EMAIL
          </span>

          <p style={styles.staffValue}>
            {user?.email || "N/A"}
          </p>
        </div>

        <div>
          <span style={styles.smallLabel}>
            ROLE
          </span>

          <p style={styles.staffValue}>
            {user?.role || "Staff"}
          </p>
        </div>

      </div>

      {/* ======================================================
          NO APPLICATION
      ====================================================== */}

      {applications.length === 0 ? (

        <div style={styles.emptyBox}>

          <div style={styles.emptyIcon}>
            📋
          </div>

          <h3>
            No Promotion Submission Found
          </h3>

          <p>
            You have not submitted a promotion request yet.
          </p>

        </div>

      ) : (

        <>
          {/* ==================================================
              APPLICATION CARDS
          ================================================== */}

          <div style={styles.cards}>

            {applications.map((app) => {

              const status =
                getOverallStatus(app);

              const stage =
                getCurrentStage(app);

              return (

                <div
                  key={app.id}
                  style={styles.applicationCard}
                >

                  {/* APPLICATION HEADER */}

                  <div style={styles.cardHeader}>

                    <div>

                      <span style={styles.applicationNumber}>
                        PROMOTION RECORD #{app.id}
                      </span>

                      <h3 style={styles.positionTitle}>
                        {app.current_title_name ||
                          app.current_title?.title_name ||
                          "Current Position"}
                        {" → "}
                        {app.targeted_title_name ||
                          app.targeted_title?.title_name ||
                          "Target Position"}
                      </h3>

                    </div>

                    <span
                      className={getStatusClass(status)}
                    >
                      {status}
                    </span>

                  </div>

                  {/* SUMMARY */}

                  <div style={styles.summaryGrid}>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>
                        Current Position
                      </span>

                      <strong>
                        {app.current_title_name ||
                          app.current_title?.title_name ||
                          "N/A"}
                      </strong>
                    </div>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>
                        Position Applied For
                      </span>

                      <strong>
                        {app.targeted_title_name ||
                          app.targeted_title?.title_name ||
                          "N/A"}
                      </strong>
                    </div>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>
                        Total Score
                      </span>

                      <strong style={styles.points}>
                        {getTotalPoints(app)}
                      </strong>
                    </div>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>
                        Current Stage
                      </span>

                      <strong>
                        {stage}
                      </strong>
                    </div>

                  </div>

                  {/* ==================================================
                      APPROVAL PROGRESS
                  ================================================== */}

                  <div style={styles.progressSection}>

                    <h4 style={styles.progressTitle}>
                      Promotion Approval Progress
                    </h4>

                    <div style={styles.progress}>

                      <div style={styles.progressStepActive}>
                        <div style={styles.stepCircle}>
                          ✓
                        </div>

                        <span>
                          Submitted
                        </span>
                      </div>

                      <div style={styles.progressLine}></div>

                      <div
                        style={
                          app.manager_status
                            ? styles.progressStepActive
                            : styles.progressStep
                        }
                      >
                        <div style={styles.stepCircle}>
                          {app.manager_status
                            ? "✓"
                            : "2"}
                        </div>

                        <span>
                          HOD / Manager
                        </span>
                      </div>

                      <div style={styles.progressLine}></div>

                      <div
                        style={
                          app.hr_status
                            ? styles.progressStepActive
                            : styles.progressStep
                        }
                      >
                        <div style={styles.stepCircle}>
                          {app.hr_status
                            ? "✓"
                            : "3"}
                        </div>

                        <span>
                          HR
                        </span>
                      </div>

                      <div style={styles.progressLine}></div>

                      <div
                        style={
                          app.final_status &&
                          app.final_status !== "Pending"
                            ? styles.progressStepActive
                            : styles.progressStep
                        }
                      >
                        <div style={styles.stepCircle}>
                          {app.final_status &&
                          app.final_status !== "Pending"
                            ? "✓"
                            : "4"}
                        </div>

                        <span>
                          Final Decision
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* ==================================================
                      STATUS TABLE
                  ================================================== */}

                  <div style={styles.statusTableWrapper}>

                    <table style={styles.statusTable}>

                      <thead>

                        <tr>
                          <th>Stage</th>
                          <th>Status</th>
                        </tr>

                      </thead>

                      <tbody>

                        <tr>
                          <td>
                            HOD / Manager Review
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                app.manager_status
                              )}
                            >
                              {app.manager_status ||
                                "Waiting"}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            HR Review
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                app.hr_status
                              )}
                            >
                              {app.hr_status ||
                                "Waiting"}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            Final Decision
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                app.final_status
                              )}
                            >
                              {app.final_status ||
                                "Pending"}
                            </span>
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div style={styles.actions}>

                    <button
                      onClick={() =>
                        viewChecklist(app)
                      }
                      style={styles.checklistButton}
                    >
                      📋 View Promotion Checklist
                    </button>

                    {app.cv && (
                      <a
                        href={getDocumentUrl(app.cv)}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.documentButton}
                      >
                        📄 View CV
                      </a>
                    )}

                  </div>

                </div>

              );
            })}

          </div>
        </>
      )}

      {/* ======================================================
          CHECKLIST MODAL
      ====================================================== */}

      {selectedApplication && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  Promotion Checklist
                </h2>

                <p style={styles.modalSubtitle}>
                  {selectedApplication.current_title_name ||
                    selectedApplication.current_title?.title_name}
                  {" → "}
                  {selectedApplication.targeted_title_name ||
                    selectedApplication.targeted_title?.title_name}
                </p>

              </div>

              <button
                onClick={closeChecklist}
                style={styles.modalClose}
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            {loadingMaterials ? (

              <div style={styles.modalLoading}>
                <div style={styles.spinner}></div>
                <p>
                  Loading promotion checklist...
                </p>
              </div>

            ) : materials.length === 0 ? (

              <div style={styles.noMaterials}>
                <p>
                  No promotion materials were found
                  for this submission.
                </p>
              </div>

            ) : (

              <div style={styles.modalTableWrapper}>

                <table style={styles.checklistTable}>

                  <thead>

                    <tr>

                      <th>
                        S/No
                      </th>

                      <th>
                        Promotion Material
                      </th>

                      <th>
                        Score / Points
                      </th>

                      <th>
                        Supporting Document
                      </th>

                      <th>
                        Review Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {materials.map(
                      (material, index) => (

                        <tr
                          key={
                            material.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {material.material_type_display ||
                              material.material_type ||
                              material.title ||
                              "Promotion Material"}
                          </td>

                          <td>
                            <strong>
                              {material.points ??
                                "0"}
                            </strong>
                          </td>

                          <td>

                            {material.document ? (

                              <a
                                href={getDocumentUrl(
                                  material.document
                                )}
                                target="_blank"
                                rel="noreferrer"
                                style={
                                  styles.viewDocument
                                }
                              >
                                📄 View PDF
                              </a>

                            ) : (

                              <span
                                style={
                                  styles.noDocument
                                }
                              >
                                No document
                              </span>

                            )}

                          </td>

                          <td>

                            <span
                              className={getStatusClass(
                                material.status ||
                                  material.review_status ||
                                  "Submitted"
                              )}
                            >
                              {material.status ||
                                material.review_status ||
                                "Submitted"}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                  <tfoot>

                    <tr>

                      <td
                        colSpan="2"
                        style={
                          styles.totalLabel
                        }
                      >
                        TOTAL SCORE
                      </td>

                      <td
                        style={
                          styles.totalValue
                        }
                      >

                        {materials
                          .reduce(
                            (total, item) =>
                              total +
                              Number(
                                item.points || 0
                              ),
                            0
                          )
                          .toFixed(2)}

                      </td>

                      <td colSpan="2"></td>

                    </tr>

                  </tfoot>

                </table>

              </div>

            )}

            {/* MODAL FOOTER */}

            <div style={styles.modalFooter}>

              <p style={styles.footerText}>
                Your promotion checklist is currently
                available for review by the responsible
                officers.
              </p>

              <button
                onClick={closeChecklist}
                style={styles.closeButton}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "0 20px 50px",
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
    color: "#1e40af",
    fontSize: "28px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  refreshButton: {
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  staffCard: {
    display: "grid",
    gridTemplateColumns:
      "2fr 2fr 1fr",
    gap: "20px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "25px",
  },

  smallLabel: {
    display: "block",
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "700",
    marginBottom: "5px",
  },

  staffName: {
    margin: 0,
    color: "#1e3a8a",
  },

  staffValue: {
    margin: 0,
    color: "#374151",
  },

  error: {
    position: "relative",
    padding: "14px 45px 14px 15px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  closeError: {
    position: "absolute",
    right: "12px",
    top: "8px",
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#991b1b",
  },

  loadingBox: {
    textAlign: "center",
    padding: "80px 20px",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 15px",
    animation:
      "spin 1s linear infinite",
  },

  emptyBox: {
    textAlign: "center",
    padding: "70px 20px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  cards: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  applicationCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  applicationNumber: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "700",
  },

  positionTitle: {
    margin: "8px 0 0",
    color: "#111827",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  summaryItem: {
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },

  summaryLabel: {
    display: "block",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "6px",
  },

  points: {
    color: "#2563eb",
    fontSize: "20px",
  },

  progressSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "10px",
  },

  progressTitle: {
    marginTop: 0,
    marginBottom: "25px",
  },

  progress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "5px",
  },

  progressStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "12px",
    minWidth: "90px",
  },

  progressStepActive: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "12px",
    minWidth: "90px",
  },

  stepCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "7px",
    fontWeight: "bold",
  },

  progressLine: {
    height: "2px",
    background: "#d1d5db",
    flex: 1,
    marginBottom: "20px",
  },

  statusTableWrapper: {
    overflowX: "auto",
    marginTop: "20px",
  },

  statusTable: {
    width: "100%",
    borderCollapse: "collapse",
  },

  checklistTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "25px",
    flexWrap: "wrap",
  },

  checklistButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  documentButton: {
    textDecoration: "none",
    background: "#f3f4f6",
    color: "#374151",
    padding: "12px 18px",
    borderRadius: "7px",
    fontWeight: "600",
  },

  status: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  approved: {
    background: "#dcfce7",
    color: "#166534",
  },

  rejected: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  review: {
    background: "#fef3c7",
    color: "#92400e",
  },

  pending: {
    background: "#e5e7eb",
    color: "#374151",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "1150px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow:
      "0 15px 50px rgba(0,0,0,0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "22px 25px",
    borderBottom: "1px solid #e5e7eb",
  },

  modalTitle: {
    margin: 0,
    color: "#1e40af",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  modalClose: {
    border: "none",
    background: "#f3f4f6",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    fontSize: "22px",
    cursor: "pointer",
  },

  modalTableWrapper: {
    overflowX: "auto",
    padding: "25px",
  },

  modalLoading: {
    textAlign: "center",
    padding: "60px",
  },

  noMaterials: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280",
  },

  viewDocument: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },

  noDocument: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  totalLabel: {
    padding: "14px",
    textAlign: "right",
    fontWeight: "bold",
    background: "#f3f4f6",
  },

  totalValue: {
    padding: "14px",
    fontWeight: "bold",
    color: "#2563eb",
    background: "#eff6ff",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "20px 25px",
    borderTop: "1px solid #e5e7eb",
  },

  footerText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    background: "#374151",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default MyApplications;