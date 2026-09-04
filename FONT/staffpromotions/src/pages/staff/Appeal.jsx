import React, { useEffect, useState } from "react";
import api from "../../services/api";

function Appeal() {
  // ========================================================
  // LOGGED-IN USER
  // ========================================================

  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const loggedInUser = getLoggedInUser();
  const applicantId =
    loggedInUser?.id ||
    loggedInUser?.employee_id ||
    loggedInUser?.employee?.id ||
    "";

  // ========================================================
  // STATE
  // ========================================================

  const [applications, setApplications] = useState([]);
  const [appeals, setAppeals] = useState([]);

  const [selectedApplication, setSelectedApplication] =
    useState("");

  const [reason, setReason] = useState("");
  const [decisionsDisagreedWith, setDecisionsDisagreedWith] =
    useState("");

  const [selfRating, setSelfRating] = useState("");

  const [supportingDocument, setSupportingDocument] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ========================================================
  // HELPERS
  // ========================================================

  const extractListData = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    return [];
  };

  // ========================================================
  // LOAD DATA
  // ========================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [applicationsResponse, appealsResponse] =
        await Promise.all([
          api.get("/api/applications/", config),
          api.get("/api/appeals/", config),
        ]);

      // ====================================================
      // ONLY REJECTED APPLICATIONS
      // ====================================================

      const allApplications =
        extractListData(applicationsResponse.data);

      const rejectedApplications =
        allApplications.filter((app) => {
          const finalStatus = String(
            app.final_status ||
              app.dean_status ||
              app.status ||
              ""
          ).trim().toUpperCase();

          return (
            finalStatus.includes("REJECTED") ||
            finalStatus.includes("DECLINED") ||
            finalStatus.includes("NOT RECOMMENDED") ||
            finalStatus.includes("NOT_APPROVED")
          );
        });

      setApplications(rejectedApplications);
      setAppeals(extractListData(appealsResponse.data));

    } catch (err) {
      console.error(
        "Appeal data error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Failed to load promotion appeal information."
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // APPLICATION CHANGE
  // ========================================================

  const handleApplicationChange = (e) => {
    const applicationId = e.target.value;

    setSelectedApplication(applicationId);

    // Clear previous messages
    setSuccess("");
    setError("");
  };

  // ========================================================
  // FILE CHANGE
  // ========================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSupportingDocument(null);
      return;
    }

    // PDF ONLY
    if (file.type !== "application/pdf") {
      setError("Only PDF supporting documents are allowed.");

      e.target.value = "";
      setSupportingDocument(null);

      return;
    }

    // MAX 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Supporting document must not exceed 10 MB."
      );

      e.target.value = "";
      setSupportingDocument(null);

      return;
    }

    setError("");
    setSupportingDocument(file);
  };

  // ========================================================
  // CHECK EXISTING APPEAL
  // ========================================================

  const hasExistingAppeal = () => {
    if (!selectedApplication) {
      return false;
    }

    return appeals.some(
      (appeal) =>
        String(
          appeal.application
        ) === String(selectedApplication)
    );
  };

  // ========================================================
  // VALIDATION
  // ========================================================

  const validateForm = () => {
    if (!applicantId) {
      setError(
        "Your user information could not be found. Please log in again."
      );

      return false;
    }

    if (!selectedApplication) {
      setError(
        "Please select the rejected promotion application."
      );

      return false;
    }

    if (hasExistingAppeal()) {
      setError(
        "You have already submitted an appeal for this application."
      );

      return false;
    }

    if (!decisionsDisagreedWith.trim()) {
      setError(
        "Please state the decision you disagree with."
      );

      return false;
    }

    if (!reason.trim()) {
      setError(
        "Please provide the reason for your appeal."
      );

      return false;
    }

    if (reason.trim().length < 20) {
      setError(
        "The appeal reason should contain at least 20 characters."
      );

      return false;
    }

    if (selfRating === "") {
      setError(
        "Please provide your self-rating."
      );

      return false;
    }

    return true;
  };

  // ========================================================
  // SUBMIT APPEAL
  // ========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      // ====================================================
      // APPLICATION + APPLICANT
      // ====================================================

      if (applicantId) {
        data.append("applicant", String(applicantId));
        data.append("employee", String(applicantId));
        data.append("applicant_id", String(applicantId));
      }

      data.append("application", selectedApplication);
      data.append("application_id", selectedApplication);
      data.append("promotion_application", selectedApplication);

      // ====================================================
      // APPEAL DETAILS
      // ====================================================

      data.append(
        "decisions_disagreed_with",
        decisionsDisagreedWith
      );
      data.append(
        "decision_disagreed_with",
        decisionsDisagreedWith
      );

      data.append(
        "reasons_for_disagreement",
        reason
      );
      data.append("reason", reason);

      data.append("self_rating", selfRating);
      data.append("rating", selfRating);

      // ====================================================
      // SUPPORTING DOCUMENT
      // ====================================================

      if (supportingDocument) {
        data.append(
          "supporting_document",
          supportingDocument
        );
        data.append(
          "supporting_doc",
          supportingDocument
        );
      }

      // ====================================================
      // SUBMIT
      // ====================================================

      await api.post(
        "/api/appeals/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ====================================================
      // SUCCESS
      // ====================================================

      setSuccess(
        "Your promotion appeal has been submitted successfully."
      );

      // ====================================================
      // RESET
      // ====================================================

      setSelectedApplication("");
      setDecisionsDisagreedWith("");
      setReason("");
      setSelfRating("");
      setSupportingDocument(null);

      // Reset file input
      const fileInput =
        document.getElementById(
          "appeal-supporting-document"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      // Reload appeals
      await fetchData();

    } catch (err) {
      console.error(
        "Appeal submission error:",
        err.response?.data || err
      );

      const backendError =
        err.response?.data;

      if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = Object.entries(
          backendError
        )
          .map(([field, message]) => {
            return `${field}: ${
              Array.isArray(message)
                ? message.join(", ")
                : message
            }`;
          })
          .join(" | ");

        setError(messages);
      } else {
        setError(
          "Failed to submit appeal. Please try again."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading promotion appeal information...
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div style={styles.container}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div style={styles.header}>

        <h2 style={styles.title}>
          Promotion Appeal
        </h2>

        <p style={styles.subtitle}>
          You may submit an appeal if your promotion
          application has been rejected.
        </p>

      </div>

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div style={styles.success}>
          ✓ {success}
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ==================================================
          NO REJECTED APPLICATION
      ================================================== */}

      {applications.length === 0 ? (

        <div style={styles.emptyBox}>

          <div style={styles.emptyIcon}>
            ✓
          </div>

          <h3>
            No Rejected Applications
          </h3>

          <p>
            You currently do not have a rejected promotion
            application that can be appealed.
          </p>

        </div>

      ) : (

        <>

          {/* ================================================
              APPEAL FORM
          ================================================ */}

          <div style={styles.section}>

            <h3 style={styles.sectionTitle}>
              Submit Appeal
            </h3>

            <form onSubmit={handleSubmit}>

              {/* ==========================================
                  APPLICATION
              ========================================== */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Rejected Promotion Application *
                </label>

                <select
                  value={selectedApplication}
                  onChange={handleApplicationChange}
                  style={styles.input}
                  required
                >

                  <option value="">
                    Select rejected application
                  </option>

                  {applications.map((app) => (

                    <option
                      key={app.id}
                      value={app.id}
                    >
                      Application #{app.id} -
                      {" "}
                      {app.current_title_name ||
                        "Current Position"}
                      {" → "}
                      {app.targeted_title_name ||
                        "Target Position"}
                    </option>

                  ))}

                </select>

              </div>

              {/* ==========================================
                  DECISION DISAGREED WITH
              ========================================== */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Decision Disagreed With *
                </label>

                <input
                  type="text"
                  value={decisionsDisagreedWith}
                  onChange={(e) =>
                    setDecisionsDisagreedWith(
                      e.target.value
                    )
                  }
                  placeholder="Example: Final promotion decision"
                  style={styles.input}
                  required
                />

              </div>

              {/* ==========================================
                  REASON
              ========================================== */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Reason for Appeal *
                </label>

                <textarea
                  rows="7"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  placeholder="Explain clearly why you disagree with the promotion decision..."
                  style={styles.textarea}
                  required
                />

                <small style={styles.help}>
                  Please provide a clear explanation and
                  identify any information or evidence that
                  you believe was not properly considered.
                </small>

              </div>

              {/* ==========================================
                  SELF RATING
              ========================================== */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Self Rating *
                </label>

                <select
                  value={selfRating}
                  onChange={(e) =>
                    setSelfRating(e.target.value)
                  }
                  style={styles.input}
                  required
                >

                  <option value="">
                    Select self rating
                  </option>

                  <option value="1">
                    1 - Very Low
                  </option>

                  <option value="2">
                    2 - Low
                  </option>

                  <option value="3">
                    3 - Average
                  </option>

                  <option value="4">
                    4 - Good
                  </option>

                  <option value="5">
                    5 - Excellent
                  </option>

                </select>

              </div>

              {/* ==========================================
                  DOCUMENT
              ========================================== */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Supporting Document
                </label>

                <input
                  id="appeal-supporting-document"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />

                <small style={styles.help}>
                  PDF only. Maximum file size: 10 MB.
                </small>

                {supportingDocument && (
                  <div style={styles.selectedFile}>
                    ✓ {supportingDocument.name}
                  </div>
                )}

              </div>

              {/* ==========================================
                  SUBMIT
              ========================================== */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  hasExistingAppeal()
                }
                style={{
                  ...styles.submitButton,
                  opacity:
                    submitting ||
                    hasExistingAppeal()
                      ? 0.6
                      : 1,
                }}
              >
                {submitting
                  ? "Submitting Appeal..."
                  : "Submit Appeal"}
              </button>

            </form>

          </div>

        </>

      )}

      {/* ==================================================
          PREVIOUS APPEALS
      ================================================== */}

      <div style={styles.section}>

        <h3 style={styles.sectionTitle}>
          My Appeal History
        </h3>

        {appeals.length === 0 ? (

          <div style={styles.noHistory}>
            You have not submitted any promotion appeals.
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Appeal ID
                  </th>

                  <th style={styles.th}>
                    Application
                  </th>

                  <th style={styles.th}>
                    Reason
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Submitted
                  </th>

                  <th style={styles.th}>
                    Decision
                  </th>

                </tr>

              </thead>

              <tbody>

                {appeals.map((appeal) => (

                  <tr key={appeal.id}>

                    <td style={styles.td}>
                      #{appeal.id}
                    </td>

                    <td style={styles.td}>
                      #{appeal.application}
                    </td>

                    <td style={styles.td}>
                      {appeal.reasons_for_disagreement ||
                        "-"}
                    </td>

                    <td style={styles.td}>

                      <span
                        style={getStatusStyle(
                          appeal.status
                        )}
                      >
                        {appeal.status ||
                          "PENDING"}
                      </span>

                    </td>

                    <td style={styles.td}>
                      {formatDate(
                        appeal.received_at
                      )}
                    </td>

                    <td style={styles.td}>
                      {appeal.appeal_decision ||
                        "Waiting for decision"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// ========================================================
// STATUS STYLE
// ========================================================

const getStatusStyle = (status) => {

  const value = String(
    status || "PENDING"
  ).toUpperCase();

  if (
    value === "APPROVED" ||
    value === "ACCEPTED"
  ) {
    return {
      ...styles.status,
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    value === "REJECTED" ||
    value === "DECLINED"
  ) {
    return {
      ...styles.status,
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    ...styles.status,
    background: "#fef3c7",
    color: "#92400e",
  };
};

// ========================================================
// STYLES
// ========================================================

const styles = {

  container: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "30px",
    background: "#f8fafc",
    minHeight: "calc(100vh - 60px)",
  },

  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
    fontSize: "18px",
  },

  header: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  title: {
    textAlign: "center",
    color: "#1e90ff",
    margin: 0,
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "8px",
  },

  section: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "22px",
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "white",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  fileInput: {
    width: "100%",
    padding: "12px",
    border: "1px dashed #9ca3af",
    borderRadius: "7px",
    background: "#f9fafb",
    boxSizing: "border-box",
  },

  help: {
    display: "block",
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  selectedFile: {
    marginTop: "8px",
    padding: "8px",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "6px",
    fontSize: "13px",
  },

  submitButton: {
    width: "100%",
    padding: "14px",
    background: "#1e90ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  success: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  emptyBox: {
    background: "white",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
  },

  noHistory: {
    padding: "25px",
    textAlign: "center",
    color: "#6b7280",
    background: "#f8fafc",
    borderRadius: "8px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },

  th: {
    padding: "12px",
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    textAlign: "left",
    fontSize: "13px",
  },

  td: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    verticalAlign: "top",
    fontSize: "13px",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default Appeal;