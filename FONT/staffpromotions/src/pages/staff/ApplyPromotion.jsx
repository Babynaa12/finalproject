import { useEffect, useState } from "react";
import api from "../../services/api";

function ApplyPromotion() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [jobTitles, setJobTitles] = useState([]);

  const [form, setForm] = useState({
    current_title: "",
    targeted_title: "",

    // Appendix 3 - Personal Particulars
    date_of_birth: "",
    nationality: "",
    date_of_appointment_at_suza: "",
    position_at_first_appointment: "",
    employment_status: "",
    present_position: "",
    date_of_current_position: "",
    position_applied_for: "",
    applied_same_rank_before: "",
    previous_application_date: "",
    intends_new_publications: "",

    // Declaration
    applicant_declaration: false,
    applicant_signature_date: "",
  });

  // ============================================================
  // DOCUMENTS
  // ============================================================

  const [cv, setCv] = useState(null);
  const [promotionApplicationForm, setPromotionApplicationForm] =
    useState(null);
  const [checklistForm, setChecklistForm] = useState(null);
  const [additionalDocuments, setAdditionalDocuments] = useState(null);

  // ============================================================
  // UI STATES
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FETCH JOB TITLES
  // ============================================================

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      setLoadingTitles(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/api/jobtitles/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobTitles(response.data);
    } catch (err) {
      console.error("Failed to load job titles:", err);

      setError("Failed to load job titles.");
    } finally {
      setLoadingTitles(false);
    }
  };

  // ============================================================
  // HANDLE TEXT INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // HANDLE FILE
  // ============================================================

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setter(null);
      return;
    }

    // PDF only
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");

      e.target.value = "";
      setter(null);

      return;
    }

    // 10 MB maximum
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");

      e.target.value = "";
      setter(null);

      return;
    }

    setError("");
    setter(file);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!form.current_title) {
      setError("Please select your current position.");
      return false;
    }

    if (!form.targeted_title) {
      setError("Please select the position you are applying for.");
      return false;
    }

    if (!cv) {
      setError("Please upload your CV.");
      return false;
    }

    if (!promotionApplicationForm) {
      setError("Please upload the Promotion Application Form.");
      return false;
    }

    if (!checklistForm) {
      setError("Please upload the Checklist Form.");
      return false;
    }

    if (!form.applicant_declaration) {
      setError(
        "You must accept the applicant declaration before submitting."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // SUBMIT APPLICATION
  // ============================================================

  const submitApplication = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      // ========================================================
      // PRESENT AND TARGET POSITION
      // ========================================================

      data.append("current_title", form.current_title);
      data.append("targeted_title", form.targeted_title);

      // ========================================================
      // PERSONAL PARTICULARS
      // ========================================================

      if (form.date_of_birth) {
        data.append("date_of_birth", form.date_of_birth);
      }

      if (form.nationality) {
        data.append("nationality", form.nationality);
      }

      if (form.date_of_appointment_at_suza) {
        data.append(
          "date_of_appointment_at_suza",
          form.date_of_appointment_at_suza
        );
      }

      if (form.position_at_first_appointment) {
        data.append(
          "position_at_first_appointment",
          form.position_at_first_appointment
        );
      }

      if (form.employment_status) {
        data.append(
          "employment_status",
          form.employment_status
        );
      }

      if (form.present_position) {
        data.append(
          "present_position",
          form.present_position
        );
      }

      if (form.date_of_current_position) {
        data.append(
          "date_of_current_position",
          form.date_of_current_position
        );
      }

      if (form.position_applied_for) {
        data.append(
          "position_applied_for",
          form.position_applied_for
        );
      }

      if (form.applied_same_rank_before) {
        data.append(
          "applied_same_rank_before",
          form.applied_same_rank_before
        );
      }

      if (form.previous_application_date) {
        data.append(
          "previous_application_date",
          form.previous_application_date
        );
      }

      if (form.intends_new_publications) {
        data.append(
          "intends_new_publications",
          form.intends_new_publications
        );
      }

      // ========================================================
      // REQUIRED DOCUMENTS
      // ========================================================

      data.append("cv", cv);

      data.append(
        "promotion_application_form",
        promotionApplicationForm
      );

      data.append(
        "checklist_form",
        checklistForm
      );

      if (additionalDocuments) {
        data.append(
          "additional_documents",
          additionalDocuments
        );
      }

      // ========================================================
      // DECLARATION
      // ========================================================

      data.append(
        "applicant_declaration",
        form.applicant_declaration
      );

      if (form.applicant_signature_date) {
        data.append(
          "applicant_signature_date",
          form.applicant_signature_date
        );
      }

      // ========================================================
      // POST TO DJANGO
      // ========================================================

      await api.post(
        "/api/applications/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Promotion application submitted successfully."
      );

      // Reset form
      setForm({
        current_title: "",
        targeted_title: "",
        date_of_birth: "",
        nationality: "",
        date_of_appointment_at_suza: "",
        position_at_first_appointment: "",
        employment_status: "",
        present_position: "",
        date_of_current_position: "",
        position_applied_for: "",
        applied_same_rank_before: "",
        previous_application_date: "",
        intends_new_publications: "",
        applicant_declaration: false,
        applicant_signature_date: "",
      });

      setCv(null);
      setPromotionApplicationForm(null);
      setChecklistForm(null);
      setAdditionalDocuments(null);

      // Reset file inputs
      document
        .querySelectorAll('input[type="file"]')
        .forEach((input) => {
          input.value = "";
        });

    } catch (err) {
      console.error(
        "Application submission error:",
        err.response?.data || err
      );

      const backendError = err.response?.data;

      if (backendError) {
        setError(
          typeof backendError === "string"
            ? backendError
            : "Failed to submit application. Please check the form."
        );
      } else {
        setError(
          "Failed to submit application. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h2 style={styles.title}>
          Promotion Application
        </h2>

        <p style={styles.subtitle}>
          Complete the promotion application form and upload
          the required supporting documents.
        </p>
      </div>

      {/* SUCCESS */}
      {success && (
        <div style={styles.success}>
          ✓ {success}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={submitApplication}>

        {/* ======================================================
            SECTION 1
        ====================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            1. Present and Target Position
          </h3>

          <div style={styles.grid}>

            <div>
              <label style={styles.label}>
                Current Position *
              </label>

              <select
                name="current_title"
                value={form.current_title}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={loadingTitles}
              >
                <option value="">
                  {loadingTitles
                    ? "Loading positions..."
                    : "Select Current Position"}
                </option>

                {jobTitles.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Position Applied For *
              </label>

              <select
                name="targeted_title"
                value={form.targeted_title}
                onChange={handleChange}
                required
                style={styles.input}
                disabled={loadingTitles}
              >
                <option value="">
                  Select Target Position
                </option>

                {jobTitles.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title_name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ======================================================
            SECTION 2
        ====================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            2. Personal Particulars
          </h3>

          <div style={styles.grid}>

            <div>
              <label style={styles.label}>
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Nationality
              </label>

              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Date of Appointment at SUZA
              </label>

              <input
                type="date"
                name="date_of_appointment_at_suza"
                value={form.date_of_appointment_at_suza}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Employment Status
              </label>

              <input
                type="text"
                name="employment_status"
                value={form.employment_status}
                onChange={handleChange}
                placeholder="e.g. Permanent"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Position at First Appointment
              </label>

              <select
                name="position_at_first_appointment"
                value={form.position_at_first_appointment}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select Position
                </option>

                {jobTitles.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Present Position
              </label>

              <select
                name="present_position"
                value={form.present_position}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select Position
                </option>

                {jobTitles.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Date of Current Position
              </label>

              <input
                type="date"
                name="date_of_current_position"
                value={form.date_of_current_position}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Have you applied for the same rank before?
              </label>

              <select
                name="applied_same_rank_before"
                value={form.applied_same_rank_before}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select
                </option>

                <option value="YES">
                  Yes
                </option>

                <option value="NO">
                  No
                </option>
              </select>
            </div>

            <div>
              <label style={styles.label}>
                Previous Application Date
              </label>

              <input
                type="date"
                name="previous_application_date"
                value={form.previous_application_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>
                Do you intend to publish new materials?
              </label>

              <select
                name="intends_new_publications"
                value={form.intends_new_publications}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">
                  Select
                </option>

                <option value="YES">
                  Yes
                </option>

                <option value="NO">
                  No
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* ======================================================
            SECTION 3
        ====================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            3. Required Documents
          </h3>

          <p style={styles.help}>
            Upload PDF documents only. Maximum size: 10 MB per file.
          </p>

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              CV *
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(setCv)}
              style={styles.fileInput}
              required
            />

            {cv && (
              <small style={styles.fileName}>
                Selected: {cv.name}
              </small>
            )}
          </div>

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              Promotion Application Form *
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(
                setPromotionApplicationForm
              )}
              style={styles.fileInput}
              required
            />

            {promotionApplicationForm && (
              <small style={styles.fileName}>
                Selected: {promotionApplicationForm.name}
              </small>
            )}
          </div>

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              Checklist Form *
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(setChecklistForm)}
              style={styles.fileInput}
              required
            />

            {checklistForm && (
              <small style={styles.fileName}>
                Selected: {checklistForm.name}
              </small>
            )}
          </div>

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              Additional Documents
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(
                setAdditionalDocuments
              )}
              style={styles.fileInput}
            />

            {additionalDocuments && (
              <small style={styles.fileName}>
                Selected: {additionalDocuments.name}
              </small>
            )}
          </div>

        </div>

        {/* ======================================================
            SECTION 4
        ====================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            4. Applicant Declaration
          </h3>

          <label style={styles.checkboxContainer}>

            <input
              type="checkbox"
              name="applicant_declaration"
              checked={form.applicant_declaration}
              onChange={handleChange}
            />

            <span>
              I declare that the information and documents
              submitted in this application are true and
              accurate to the best of my knowledge.
            </span>

          </label>

          <div style={{ marginTop: "20px" }}>

            <label style={styles.label}>
              Signature Date
            </label>

            <input
              type="date"
              name="applicant_signature_date"
              value={form.applicant_signature_date}
              onChange={handleChange}
              style={styles.input}
            />

          </div>

        </div>

        {/* ======================================================
            WORKFLOW INFORMATION
        ====================================================== */}

        <div style={styles.workflow}>

          <strong>Application Workflow</strong>

          <div style={styles.workflowSteps}>

            <span>1. Staff</span>
            <span>→</span>
            <span>2. HOD</span>
            <span>→</span>
            <span>3. Dean</span>
            <span>→</span>
            <span>4. Reviewer</span>
            <span>→</span>
            <span>5. Committee/Admin</span>

          </div>

          <p style={styles.help}>
            After submission, the application status is managed
            by the system. You cannot change HOD, Dean, reviewer,
            committee decisions, or application status.
          </p>

        </div>

        {/* ======================================================
            SUBMIT
        ====================================================== */}

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading
            ? "Submitting Application..."
            : "Submit Promotion Application"}
        </button>

      </form>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "30px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  header: {
    marginBottom: "25px",
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
  },

  title: {
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    margin: 0,
  },

  section: {
    marginBottom: "30px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1f2937",
    fontSize: "18px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "7px",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    background: "#fff",
  },

  fileInput: {
    width: "100%",
    padding: "10px",
    border: "1px dashed #9ca3af",
    borderRadius: "7px",
    boxSizing: "border-box",
    background: "#f9fafb",
  },

  fileGroup: {
    marginBottom: "20px",
  },

  fileName: {
    display: "block",
    marginTop: "6px",
    color: "#2563eb",
  },

  help: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  success: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  checkboxContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    lineHeight: "1.5",
  },

  workflow: {
    padding: "18px",
    marginBottom: "25px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    color: "#1e3a8a",
  },

  workflowSteps: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
    fontWeight: "600",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ApplyPromotion;