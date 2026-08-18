import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ReviewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const response = await api.get(
        `/api/applications/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplication(response.data);
    } catch (error) {
      console.error("Failed to load application:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const submitReview = async (decision) => {
    if (!comments.trim()) {
      alert("Please enter your comments before submitting.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${
        decision === "Recommended"
          ? "RECOMMEND"
          : "NOT RECOMMEND"
      } this application?`
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      await api.post(
        `/api/applications/${id}/hod-review/`,
        {
          decision: decision,
          comments: comments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Review submitted successfully.");

      navigate("/hod/applications");
    } catch (error) {
      console.error("Review submission failed:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading application...
        </div>
      </div>
    );
  }

  // ============================================================
  // APPLICATION NOT FOUND
  // ============================================================

  if (!application) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>
          <h2>Application Not Found</h2>

          <p>
            The requested promotion application could
            not be found.
          </p>

          <button
            style={styles.backButton}
            onClick={() => navigate("/hod/applications")}
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const applicant =
    application.employee_name ||
    application.employee?.name ||
    application.employee?.username ||
    "Unknown Applicant";

  const currentPosition =
    application.current_title_name ||
    application.current_position ||
    "Not provided";

  const targetPosition =
    application.targeted_title_name ||
    application.target_position ||
    "Not provided";

  const status =
    application.final_status || "Pending";

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
            Review Promotion Application
          </h1>

          <p style={styles.subtitle}>
            Review the applicant's promotion evidence
            and provide your recommendation.
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/hod/applications")}
        >
          ← Back
        </button>

      </div>


      {/* ======================================================
          APPLICATION SUMMARY
      ====================================================== */}

      <div style={styles.summaryCard}>

        <div style={styles.summaryHeader}>
          <h2>Application Information</h2>

          <span
            style={{
              ...styles.status,
              background:
                status === "Approved"
                  ? "#dcfce7"
                  : status === "Rejected"
                  ? "#fee2e2"
                  : "#fef3c7",
              color:
                status === "Approved"
                  ? "#166534"
                  : status === "Rejected"
                  ? "#991b1b"
                  : "#92400e",
            }}
          >
            {status}
          </span>
        </div>

        <div style={styles.infoGrid}>

          <div>
            <span style={styles.label}>
              Application ID
            </span>

            <strong style={styles.value}>
              #{id}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Applicant
            </span>

            <strong style={styles.value}>
              {applicant}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Current Position
            </span>

            <strong style={styles.value}>
              {currentPosition}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Target Position
            </span>

            <strong style={styles.value}>
              {targetPosition}
            </strong>
          </div>

        </div>

      </div>


      {/* ======================================================
          APPLICATION DOCUMENTS
      ====================================================== */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>Application Documents</h2>

          <span style={styles.number}>
            01
          </span>
        </div>

        <div style={styles.contentCard}>

          {application.documents?.length > 0 ? (

            application.documents.map((document) => (

              <div
                key={document.id}
                style={styles.document}
              >

                <div>
                  <strong>
                    {document.title ||
                      "Application Document"}
                  </strong>

                  <p style={styles.smallText}>
                    {document.description ||
                      "Promotion supporting document"}
                  </p>
                </div>

                {document.file && (
                  <a
                    href={document.file}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.viewButton}
                  >
                    View Document
                  </a>
                )}

              </div>

            ))

          ) : (

            <div style={styles.empty}>
              No application documents available.
            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          TEACHING EVALUATION
      ====================================================== */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>Teaching Evaluation</h2>

          <span style={styles.number}>
            02
          </span>
        </div>

        <div style={styles.contentCard}>

          {application.teaching_evaluation ? (

            <div style={styles.evaluationGrid}>

              <div>
                <span style={styles.label}>
                  Score
                </span>

                <strong style={styles.score}>
                  {application.teaching_evaluation.score ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span style={styles.label}>
                  Evaluation
                </span>

                <p>
                  {application.teaching_evaluation.comments ||
                    "No comments provided."}
                </p>
              </div>

            </div>

          ) : (

            <div style={styles.empty}>
              No teaching evaluation available.
            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          PEER REVIEWS
      ====================================================== */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>Peer Reviews</h2>

          <span style={styles.number}>
            03
          </span>
        </div>

        <div style={styles.contentCard}>

          {application.peer_reviews?.length > 0 ? (

            application.peer_reviews.map((review) => (

              <div
                key={review.id}
                style={styles.review}
              >

                <div style={styles.reviewTop}>

                  <strong>
                    {review.reviewer_name ||
                      "Reviewer"}
                  </strong>

                  <span>
                    {review.status ||
                      "Completed"}
                  </span>

                </div>

                <p>
                  {review.comments ||
                    "No comments provided."}
                </p>

              </div>

            ))

          ) : (

            <div style={styles.empty}>
              No peer reviews available.
            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          RESEARCH MATERIALS
      ====================================================== */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>Research Materials</h2>

          <span style={styles.number}>
            04
          </span>
        </div>

        <div style={styles.contentCard}>

          {application.research_materials?.length > 0 ? (

            application.research_materials.map((material) => (

              <div
                key={material.id}
                style={styles.document}
              >

                <div>
                  <strong>
                    {material.title ||
                      "Research Material"}
                  </strong>

                  <p style={styles.smallText}>
                    {material.type ||
                      "Research / Publication"}
                  </p>
                </div>

                {material.file && (
                  <a
                    href={material.file}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.viewButton}
                  >
                    View
                  </a>
                )}

              </div>

            ))

          ) : (

            <div style={styles.empty}>
              No research materials available.
            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          HOD RECOMMENDATION
      ====================================================== */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>
          <h2>HOD Recommendation</h2>

          <span style={styles.number}>
            05
          </span>
        </div>

        <div style={styles.recommendationCard}>

          <label style={styles.commentLabel}>
            HOD Comments
          </label>

          <textarea
            value={comments}
            onChange={(e) =>
              setComments(e.target.value)
            }
            placeholder="Enter your comments and recommendation justification..."
            rows="6"
            style={styles.textarea}
            disabled={submitting}
          />

          <div style={styles.actions}>

            <button
              style={styles.notRecommendButton}
              disabled={submitting}
              onClick={() =>
                submitReview("Not Recommended")
              }
            >
              {submitting
                ? "Submitting..."
                : "Not Recommend"}
            </button>

            <button
              style={styles.recommendButton}
              disabled={submitting}
              onClick={() =>
                submitReview("Recommended")
              }
            >
              {submitting
                ? "Submitting..."
                : "Recommend"}
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}


// ============================================================
// INLINE STYLES
// ============================================================

const styles = {

  page: {
    padding: "30px",
    background: "#f5f7fb",
    minHeight: "100vh",
    color: "#1f2937",
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
    marginTop: "8px",
    color: "#64748b",
  },

  backButton: {
    border: "none",
    background: "#ffffff",
    color: "#1e40af",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },

  summaryCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  status: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "6px",
    textTransform: "uppercase",
  },

  value: {
    fontSize: "15px",
    color: "#1e293b",
  },

  section: {
    marginBottom: "25px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  number: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
  },

  contentCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  document: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
  },

  smallText: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  viewButton: {
    textDecoration: "none",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },

  evaluationGrid: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "25px",
  },

  score: {
    fontSize: "24px",
    color: "#2563eb",
  },

  review: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  empty: {
    textAlign: "center",
    padding: "25px",
    color: "#94a3b8",
  },

  recommendationCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  commentLabel: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },

  recommendButton: {
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  notRecommendButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loading: {
    background: "#ffffff",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
  },

  error: {
    background: "#ffffff",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
  },

};

export default ReviewApplication;