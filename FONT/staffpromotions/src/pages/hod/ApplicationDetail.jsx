
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await api.get(`/api/applications/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplication(res.data);
    } catch (err) {
      console.error("Application detail error:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to load application details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "approved") {
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

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
        </div>

        <button
          onClick={() => navigate("/hod/applications")}
          style={styles.backButton}
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          Application not found.
        </div>
      </div>
    );
  }

  const materials =
    application.promotion_materials ||
    application.materials ||
    [];

  const documents =
    application.documents ||
    [];

  return (
    <div style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.title}>
            Promotion Application
          </h1>

          <p style={styles.subtitle}>
            Application ID: #{application.id}
          </p>
        </div>

        <button
          onClick={() => navigate("/hod/applications")}
          style={styles.backButton}
        >
          ← Back
        </button>

      </div>


      {/* =====================================================
          APPLICATION STATUS
      ===================================================== */}

      <div style={styles.statusCard}>

        <div>
          <span style={styles.statusLabel}>
            Application Status
          </span>

          <div
            style={{
              ...styles.status,
              ...getStatusStyle(
                application.final_status
              ),
            }}
          >
            {application.final_status || "Pending"}
          </div>
        </div>

        <div>
          <span style={styles.statusLabel}>
            Submitted Date
          </span>

          <strong>
            {formatDate(application.created_at)}
          </strong>
        </div>

      </div>


      {/* =====================================================
          APPLICANT INFORMATION
      ===================================================== */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          1. Applicant Information
        </h2>

        <div style={styles.grid}>

          <Info
            label="Full Name"
            value={
              application.full_name ||
              application.employee_name ||
              application.employee_full_name ||
              "-"
            }
          />

          <Info
            label="Email"
            value={
              application.employee_email ||
              application.email ||
              "-"
            }
          />

          <Info
            label="Current Position"
            value={
              application.current_title_name ||
              "-"
            }
          />

          <Info
            label="Position Applied For"
            value={
              application.targeted_title_name ||
              "-"
            }
          />

          <Info
            label="Date of Birth"
            value={formatDate(application.date_of_birth)}
          />

          <Info
            label="Nationality"
            value={
              application.nationality ||
              "-"
            }
          />

          <Info
            label="Employment Status"
            value={
              application.employment_status ||
              "-"
            }
          />

          <Info
            label="Date of Appointment at SUZA"
            value={formatDate(
              application.date_of_appointment_at_suza
            )}
          />

          <Info
            label="First Appointment Position"
            value={
              application.position_at_first_appointment_name ||
              application.position_at_first_appointment ||
              "-"
            }
          />

          <Info
            label="Present Position"
            value={
              application.present_position_name ||
              application.present_position ||
              "-"
            }
          />

          <Info
            label="Date of Current Position"
            value={formatDate(
              application.date_of_current_position
            )}
          />

          <Info
            label="Applied Same Rank Before"
            value={
              application.applied_same_rank_before ||
              "-"
            }
          />

          <Info
            label="Previous Application Date"
            value={formatDate(
              application.previous_application_date
            )}
          />

          <Info
            label="Intends New Publications"
            value={
              application.intends_new_publications ||
              "-"
            }
          />

        </div>

      </div>


      {/* =====================================================
          PROMOTION MATERIALS
      ===================================================== */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          2. Promotion Materials
        </h2>

        {materials.length > 0 ? (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    #
                  </th>

                  <th style={styles.th}>
                    Promotion Material
                  </th>

                  <th style={styles.th}>
                    Points
                  </th>

                  <th style={styles.th}>
                    Supporting Document
                  </th>

                </tr>
              </thead>

              <tbody>

                {materials.map((material, index) => (

                  <tr key={material.id || index}>

                    <td style={styles.td}>
                      {index + 1}
                    </td>

                    <td style={styles.td}>
                      {material.label ||
                        material.material_name ||
                        material.material_type ||
                        "-"}
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "bold",
                        color: "#2563eb",
                      }}
                    >
                      {material.points || 0}
                    </td>

                    <td style={styles.td}>

                      {material.document ||
                      material.document_url ||
                      material.file ? (

                        <a
                          href={
                            material.document_url ||
                            material.document ||
                            material.file
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={styles.documentButton}
                        >
                          View PDF
                        </a>

                      ) : (
                        <span style={styles.noDocument}>
                          No document
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div style={styles.empty}>
            No promotion materials submitted.
          </div>

        )}

        <div style={styles.totalBox}>

          <span>
            Total Promotion Material Points
          </span>

          <strong>
            {application.other_publication_points ||
              application.total_material_points ||
              "0.00"}
          </strong>

        </div>

      </div>


      {/* =====================================================
          SUPPORTING DOCUMENTS
      ===================================================== */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          3. Supporting Documents
        </h2>

        <div style={styles.documents}>

          {application.cv && (

            <Document
              title="Curriculum Vitae (CV)"
              url={application.cv}
            />

          )}

          {application.additional_documents && (

            <Document
              title="Additional Documents"
              url={application.additional_documents}
            />

          )}

          {documents.map((doc, index) => (

            <Document
              key={doc.id || index}
              title={
                doc.title ||
                doc.name ||
                `Supporting Document ${index + 1}`
              }
              url={
                doc.file ||
                doc.document ||
                doc.url
              }
            />

          ))}

          {!application.cv &&
            !application.additional_documents &&
            documents.length === 0 && (

              <div style={styles.empty}>
                No supporting documents available.
              </div>

            )}

        </div>

      </div>


      {/* =====================================================
          DECLARATION
      ===================================================== */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          4. Applicant Declaration
        </h2>

        <div style={styles.declaration}>

          <span style={styles.check}>
            {application.applicant_declaration
              ? "✓"
              : "!"}
          </span>

          <p>
            I declare that the information and documents
            submitted in this promotion application are true
            and accurate to the best of my knowledge.
          </p>

        </div>

        <div style={styles.signature}>

          <div>
            <span>Signature Date</span>
            <strong>
              {formatDate(
                application.applicant_signature_date
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          REVIEW STATUS
      ===================================================== */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          5. Review Status
        </h2>

        <div style={styles.grid}>

          <Info
            label="HOD / Manager Status"
            value={
              application.manager_status ||
              application.hod_status ||
              "Pending"
            }
          />

          <Info
            label="HR Status"
            value={
              application.hr_status ||
              "Pending"
            }
          />

          <Info
            label="Final Status"
            value={
              application.final_status ||
              "Pending"
            }
          />

        </div>

      </div>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div style={styles.actions}>

        <button
          onClick={() =>
            navigate(`/hod/review/${application.id}`)
          }
          style={styles.reviewButton}
        >
          Review Application
        </button>

        <button
          onClick={() => navigate("/hod/applications")}
          style={styles.secondaryButton}
        >
          Back to Applications
        </button>

      </div>

    </div>
  );
}


/* ============================================================
   INFORMATION COMPONENT
   ============================================================ */

function Info({ label, value }) {
  return (
    <div style={styles.infoItem}>

      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>

    </div>
  );
}


/* ============================================================
   DOCUMENT COMPONENT
   ============================================================ */

function Document({ title, url }) {

  if (!url) {
    return null;
  }

  return (
    <div style={styles.document}>

      <div>
        <strong style={styles.documentTitle}>
          {title}
        </strong>

        <span style={styles.pdfText}>
          PDF Document
        </span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={styles.documentButton}
      >
        View PDF
      </a>

    </div>
  );
}


/* ============================================================
   INLINE STYLES
   ============================================================ */

const styles = {

  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "25px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "26px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  backButton: {
    border: "none",
    background: "#1e90ff",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  statusCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "22px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
  },

  statusLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "7px",
  },

  status: {
    display: "inline-block",
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "13px",
  },

  section: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "22px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1f2937",
    fontSize: "19px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },

  infoItem: {
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },

  infoLabel: {
    display: "block",
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
  },

  infoValue: {
    color: "#111827",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    padding: "13px",
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    color: "#374151",
    textAlign: "left",
  },

  td: {
    padding: "13px",
    border: "1px solid #e5e7eb",
    verticalAlign: "middle",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "18px",
    padding: "16px",
    background: "#eff6ff",
    borderRadius: "8px",
    color: "#1e3a8a",
    fontSize: "16px",
  },

  documents: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  document: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#f9fafb",
  },

  documentTitle: {
    display: "block",
    color: "#374151",
  },

  pdfText: {
    display: "block",
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "4px",
  },

  documentButton: {
    textDecoration: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
  },

  noDocument: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  declaration: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "8px",
  },

  check: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#16a34a",
  },

  declarationText: {
    margin: 0,
    color: "#374151",
    lineHeight: "1.6",
  },

  signature: {
    marginTop: "18px",
    paddingTop: "15px",
    borderTop: "1px solid #e5e7eb",
  },

  actions: {
    display: "flex",
    gap: "15px",
    marginTop: "25px",
  },

  reviewButton: {
    flex: 1,
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    padding: "14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  secondaryButton: {
    flex: 1,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    padding: "14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loading: {
    textAlign: "center",
    padding: "70px 20px",
    color: "#6b7280",
  },

  spinner: {
    width: "35px",
    height: "35px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },

  error: {
    padding: "15px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  empty: {
    padding: "25px",
    textAlign: "center",
    background: "#f9fafb",
    color: "#6b7280",
    borderRadius: "8px",
  },
};

export default ApplicationDetail;

