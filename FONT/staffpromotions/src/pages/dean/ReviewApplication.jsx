import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  FaArrowLeft,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPaperclip,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

function ReviewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  // ============================================================
  // FETCH APPLICATION
  // ============================================================

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await api.get(
        `/api/applications/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("DEAN APPLICATION:", response.data);

      setApplication(response.data);

      // --------------------------------------------------------
      // Load checklist/materials
      // --------------------------------------------------------

      fetchMaterials();

    } catch (err) {
      console.error(
        "Failed to load application:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load this promotion application."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH PROMOTION MATERIALS
  // ============================================================

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);

      const token = getToken();

      const response = await api.get(
        `/api/promotion-materials/?application=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.results)) {
        data = response.data.results;
      }

      setMaterials(data);

    } catch (err) {
      console.error(
        "Failed to load promotion materials:",
        err.response?.data || err
      );

      setMaterials([]);

    } finally {
      setLoadingMaterials(false);
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
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = () => {
    if (!application) return "Unknown Applicant";

    return (
      application.employee_name ||
      application.applicant_name ||
      application.employee?.full_name ||
      application.employee?.name ||
      application.employee?.username ||
      application.user?.full_name ||
      application.user?.name ||
      application.user?.username ||
      "Unknown Applicant"
    );
  };

  // ============================================================
  // CURRENT POSITION
  // ============================================================

  const getCurrentPosition = () => {
    if (!application) return "—";

    return (
      application.current_title_name ||
      application.current_position ||
      application.current_title?.title_name ||
      application.employee?.current_position ||
      "—"
    );
  };

  // ============================================================
  // TARGET POSITION
  // ============================================================

  const getTargetPosition = () => {
    if (!application) return "—";

    return (
      application.targeted_title_name ||
      application.target_position ||
      application.target_title ||
      application.targeted_title?.title_name ||
      application.promotion_title ||
      "—"
    );
  };

  // ============================================================
  // HOD RECOMMENDATION
  // ============================================================

  const getHODRecommendation = () => {
    if (!application) return "Pending";

    return (
      application.hod_recommendation ||
      application.hod_status ||
      application.recommendation ||
      "Pending"
    );
  };

  // ============================================================
  // HOD COMMENT
  // ============================================================

  const getHODComment = () => {
    if (!application) return "No comment provided.";

    return (
      application.hod_comment ||
      application.hod_remarks ||
      application.hod_review_comment ||
      application.manager_comment ||
      "No HOD comment provided."
    );
  };

  // ============================================================
  // DEAN STATUS
  // ============================================================

  const getDeanStatus = () => {
    if (!application) return "Pending";

    return (
      application.dean_status ||
      application.dean_decision ||
      application.dean_recommendation ||
      "Pending"
    );
  };

  // ============================================================
  // REVIEWER STATUS
  // ============================================================

  const getReviewerStatus = () => {
    if (!application) return "Waiting";

    return (
      application.reviewer_status ||
      application.academic_reviewer_status ||
      "Waiting"
    );
  };

  // ============================================================
  // STUDENT EVALUATION
  // ============================================================

  const getStudentEvaluationStatus = () => {
    if (!application) return "Waiting";

    return (
      application.student_evaluation_status ||
      application.student_review_status ||
      application.teaching_evaluation_status ||
      "Waiting"
    );
  };

  // ============================================================
  // COMMITTEE STATUS
  // ============================================================

  const getCommitteeStatus = () => {
    if (!application) return "Waiting";

    return (
      application.committee_status ||
      application.committee_decision ||
      "Waiting"
    );
  };

  // ============================================================
  // TOTAL POINTS
  // ============================================================

  const getTotalPoints = () => {
    if (!application) return "0.00";

    const values = [
      application.total_points,
      application.total_material_points,
      application.points,
    ];

    for (const value of values) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        return Number(value).toFixed(2);
      }
    }

    return materials
      .reduce(
        (total, item) =>
          total + Number(item.points || 0),
        0
      )
      .toFixed(2);
  };

  // ============================================================
  // DOCUMENT URL
  // ============================================================

  const getDocumentUrl = (document) => {
    if (!document) return null;

    if (String(document).startsWith("http")) {
      return document;
    }

    return `http://127.0.0.1:8000${document}`;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

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
      status.includes("review") ||
      status.includes("waiting")
    ) {
      return (
        <span style={styles.review}>
          <FaClock />
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
  // SUBMIT DEAN REVIEW
  // ============================================================

  const submitReview = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!decision) {
      setError("Please select a Dean recommendation.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter Dean remarks.");
      return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      /*
       * IMPORTANT:
       *
       * The values here must match the Django backend choices.
       *
       * Example:
       * recommended
       * not_recommended
       */

      const payload = {
        dean_recommendation: decision,
        dean_comment: comment,
      };

      console.log("DEAN REVIEW PAYLOAD:", payload);

      const response = await api.post(
        `/api/applications/${id}/dean-review/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "DEAN REVIEW RESPONSE:",
        response.data
      );

      setSuccess(
        "Dean review has been submitted successfully."
      );

      setApplication(
        response.data.application ||
        response.data
      );

      setDecision("");
      setComment("");

      /*
       * Return to Dean applications after a short delay.
       */

      setTimeout(() => {
        navigate("/dean/applications");
      }, 1200);

    } catch (err) {
      console.error(
        "Dean review failed:",
        err.response?.data || err
      );

      const backendError =
        err.response?.data;

      if (typeof backendError === "string") {
        setError(backendError);
      } else if (backendError?.detail) {
        setError(backendError.detail);
      } else if (backendError?.error) {
        setError(backendError.error);
      } else if (backendError?.dean_recommendation) {
        setError(
          Array.isArray(
            backendError.dean_recommendation
          )
            ? backendError.dean_recommendation.join(
                ", "
              )
            : backendError.dean_recommendation
        );
      } else {
        setError(
          "Unable to submit Dean review."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <FaSpinner style={styles.loadingIcon} />
        <p>Loading promotion application...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR / NO APPLICATION
  // ============================================================

  if (!application) {
    return (
      <div style={styles.page}>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/dean/applications")
          }
        >
          <FaArrowLeft />
          Back to Applications
        </button>

        <div style={styles.errorBox}>
          <FaTimesCircle />
          {error || "Application not found."}
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
          TOP BAR
      ====================================================== */}

      <div style={styles.topBar}>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/dean/applications")
          }
        >
          <FaArrowLeft />
          Back to Applications
        </button>

        <span style={styles.applicationNumber}>
          Application #{application.id}
        </span>

      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Review Promotion Application
          </h1>

          <p style={styles.subtitle}>
            Dean review and recommendation
          </p>

        </div>

        <StatusBadge
          value={getDeanStatus()}
        />

      </div>

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div style={styles.successBox}>
          <FaCheckCircle />
          {success}
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={styles.errorBox}>
          <FaTimesCircle />
          {error}
        </div>
      )}

      {/* ======================================================
          APPLICATION SUMMARY
      ====================================================== */}

      <div style={styles.card}>

        <div style={styles.cardTitleRow}>

          <h2 style={styles.cardTitle}>
            <FaFileAlt />
            Application Summary
          </h2>

        </div>

        <div style={styles.summaryGrid}>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Applicant
            </span>

            <strong style={styles.value}>
              {getApplicantName()}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Current Position
            </span>

            <strong style={styles.value}>
              {getCurrentPosition()}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Position Applied For
            </span>

            <strong style={styles.value}>
              {getTargetPosition()}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Application Date
            </span>

            <strong style={styles.value}>
              {formatDate(
                application.created_at ||
                application.submitted_at ||
                application.application_date
              )}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Total Score
            </span>

            <strong style={styles.points}>
              {getTotalPoints()}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Overall Status
            </span>

            <StatusBadge
              value={
                application.final_status ||
                application.status ||
                "Pending"
              }
            />
          </div>

        </div>

      </div>

      {/* ======================================================
          STAFF DETAILS
      ====================================================== */}

      <div style={styles.card}>

        <h2 style={styles.cardTitle}>
          <FaUser />
          Staff Information
        </h2>

        <div style={styles.detailGrid}>

          <div>
            <span style={styles.label}>
              Full Name
            </span>

            <p style={styles.detailValue}>
              {getApplicantName()}
            </p>
          </div>

          <div>
            <span style={styles.label}>
              Email
            </span>

            <p style={styles.detailValue}>
              {application.employee?.email ||
                application.user?.email ||
                application.email ||
                "N/A"}
            </p>
          </div>

          <div>
            <span style={styles.label}>
              Department
            </span>

            <p style={styles.detailValue}>
              {application.department_name ||
                application.department?.name ||
                application.employee?.department_name ||
                "N/A"}
            </p>
          </div>

          <div>
            <span style={styles.label}>
              Current Academic Rank
            </span>

            <p style={styles.detailValue}>
              {getCurrentPosition()}
            </p>
          </div>

        </div>

      </div>

      {/* ======================================================
          HOD REVIEW
      ====================================================== */}

      <div style={styles.card}>

        <h2 style={styles.cardTitle}>
          <FaBriefcase />
          HOD Review
        </h2>

        <div style={styles.reviewPanel}>

          <div style={styles.reviewRow}>

            <span style={styles.label}>
              HOD Recommendation
            </span>

            <StatusBadge
              value={getHODRecommendation()}
            />

          </div>

          <div style={styles.commentBox}>

            <span style={styles.label}>
              HOD Remarks
            </span>

            <p style={styles.comment}>
              {getHODComment()}
            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
          PROMOTION CHECKLIST
      ====================================================== */}

      <div style={styles.card}>

        <h2 style={styles.cardTitle}>
          <FaGraduationCap />
          Promotion Checklist & Supporting Documents
        </h2>

        {loadingMaterials ? (

          <div style={styles.centerLoading}>
            <FaSpinner style={styles.loadingIcon} />
            <p>Loading promotion materials...</p>
          </div>

        ) : materials.length === 0 ? (

          <div style={styles.noMaterials}>
            <FaFileAlt size={35} />
            <p>
              No promotion materials were found.
            </p>
          </div>

        ) : (

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
                    Document
                  </th>

                  <th style={styles.th}>
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

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      <td style={styles.td}>

                        {material.material_type_display ||
                          material.material_type ||
                          material.title ||
                          "Promotion Material"}

                      </td>

                      <td style={styles.td}>

                        <strong>
                          {material.points ??
                            "0"}
                        </strong>

                      </td>

                      <td style={styles.td}>

                        {material.document ? (

                          <a
                            href={getDocumentUrl(
                              material.document
                            )}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.documentLink}
                          >
                            <FaPaperclip />
                            View Document
                          </a>

                        ) : (

                          <span style={styles.noDocument}>
                            No document
                          </span>

                        )}

                      </td>

                      <td style={styles.td}>

                        <StatusBadge
                          value={
                            material.status ||
                            material.review_status ||
                            "Submitted"
                          }
                        />

                      </td>

                    </tr>

                  )
                )}

              </tbody>

              <tfoot>

                <tr>

                  <td
                    colSpan="2"
                    style={styles.totalLabel}
                  >
                    TOTAL SCORE
                  </td>

                  <td style={styles.totalValue}>

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

      </div>

      {/* ======================================================
          OTHER REVIEW STAGES
      ====================================================== */}

      <div style={styles.card}>

        <h2 style={styles.cardTitle}>
          <FaClipboardList />
          Promotion Approval Progress
        </h2>

        <div style={styles.stageGrid}>

          <div style={styles.stage}>

            <div style={styles.stageNumber}>
              1
            </div>

            <div>
              <strong>
                Staff Submission
              </strong>

              <span style={styles.stageStatus}>
                Submitted
              </span>
            </div>

          </div>

          <div style={styles.stage}>

            <div style={styles.stageNumber}>
              2
            </div>

            <div>
              <strong>
                HOD Review
              </strong>

              <StatusBadge
                value={
                  getHODRecommendation()
                }
              />
            </div>

          </div>

          <div style={styles.stageActive}>

            <div style={styles.stageNumberActive}>
              3
            </div>

            <div>
              <strong>
                Dean Review
              </strong>

              <span style={styles.stageStatus}>
                Current Stage
              </span>
            </div>

          </div>

          <div style={styles.stage}>

            <div style={styles.stageNumber}>
              4
            </div>

            <div>
              <strong>
                Academic Reviewer
              </strong>

              <StatusBadge
                value={
                  getReviewerStatus()
                }
              />
            </div>

          </div>

          <div style={styles.stage}>

            <div style={styles.stageNumber}>
              5
            </div>

            <div>
              <strong>
                Student Evaluation
              </strong>

              <StatusBadge
                value={
                  getStudentEvaluationStatus()
                }
              />
            </div>

          </div>

          <div style={styles.stage}>

            <div style={styles.stageNumber}>
              6
            </div>

            <div>
              <strong>
                Promotion Committee
              </strong>

              <StatusBadge
                value={
                  getCommitteeStatus()
                }
              />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          DEAN REVIEW FORM
      ====================================================== */}

      <div style={styles.reviewCard}>

        <h2 style={styles.reviewTitle}>
          Dean Decision
        </h2>

        <p style={styles.reviewSubtitle}>
          Review the application and HOD recommendation
          before submitting your decision.
        </p>

        <form onSubmit={submitReview}>

          <div style={styles.formGroup}>

            <label style={styles.formLabel}>
              Dean Recommendation
            </label>

            <select
              value={decision}
              onChange={(e) =>
                setDecision(e.target.value)
              }
              style={styles.select}
              disabled={submitting}
            >

              <option value="">
                -- Select Recommendation --
              </option>

              <option value="recommended">
                Recommend for Further Review
              </option>

              <option value="not_recommended">
                Do Not Recommend
              </option>

            </select>

          </div>

          <div style={styles.formGroup}>

            <label style={styles.formLabel}>
              Dean Remarks
            </label>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Enter your remarks regarding this promotion application..."
              rows="6"
              style={styles.textarea}
              disabled={submitting}
            />

          </div>

          <div style={styles.formActions}>

            <button
              type="button"
              style={styles.cancelButton}
              onClick={() =>
                navigate("/dean/applications")
              }
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={submitting}
            >

              {submitting ? (
                <>
                  <FaSpinner />
                  Submitting...
                </>
              ) : (
                <>
                  <FaSave />
                  Submit Dean Recommendation
                </>
              )}

            </button>

          </div>

        </form>

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

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "#fff",
    color: "#2563eb",
    padding: "10px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  applicationNumber: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#172554",
    fontSize: "28px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "22px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  cardTitleRow: {
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#172554",
    fontSize: "18px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "15px",
  },

  label: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  value: {
    color: "#172554",
    fontSize: "14px",
  },

  points: {
    color: "#2563eb",
    fontSize: "20px",
    fontWeight: "700",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },

  detailValue: {
    margin: 0,
    color: "#334155",
    fontSize: "14px",
  },

  reviewPanel: {
    marginTop: "20px",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "20px",
  },

  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "15px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  commentBox: {
    paddingTop: "18px",
  },

  comment: {
    margin: 0,
    color: "#334155",
    lineHeight: "1.6",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    padding: "14px",
  },

  tableWrapper: {
    overflowX: "auto",
    marginTop: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
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

  td: {
    padding: "13px",
    borderBottom:
      "1px solid #eef2f7",
    fontSize: "13px",
  },

  documentLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },

  noDocument: {
    color: "#94a3b8",
  },

  totalLabel: {
    padding: "14px",
    textAlign: "right",
    fontWeight: "700",
    background: "#f1f5f9",
  },

  totalValue: {
    padding: "14px",
    fontWeight: "700",
    color: "#2563eb",
    background: "#eff6ff",
  },

  noMaterials: {
    textAlign: "center",
    padding: "45px",
    color: "#94a3b8",
  },

  centerLoading: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },

  stageGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "15px",
    marginTop: "20px",
  },

  stage: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "9px",
  },

  stageActive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    background: "#eff6ff",
    border:
      "2px solid #2563eb",
    borderRadius: "9px",
  },

  stageNumber: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  stageNumberActive: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  stageStatus: {
    display: "block",
    marginTop: "4px",
    color: "#64748b",
    fontSize: "11px",
  },

  reviewCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
    border:
      "2px solid #2563eb",
    boxShadow:
      "0 4px 15px rgba(37,99,235,0.08)",
  },

  reviewTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "21px",
  },

  reviewSubtitle: {
    color: "#64748b",
    marginTop: "7px",
    marginBottom: "25px",
  },

  formGroup: {
    marginBottom: "20px",
  },

  formLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontWeight: "600",
    fontSize: "13px",
  },

  select: {
    width: "100%",
    padding: "12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "7px",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "25px",
  },

  cancelButton: {
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  submitButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  approved: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "600",
  },

  rejected: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "12px",
    fontWeight: "600",
  },

  review: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "600",
  },

  pending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "600",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#dcfce7",
    color: "#166534",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#64748b",
  },

  loadingIcon: {
    fontSize: "30px",
    animation:
      "spin 1s linear infinite",
  },
};

export default ReviewApplication;

