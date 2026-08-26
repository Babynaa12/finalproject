import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CompleteReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("access_token");

  const role =
    localStorage.getItem("role");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      role &&
      role.toUpperCase() !== "REVIEWER"
    ) {
      navigate("/login");
      return;
    }

    fetchCompletedReviews();
  }, []);

  const fetchCompletedReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/academic-material-reviews/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = response.data;

      if (data?.results) {
        data = data.results;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      const completed = data.filter(
        (review) => {
          const status =
            String(
              review.status ||
              review.review_status ||
              ""
            ).toLowerCase();

          return (
            status.includes("completed") ||
            status.includes("submitted") ||
            status.includes("reviewed") ||
            review.is_completed === true
          );
        }
      );

      setReviews(completed);
    } catch (err) {
      console.error(
        "Completed reviews error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "Unauthorized. Only reviewers can access completed reviews."
        );
        return;
      }

      setError(
        "Failed to load completed reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  const getApplication = (review) =>
    review.application ||
    review.promotion_application ||
    {};

  const getApplicant = (review) => {
    const application =
      getApplication(review);

    return (
      review.employee_name ||
      review.applicant_name ||
      application.employee_name ||
      application.applicant_name ||
      application.employee?.full_name ||
      application.employee?.name ||
      application.employee?.username ||
      "N/A"
    );
  };

  const getRank = (review) => {
    const application =
      getApplication(review);

    return (
      application.targeted_title_name ||
      application.targeted_title?.title_name ||
      application.targeted_title?.name ||
      application.targeted_title ||
      "N/A"
    );
  };

  const getRecommendation = (review) =>
    review.recommendation ||
    review.reviewer_recommendation ||
    review.review_recommendation ||
    "Not specified";

  const getScore = (review) =>
    review.score ??
    review.total_score ??
    review.mark ??
    "N/A";

  const getDate = (review) => {
    const date =
      review.reviewed_at ||
      review.completed_at ||
      review.updated_at ||
      review.created_at;

    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-GB"
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "30px",
        }}
      >
        <h1>Completed Reviews</h1>

        <p style={{ color: "#6b7280" }}>
          Loading completed reviews...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h1
          style={{
            margin: 0,
            color: "#111827",
            fontSize: "28px",
          }}
        >
          Completed Reviews
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginTop: "8px",
          }}
        >
          View promotion reviews that you have
          already completed.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={cardTitle}>
            Completed Reviews
          </h3>

          <div style={cardNumber}>
            {reviews.length}
          </div>

          <span style={cardDescription}>
            Reviews completed by you
          </span>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitle}>
            Review Status
          </h3>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#16a34a",
              margin: "12px 0",
            }}
          >
            Completed
          </div>

          <span style={cardDescription}>
            Successfully submitted assessments
          </span>
        </div>
      </div>

      {/* TABLE */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom:
              "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Review History
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
              }}
            >
              Your previously completed academic
              promotion reviews.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/reviewer/assigned-reviews"
              )
            }
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Assigned Reviews
          </button>
        </div>

        {reviews.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            You have not completed any reviews yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>
                    Application ID
                  </th>

                  <th style={thStyle}>
                    Applicant
                  </th>

                  <th style={thStyle}>
                    Applied Rank
                  </th>

                  <th style={thStyle}>
                    Score
                  </th>

                  <th style={thStyle}>
                    Recommendation
                  </th>

                  <th style={thStyle}>
                    Date
                  </th>

                  <th style={thStyle}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => {
                  const application =
                    getApplication(review);

                  const id =
                    application.id ||
                    review.application_id ||
                    review.id;

                  return (
                    <tr key={review.id}>
                      <td style={tdStyle}>
                        <strong>
                          APP-
                          {String(id).padStart(
                            3,
                            "0"
                          )}
                        </strong>
                      </td>

                      <td style={tdStyle}>
                        {getApplicant(review)}
                      </td>

                      <td style={tdStyle}>
                        {getRank(review)}
                      </td>

                      <td style={tdStyle}>
                        {getScore(review)}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            background:
                              "#dcfce7",
                            color:
                              "#166534",
                            padding:
                              "6px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "600",
                          }}
                        >
                          {getRecommendation(
                            review
                          )}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {getDate(review)}
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() =>
                            navigate(
                              `/reviewer/review/${id}`
                            )
                          }
                          style={{
                            background:
                              "#2563eb",
                            color:
                              "#ffffff",
                            border: "none",
                            padding:
                              "8px 14px",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600",
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "22px",
};

const cardTitle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "15px",
};

const cardNumber = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#111827",
  margin: "10px 0",
};

const cardDescription = {
  color: "#9ca3af",
  fontSize: "13px",
};

const thStyle = {
  padding: "14px 16px",
  color: "#6b7280",
  fontSize: "13px",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "15px 16px",
  borderBottom: "1px solid #f1f5f9",
  color: "#374151",
};

export default CompleteReviews;