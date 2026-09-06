import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function ReviewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // GET APPLICATION
  // ============================================================

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
      console.error("Error loading application:", error);

      setError(
        error.response?.data?.detail ||
        "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUBMIT HOD REVIEW
  // ============================================================

  const handleReview = async (recommendation) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      console.log("Sending recommendation:", recommendation);

      const normalizedRecommendation =
        recommendation === "recommended"
          ? "RECOMMEND"
          : recommendation === "not_recommended"
          ? "REJECT"
          : recommendation;

      const response = await api.patch(
        `/api/applications/${id}/hod-review/`,
        {
          decision: normalizedRecommendation,
          comments: comments,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("HOD Review Response:", response.data);

      alert("HOD review submitted successfully.");

      navigate("/hod/applications");

    } catch (error) {
      console.error("HOD review error:", error);

      setError(
        error.response?.data?.detail ||
        "Failed to submit HOD review."
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
  // ERROR
  // ============================================================

  if (!application) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>
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

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Review Promotion Application
          </h1>

          <p style={styles.subtitle}>
            Review the applicant's promotion materials
            and provide your HOD recommendation.
          </p>
        </div>
      </div>

      {/* APPLICATION ID */}

      <div style={styles.infoCard}>

        {/* <div>
          <span style={styles.label}>
            Application ID
          </span>

          <strong style={styles.value}>
            {id}
          </strong>
        </div> */}

        <div>
          <span style={styles.label}>
            Applicant
          </span>

          <strong style={styles.value}>
            {application.employee_name ||
              application.applicant_name ||
              application.employee?.name ||
              application.employee?.username ||
              "Unknown Applicant"}
          </strong>
        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}


      {/* APPLICATION DOCUMENTS */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Application Documents
        </h2>

        <p style={styles.description}>
          Review the documents submitted by the applicant.
        </p>

        {application.documents ? (
          <div>
            Documents available
          </div>
        ) : (
          <div style={styles.empty}>
            No application documents available.
          </div>
        )}

      </div>


      {/* TEACHING EVALUATION */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Teaching Evaluation
        </h2>

        <p style={styles.description}>
          Review the student's teaching evaluation
          records.
        </p>

        {application.teaching_evaluation ? (
          <div>
            Teaching evaluation available
          </div>
        ) : (
          <div style={styles.empty}>
            No teaching evaluation available.
          </div>
        )}

      </div>


      {/* PEER REVIEWS */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Peer Reviews
        </h2>

        <p style={styles.description}>
          Review peer evaluation and assessment.
        </p>

        {application.peer_reviews ? (
          <div>
            Peer reviews available
          </div>
        ) : (
          <div style={styles.empty}>
            No peer reviews available.
          </div>
        )}

      </div>


      {/* RESEARCH MATERIALS */}

      <div style={styles.section}>

        <h2 style={styles.sectionTitle}>
          Research Materials
        </h2>

        <p style={styles.description}>
          Review research publications and other
          academic materials.
        </p>

        {application.research_materials ? (
          <div>
            Research materials available
          </div>
        ) : (
          <div style={styles.empty}>
            No research materials available.
          </div>
        )}

      </div>


      {/* HOD RECOMMENDATION */}

      <div style={styles.reviewSection}>

        <h2 style={styles.sectionTitle}>
          HOD Recommendation
        </h2>

        <p style={styles.description}>
          Provide your comments and recommendation
          for this promotion application.
        </p>


        {/* COMMENTS */}

        <textarea
          value={comments}
          onChange={(e) =>
            setComments(e.target.value)
          }
          placeholder="Enter your comments..."
          rows="6"
          style={styles.textarea}
        />


        {/* BUTTONS */}

        <div style={styles.buttons}>

          <button
            style={styles.recommendButton}
            disabled={submitting}
            onClick={() =>
              handleReview("recommended")
            }
          >
            {submitting
              ? "Submitting..."
              : "Recommend"}
          </button>


          <button
            style={styles.rejectButton}
            disabled={submitting}
            onClick={() =>
              handleReview("not_recommended")
            }
          >
            {submitting
              ? "Submitting..."
              : "Not Recommend"}
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    padding: "30px",
    minHeight: "100vh",
    background: "#f5f7fb",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#172554",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "7px",
    color: "#64748b",
  },

  infoCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    gap: "80px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  label: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "5px",
  },

  value: {
    color: "#172554",
    fontSize: "16px",
  },

  section: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  reviewSection: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    border: "1px solid #dbeafe",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    margin: 0,
    color: "#172554",
    fontSize: "19px",
    fontWeight: "700",
  },

  description: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "7px",
    marginBottom: "18px",
  },

  empty: {
    padding: "15px",
    background: "#f8fafc",
    color: "#94a3b8",
    borderRadius: "7px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    resize: "vertical",
    fontSize: "14px",
    outline: "none",
    marginBottom: "18px",
  },

  buttons: {
    display: "flex",
    gap: "12px",
  },

  recommendButton: {
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    padding: "11px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  rejectButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "11px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "20px",
    borderRadius: "8px",
  },

  loading: {
    background: "#ffffff",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
  },

};

export default ReviewApplication;