import { useEffect, useState } from "react";
import api from "../../services/api";

function MyApplications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [academicReviews, setAcademicReviews] = useState({});
  const [studentEvaluations, setStudentEvaluations] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);

  const [error, setError] = useState("");

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
  // NORMALIZE
  // ============================================================

  const normalize = (value) => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ");
  };

  // ============================================================
  // FIRST VALUE
  // ============================================================

  const firstValue = (obj, fields, defaultValue = "") => {
    if (!obj) return defaultValue;

    for (const field of fields) {
      if (
        obj[field] !== undefined &&
        obj[field] !== null &&
        obj[field] !== ""
      ) {
        return obj[field];
      }
    }

    return defaultValue;
  };

  // ============================================================
  // EXTRACT ARRAY
  // ============================================================

  const extractArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // ============================================================
  // FETCH MY APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const res = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("MY APPLICATIONS:", res.data);

      const data = extractArray(res.data);

      // ========================================================
      // FILTER CURRENT STAFF
      // ========================================================

      const myApps = data.filter((app) => {
        return (
          String(app.employee) === String(user?.id) ||
          String(app.employee_id) === String(user?.id) ||
          String(app.user) === String(user?.id) ||
          String(app.user_id) === String(user?.id)
        );
      });

      console.log("MY FILTERED APPLICATIONS:", myApps);

      setApplications(myApps);

      // ========================================================
      // FETCH BOTH REVIEW TYPES
      // ========================================================

      await Promise.all([
        fetchAcademicReviews(myApps),
        fetchStudentEvaluations(myApps),
      ]);
    } catch (err) {
      console.error(
        "Failed to load applications:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load your promotion records."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH ACADEMIC MATERIAL REVIEWS
  // ============================================================

  const fetchAcademicReviews = async (apps) => {
    try {
      setLoadingReviews(true);

      const token = getToken();

      if (!token || !apps.length) {
        setAcademicReviews({});
        return;
      }

      const reviewMap = {};

      await Promise.all(
        apps.map(async (app) => {
          try {
            const res = await api.get(
              `/api/academic-material-reviews/?application=${app.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = extractArray(res.data);

            reviewMap[app.id] = data;

            console.log(
              `Academic reviews for application ${app.id}:`,
              data
            );
          } catch (err) {
            console.error(
              `Failed to fetch academic reviews for application ${app.id}:`,
              err.response?.data || err
            );

            reviewMap[app.id] = [];
          }
        })
      );

      setAcademicReviews(reviewMap);

      console.log(
        "ALL ACADEMIC MATERIAL REVIEWS:",
        reviewMap
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  // ============================================================
  // FETCH STUDENT EVALUATIONS
  //
  // IMPORTANT:
  // Backend endpoint:
  //
  // /api/student-evaluations/
  //
  // ============================================================

  const fetchStudentEvaluations = async (apps) => {
    try {
      setLoadingEvaluations(true);

      const token = getToken();

      if (!token || !apps.length) {
        setStudentEvaluations({});
        return;
      }

      const evaluationMap = {};

      await Promise.all(
        apps.map(async (app) => {
          try {
            const res = await api.get(
              `/api/student-evaluations/?application=${app.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = extractArray(res.data);

            evaluationMap[app.id] = data;

            console.log(
              `Student evaluations for application ${app.id}:`,
              data
            );
          } catch (err) {
            console.error(
              `Failed to fetch student evaluations for application ${app.id}:`,
              err.response?.data || err
            );

            evaluationMap[app.id] = [];
          }
        })
      );

      setStudentEvaluations(evaluationMap);

      console.log(
        "ALL STUDENT EVALUATIONS:",
        evaluationMap
      );
    } finally {
      setLoadingEvaluations(false);
    }
  };

  // ============================================================
  // GET APPLICATION REVIEWS
  // ============================================================

  const getApplicationReviews = (app) => {
    return academicReviews[app.id] || [];
  };

  // ============================================================
  // GET STUDENT EVALUATIONS
  // ============================================================

  const getApplicationStudentEvaluations = (app) => {
    return studentEvaluations[app.id] || [];
  };

  // ============================================================
  // CHECK ACADEMIC REVIEW COMPLETION
  // ============================================================

  const isReviewRecordCompleted = (review) => {
    if (!review) return false;

    const possibleValues = [
      review.status,
      review.review_status,
      review.reviewer_status,
      review.decision,
      review.recommendation,
      review.review_decision,
      review.assessment_status,
    ];

    const value = possibleValues.find(
      (item) =>
        item !== undefined &&
        item !== null &&
        String(item).trim() !== ""
    );

    if (value !== undefined) {
      const status = normalize(value);

      if (
        status.includes("pending") ||
        status.includes("waiting") ||
        status.includes("assigned") ||
        status.includes("in progress") ||
        status.includes("not reviewed") ||
        status.includes("not started")
      ) {
        return false;
      }

      if (
        status.includes("complete") ||
        status.includes("approved") ||
        status.includes("recommend") ||
        status.includes("accepted") ||
        status.includes("submitted") ||
        status.includes("reviewed") ||
        status.includes("passed")
      ) {
        return true;
      }
    }

    const scoreFields = [
      review.points,
      review.score,
      review.total_points,
      review.total_score,
      review.mark,
      review.rating,
    ];

    const hasScore = scoreFields.some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );

    const hasComment =
      review.comment ||
      review.comments ||
      review.remarks ||
      review.reviewer_comment ||
      review.assessment_comment;

    return Boolean(hasScore || hasComment);
  };

  // ============================================================
  // ALL ACADEMIC REVIEWS COMPLETE
  // ============================================================

  const areAllReviewerAssessmentsComplete = (app) => {
    const reviews = getApplicationReviews(app);

    if (!reviews.length) {
      return false;
    }

    const completedReviews = reviews.filter(
      isReviewRecordCompleted
    );

    console.log(
      `Application ${app.id}: ${completedReviews.length}/${reviews.length} academic reviews completed`
    );

    return completedReviews.length === reviews.length;
  };

  // ============================================================
  // REVIEWER STATUS
  // ============================================================

  const getReviewerStatus = (app) => {
    if (areAllReviewerAssessmentsComplete(app)) {
      return "Completed";
    }

    return firstValue(
      app,
      [
        "reviewer_recommendation",
        "reviewer_status",
        "review_status",
        "reviewer_decision",
        "academic_reviewer_status",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // STUDENT EVALUATION RECORD COMPLETION
  //
  // This is the important fix.
  // We check the REAL student-evaluation records.
  // ============================================================

  const isStudentEvaluationCompleted = (evaluation) => {
    if (!evaluation) return false;

    console.log(
      "Checking student evaluation:",
      evaluation
    );

    // ----------------------------------------------------------
    // STATUS FIELDS
    // ----------------------------------------------------------

    const statusFields = [
      evaluation.status,
      evaluation.evaluation_status,
      evaluation.evaluation_result,
      evaluation.review_status,
      evaluation.submission_status,
      evaluation.completion_status,
      evaluation.teaching_evaluation_status,
    ];

    const statusValue = statusFields.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );

    if (statusValue !== undefined) {
      const status = normalize(statusValue);

      // Definitely NOT completed
      if (
        status.includes("pending") ||
        status.includes("waiting") ||
        status.includes("assigned") ||
        status.includes("in progress") ||
        status.includes("not started") ||
        status.includes("not submitted") ||
        status.includes("draft")
      ) {
        return false;
      }

      // Definitely completed
      if (
        status.includes("complete") ||
        status.includes("completed") ||
        status.includes("submitted") ||
        status.includes("approved") ||
        status.includes("accepted") ||
        status.includes("reviewed") ||
        status.includes("evaluated") ||
        status.includes("passed")
      ) {
        return true;
      }
    }

    // ----------------------------------------------------------
    // COMPLETION BOOLEAN FIELDS
    // ----------------------------------------------------------

    const booleanFields = [
      evaluation.completed,
      evaluation.is_completed,
      evaluation.evaluation_completed,
      evaluation.is_submitted,
      evaluation.submitted,
      evaluation.submission_complete,
    ];

    if (
      booleanFields.some(
        (value) => value === true
      )
    ) {
      return true;
    }

    // ----------------------------------------------------------
    // DATE FIELDS
    // ----------------------------------------------------------

    const completionDate = firstValue(
      evaluation,
      [
        "completed_at",
        "completion_date",
        "completed_date",
        "submitted_at",
        "submission_date",
        "evaluated_at",
      ],
      null
    );

    if (completionDate) {
      return true;
    }

    // ----------------------------------------------------------
    // SCORE / ANSWERS
    // ----------------------------------------------------------

    const scoreFields = [
      evaluation.score,
      evaluation.total_score,
      evaluation.total_points,
      evaluation.mark,
      evaluation.rating,
      evaluation.average_score,
      evaluation.percentage,
    ];

    const hasScore = scoreFields.some(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    );

    if (hasScore) {
      return true;
    }

    // ----------------------------------------------------------
    // ANSWER / RESPONSE FIELDS
    // ----------------------------------------------------------

    const answerFields = [
      evaluation.answers,
      evaluation.responses,
      evaluation.ratings,
      evaluation.questions,
      evaluation.feedback,
    ];

    const hasAnswers = answerFields.some(
      (value) => {
        if (value === undefined || value === null) {
          return false;
        }

        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (
          typeof value === "object" &&
          Object.keys(value).length > 0
        ) {
          return true;
        }

        return String(value).trim() !== "";
      }
    );

    if (hasAnswers) {
      return true;
    }

    return false;
  };

  // ============================================================
  // CHECK ALL STUDENT EVALUATIONS
  // ============================================================

  const isStudentEvaluationStageComplete = (app) => {
    const evaluations =
      getApplicationStudentEvaluations(app);

    if (!evaluations.length) {
      return false;
    }

    const completedEvaluations =
      evaluations.filter(
        isStudentEvaluationCompleted
      );

    console.log(
      `Application ${app.id}: ${completedEvaluations.length}/${evaluations.length} student evaluations completed`
    );

    return (
      completedEvaluations.length ===
      evaluations.length
    );
  };

  // ============================================================
  // STUDENT STATUS
  //
  // REAL API DATA TAKES PRIORITY OVER APPLICATION FIELD
  // ============================================================

  const getStudentStatus = (app) => {
    const evaluations =
      getApplicationStudentEvaluations(app);

    // ----------------------------------------------------------
    // IMPORTANT:
    // If real evaluation records exist, use them.
    // ----------------------------------------------------------

    if (evaluations.length > 0) {
      const completed =
        evaluations.filter(
          isStudentEvaluationCompleted
        ).length;

      if (completed === evaluations.length) {
        return "Completed";
      }

      return `In Progress (${completed}/${evaluations.length})`;
    }

    // ----------------------------------------------------------
    // FALLBACK TO APPLICATION FIELD
    // ----------------------------------------------------------

    return firstValue(
      app,
      [
        "student_evaluation_status",
        "student_evaluation",
        "student_review_status",
        "teaching_evaluation_status",
        "student_evaluation_result",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // HOD
  // ============================================================

  const getHODStatus = (app) => {
    return firstValue(
      app,
      [
        "hod_recommendation",
        "hod_status",
        "hod_review_status",
        "hod_decision",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // DEAN
  // ============================================================

  const getDeanStatus = (app) => {
    return firstValue(
      app,
      [
        "dean_recommendation",
        "dean_status",
        "dean_review_status",
        "dean_decision",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // COMMITTEE
  // ============================================================

  const getCommitteeStatus = (app) => {
    return firstValue(
      app,
      [
        "committee_recommendation",
        "committee_status",
        "committee_decision",
        "promotion_committee_status",
        "board_status",
        "board_decision",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // FINAL STATUS
  // ============================================================

  const getFinalStatus = (app) => {
    return firstValue(
      app,
      [
        "final_status",
        "final_decision",
        "promotion_decision",
        "status",
      ],
      "Pending"
    );
  };

  // ============================================================
  // OVERALL STATUS
  // ============================================================

  const getOverallStatus = (app) => {
    const finalStatus = getFinalStatus(app);

    if (
      isRejected(finalStatus)
    ) {
      return finalStatus;
    }

    if (
      isCompleted(finalStatus)
    ) {
      return finalStatus;
    }

    const studentComplete =
      isStudentEvaluationStageComplete(app);

    if (studentComplete) {
      return "In Progress";
    }

    return finalStatus;
  };

  // ============================================================
  // COMPLETED
  // ============================================================

  const isCompleted = (value) => {
    const status = normalize(value);

    if (!status) return false;

    return (
      status.includes("approved") ||
      status.includes("recommended") ||
      status.includes("recommend") ||
      status.includes("accepted") ||
      status.includes("completed") ||
      status.includes("complete") ||
      status.includes("passed") ||
      status.includes("reviewed") ||
      status.includes("evaluated") ||
      status.includes("submitted")
    );
  };

  // ============================================================
  // REJECTED
  // ============================================================

  const isRejected = (value) => {
    const status = normalize(value);

    return (
      status.includes("reject") ||
      status.includes("declined") ||
      status.includes("failed") ||
      status.includes("not recommended")
    );
  };

  // ============================================================
  // CURRENT STAGE
  // ============================================================

  const getCurrentStage = (app) => {
    const finalStatus = getFinalStatus(app);

    if (isCompleted(finalStatus)) {
      return "Promotion Approved";
    }

    if (isRejected(finalStatus)) {
      return "Promotion Rejected";
    }

    // ========================================================
    // COMMITTEE
    // ========================================================

    const committee = getCommitteeStatus(app);

    if (
      committee !== "Waiting" &&
      !isCompleted(committee) &&
      !isRejected(committee)
    ) {
      return "Promotion Committee";
    }

    if (isCompleted(committee)) {
      return "Final Decision";
    }

    // ========================================================
    // STUDENT EVALUATION
    // ========================================================

    const studentComplete =
      isStudentEvaluationStageComplete(app);

    if (studentComplete) {
      return "Promotion Committee";
    }

    const student = getStudentStatus(app);

    if (
      student !== "Waiting" &&
      !isCompleted(student) &&
      !isRejected(student)
    ) {
      return "Student Evaluation";
    }

    // ========================================================
    // REVIEWER
    // ========================================================

    const reviewer = getReviewerStatus(app);

    if (
      reviewer !== "Waiting" &&
      !isCompleted(reviewer) &&
      !isRejected(reviewer)
    ) {
      return "Reviewer Assessment";
    }

    if (
      areAllReviewerAssessmentsComplete(app) ||
      isCompleted(reviewer)
    ) {
      return "Student Evaluation";
    }

    // ========================================================
    // DEAN
    // ========================================================

    const dean = getDeanStatus(app);

    if (
      dean !== "Waiting" &&
      !isCompleted(dean) &&
      !isRejected(dean)
    ) {
      return "Dean Review";
    }

    if (isCompleted(dean)) {
      return "Reviewer Assessment";
    }

    // ========================================================
    // HOD
    // ========================================================

    const hod = getHODStatus(app);

    if (
      hod !== "Waiting" &&
      !isCompleted(hod) &&
      !isRejected(hod)
    ) {
      return "HOD Review";
    }

    if (isCompleted(hod)) {
      return "Dean Review";
    }

    return "HOD Review";
  };

  // ============================================================
  // CURRENT STAGE INDEX
  // ============================================================

  const getCurrentStageIndex = (app) => {
    const final = getFinalStatus(app);

    if (
      isCompleted(final) ||
      isRejected(final)
    ) {
      return 6;
    }

    // ========================================================
    // COMMITTEE
    // ========================================================

    const committee = getCommitteeStatus(app);

    if (isCompleted(committee)) {
      return 6;
    }

    if (
      committee !== "Waiting" &&
      !isCompleted(committee) &&
      !isRejected(committee)
    ) {
      return 5;
    }

    // ========================================================
    // STUDENT EVALUATION
    // ========================================================

    if (
      isStudentEvaluationStageComplete(app)
    ) {
      return 5;
    }

    const student = getStudentStatus(app);

    if (
      student !== "Waiting" &&
      !isCompleted(student) &&
      !isRejected(student)
    ) {
      return 4;
    }

    // ========================================================
    // REVIEWER
    // ========================================================

    const reviewer = getReviewerStatus(app);

    if (
      areAllReviewerAssessmentsComplete(app)
    ) {
      return 4;
    }

    if (isCompleted(reviewer)) {
      return 4;
    }

    if (
      reviewer !== "Waiting" &&
      !isCompleted(reviewer) &&
      !isRejected(reviewer)
    ) {
      return 3;
    }

    // ========================================================
    // DEAN
    // ========================================================

    const dean = getDeanStatus(app);

    if (isCompleted(dean)) {
      return 3;
    }

    if (
      dean !== "Waiting" &&
      !isCompleted(dean) &&
      !isRejected(dean)
    ) {
      return 2;
    }

    // ========================================================
    // HOD
    // ========================================================

    const hod = getHODStatus(app);

    if (isCompleted(hod)) {
      return 2;
    }

    if (
      hod !== "Waiting" &&
      !isCompleted(hod) &&
      !isRejected(hod)
    ) {
      return 1;
    }

    return 1;
  };

  // ============================================================
  // TOTAL POINTS
  // ============================================================

  const getTotalPoints = (app) => {
    const possibleFields = [
      app.total_points,
      app.total_material_points,
      app.total_score,
      app.points,
    ];

    for (const value of possibleFields) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number.toFixed(2);
        }
      }
    }

    return "0.00";
  };

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    return (
      app.employee_name ||
      app.applicant_name ||
      app.employee?.full_name ||
      app.employee?.name ||
      app.employee?.username ||
      app.user?.full_name ||
      app.user?.name ||
      app.user?.username ||
      "Staff Member"
    );
  };

  // ============================================================
  // DOCUMENT URL
  // ============================================================

  const getDocumentUrl = (document) => {
    if (!document) return null;

    if (
      String(document).startsWith("http")
    ) {
      return document;
    }

    return `http://127.0.0.1:8000${document}`;
  };

  // ============================================================
  // CURRENT POSITION
  // ============================================================

  const getCurrentPosition = (app) => {
    return (
      app.current_title_name ||
      app.current_title?.title_name ||
      app.current_position ||
      "N/A"
    );
  };

  // ============================================================
  // TARGET POSITION
  // ============================================================

  const getTargetPosition = (app) => {
    return (
      app.targeted_title_name ||
      app.targeted_title?.title_name ||
      app.target_position ||
      "N/A"
    );
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return "N/A";
    }

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // STAGES
  // ============================================================

  const stages = [
    {
      key: "submitted",
      title: "Submitted",
    },
    {
      key: "hod",
      title: "HOD",
    },
    {
      key: "dean",
      title: "Dean",
    },
    {
      key: "reviewer",
      title: "Reviewer",
    },
    {
      key: "student",
      title: "Student Evaluation",
    },
    {
      key: "committee",
      title: "Committee",
    },
    {
      key: "final",
      title: "Final Decision",
    },
  ];

  // ============================================================
  // STAGE STATUS
  // ============================================================

  const getStageStatus = (app, key) => {
    switch (key) {
      case "submitted":
        return "Submitted";

      case "hod":
        return getHODStatus(app);

      case "dean":
        return getDeanStatus(app);

      case "reviewer":
        return getReviewerStatus(app);

      case "student":
        return getStudentStatus(app);

      case "committee":
        return getCommitteeStatus(app);

      case "final":
        return getFinalStatus(app);

      default:
        return "Waiting";
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
      setError("");

      const token = getToken();

      const res = await api.get(
        `/api/promotion-materials/?application=${application.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = extractArray(res.data);

      setMaterials(data);
    } catch (err) {
      console.error(
        "Failed to load checklist:",
        err.response?.data || err
      );

      setMaterials([]);

      setError(
        "Unable to load the promotion checklist."
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
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>

          <p>
            Loading your promotion records...
          </p>
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
          <h2 style={styles.title}>
            My Promotion Status
          </h2>

          <p style={styles.subtitle}>
            Track your promotion application from
            submission through HOD, Dean, academic
            reviewer, student evaluation, promotion
            committee and final decision.
          </p>
        </div>

        <button
          onClick={fetchMyApplications}
          style={styles.refreshButton}
        >
          ↻ Refresh
        </button>

      </div>

      {/* ERROR */}

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

      {/* STAFF CARD */}

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
              getApplicantName(applications[0] || {})}
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

      {/* LOADING */}

      {(loadingReviews ||
        loadingEvaluations) && (
        <div style={styles.reviewLoading}>
          Checking promotion review and student
          evaluation progress...
        </div>
      )}

      {/* NO APPLICATION */}

      {applications.length === 0 ? (

        <div style={styles.emptyBox}>

          <div style={styles.emptyIcon}>
            📋
          </div>

          <h3>
            No Promotion Submission Found
          </h3>

          <p>
            You have not submitted a promotion
            request yet.
          </p>

        </div>

      ) : (

        <div style={styles.cards}>

          {applications.map((app) => {

            const status =
              getOverallStatus(app);

            const currentStage =
              getCurrentStage(app);

            const currentIndex =
              getCurrentStageIndex(app);

            const reviews =
              getApplicationReviews(app);

            const evaluations =
              getApplicationStudentEvaluations(app);

            const completedReviews =
              reviews.filter(
                isReviewRecordCompleted
              ).length;

            const completedEvaluations =
              evaluations.filter(
                isStudentEvaluationCompleted
              ).length;

            const reviewerComplete =
              areAllReviewerAssessmentsComplete(
                app
              );

            const studentComplete =
              isStudentEvaluationStageComplete(
                app
              );

            return (

              <div
                key={app.id}
                style={styles.applicationCard}
              >

                {/* APPLICATION HEADER */}

                <div style={styles.cardHeader}>

                  <div>

                    <span
                      style={
                        styles.applicationNumber
                      }
                    >
                      PROMOTION APPLICATION #
                      {app.id}
                    </span>

                    <h3
                      style={
                        styles.positionTitle
                      }
                    >
                      {getCurrentPosition(app)}
                      {" → "}
                      {getTargetPosition(app)}
                    </h3>

                    <p
                      style={
                        styles.submittedDate
                      }
                    >
                      Submitted:{" "}
                      {formatDate(
                        app.created_at ||
                          app.submitted_at ||
                          app.application_date
                      )}
                    </p>

                  </div>

                  <span
                    className={getStatusClass(
                      status
                    )}
                  >
                    {status}
                  </span>

                </div>

                {/* SUMMARY */}

                <div
                  style={
                    styles.summaryGrid
                  }
                >

                  <div
                    style={
                      styles.summaryItem
                    }
                  >
                    <span
                      style={
                        styles.summaryLabel
                      }
                    >
                      Current Position
                    </span>

                    <strong>
                      {getCurrentPosition(
                        app
                      )}
                    </strong>
                  </div>

                  <div
                    style={
                      styles.summaryItem
                    }
                  >
                    <span
                      style={
                        styles.summaryLabel
                      }
                    >
                      Position Applied For
                    </span>

                    <strong>
                      {getTargetPosition(
                        app
                      )}
                    </strong>
                  </div>

                  <div
                    style={
                      styles.summaryItem
                    }
                  >
                    <span
                      style={
                        styles.summaryLabel
                      }
                    >
                      Total Score
                    </span>

                    <strong
                      style={styles.points}
                    >
                      {getTotalPoints(app)}
                    </strong>
                  </div>

                  <div
                    style={
                      styles.summaryItem
                    }
                  >
                    <span
                      style={
                        styles.summaryLabel
                      }
                    >
                      Current Stage
                    </span>

                    <strong
                      style={
                        styles.currentStage
                      }
                    >
                      {currentStage}
                    </strong>
                  </div>

                </div>

                {/* ACADEMIC REVIEWER PROGRESS */}

                {reviews.length > 0 && (

                  <div
                    style={
                      reviewerComplete
                        ? styles.reviewerCompleteBox
                        : styles.reviewerProgressBox
                    }
                  >

                    <div>

                      <strong>
                        Academic Reviewer Progress
                      </strong>

                      <p
                        style={
                          styles.reviewerProgressText
                        }
                      >
                        {completedReviews} of{" "}
                        {reviews.length} academic
                        material reviews completed.
                      </p>

                    </div>

                    <span
                      style={
                        reviewerComplete
                          ? styles.completeBadge
                          : styles.progressBadge
                      }
                    >
                      {reviewerComplete
                        ? "✓ Reviewer Completed"
                        : "In Progress"}
                    </span>

                  </div>

                )}

                {/* STUDENT EVALUATION PROGRESS */}

                {evaluations.length > 0 && (

                  <div
                    style={
                      studentComplete
                        ? styles.studentCompleteBox
                        : styles.studentProgressBox
                    }
                  >

                    <div>

                      <strong>
                        Student Evaluation Progress
                      </strong>

                      <p
                        style={
                          styles.reviewerProgressText
                        }
                      >
                        {completedEvaluations} of{" "}
                        {evaluations.length} student
                        evaluations completed.
                      </p>

                    </div>

                    <span
                      style={
                        studentComplete
                          ? styles.completeBadge
                          : styles.progressBadge
                      }
                    >
                      {studentComplete
                        ? "✓ Evaluation Completed"
                        : "In Progress"}
                    </span>

                  </div>

                )}

                {/* APPROVAL PROGRESS */}

                <div
                  style={
                    styles.progressSection
                  }
                >

                  <h4
                    style={
                      styles.progressTitle
                    }
                  >
                    Promotion Approval Progress
                  </h4>

                  <div
                    style={
                      styles.progressContainer
                    }
                  >

                    {stages.map(
                      (stage, index) => {

                        const stageStatus =
                          getStageStatus(
                            app,
                            stage.key
                          );

                        const completed =
                          index < currentIndex ||
                          (
                            index ===
                              currentIndex &&
                            isCompleted(
                              stageStatus
                            )
                          );

                        const active =
                          index ===
                          currentIndex;

                        const rejected =
                          isRejected(
                            stageStatus
                          );

                        return (

                          <div
                            key={stage.key}
                            style={
                              styles.progressItem
                            }
                          >

                            <div
                              style={
                                completed
                                  ? styles.stepCircleCompleted
                                  : rejected
                                  ? styles.stepCircleRejected
                                  : active
                                  ? styles.stepCircleActive
                                  : styles.stepCircle
                              }
                            >

                              {completed
                                ? "✓"
                                : rejected
                                ? "×"
                                : index + 1}

                            </div>

                            <span
                              style={
                                completed
                                  ? styles.stageLabelCompleted
                                  : active
                                  ? styles.stageLabelActive
                                  : styles.stageLabel
                              }
                            >
                              {stage.title}
                            </span>

                            {index <
                              stages.length - 1 && (
                              <div
                                style={
                                  index <
                                  currentIndex
                                    ? styles.progressLineCompleted
                                    : styles.progressLine
                                }
                              />
                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

                {/* STATUS TABLE */}

                <div
                  style={
                    styles.statusSection
                  }
                >

                  <h4
                    style={
                      styles.statusTitle
                    }
                  >
                    Approval Stage Details
                  </h4>

                  <div
                    style={
                      styles.statusTableWrapper
                    }
                  >

                    <table
                      style={
                        styles.statusTable
                      }
                    >

                      <thead>

                        <tr>
                          <th>#</th>
                          <th>
                            Approval Stage
                          </th>
                          <th>
                            Status /
                            Recommendation
                          </th>
                        </tr>

                      </thead>

                      <tbody>

                        {/* SUBMITTED */}

                        <tr>

                          <td>1</td>

                          <td>
                            <strong>
                              Application Submission
                            </strong>

                            <small>
                              Staff application
                            </small>
                          </td>

                          <td>
                            <span className="status approved">
                              Submitted
                            </span>
                          </td>

                        </tr>

                        {/* HOD */}

                        <tr>

                          <td>2</td>

                          <td>
                            <strong>
                              Head of Department
                              (HOD)
                            </strong>

                            <small>
                              Departmental review
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getHODStatus(app)
                              )}
                            >
                              {getHODStatus(app)}
                            </span>
                          </td>

                        </tr>

                        {/* DEAN */}

                        <tr>

                          <td>3</td>

                          <td>
                            <strong>
                              Dean Review
                            </strong>

                            <small>
                              College / Faculty
                              review
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getDeanStatus(app)
                              )}
                            >
                              {getDeanStatus(app)}
                            </span>
                          </td>

                        </tr>

                        {/* REVIEWER */}

                        <tr>

                          <td>4</td>

                          <td>
                            <strong>
                              Academic Reviewer
                            </strong>

                            <small>
                              Independent academic
                              assessment
                            </small>
                          </td>

                          <td>

                            <span
                              className={getStatusClass(
                                getReviewerStatus(
                                  app
                                )
                              )}
                            >
                              {getReviewerStatus(
                                app
                              )}
                            </span>

                            {reviews.length >
                              0 && (
                              <small
                                style={
                                  styles.reviewCount
                                }
                              >
                                {completedReviews}/
                                {reviews.length}{" "}
                                reviews completed
                              </small>
                            )}

                          </td>

                        </tr>

                        {/* STUDENT EVALUATION */}

                        <tr>

                          <td>5</td>

                          <td>
                            <strong>
                              Student Evaluation
                            </strong>

                            <small>
                              Student confidential
                              teaching evaluation
                            </small>
                          </td>

                          <td>

                            <span
                              className={getStatusClass(
                                getStudentStatus(
                                  app
                                )
                              )}
                            >
                              {getStudentStatus(
                                app
                              )}
                            </span>

                            {evaluations.length >
                              0 && (
                              <small
                                style={
                                  styles.reviewCount
                                }
                              >
                                {completedEvaluations}/
                                {evaluations.length}{" "}
                                evaluations completed
                              </small>
                            )}

                          </td>

                        </tr>

                        {/* COMMITTEE */}

                        <tr>

                          <td>6</td>

                          <td>
                            <strong>
                              Promotion Committee
                            </strong>

                            <small>
                              Committee
                              recommendation
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getCommitteeStatus(
                                  app
                                )
                              )}
                            >
                              {getCommitteeStatus(
                                app
                              )}
                            </span>
                          </td>

                        </tr>

                        {/* FINAL */}

                        <tr
                          style={
                            styles.finalRow
                          }
                        >

                          <td>7</td>

                          <td>
                            <strong>
                              Final Decision
                            </strong>

                            <small>
                              Final promotion
                              decision
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getFinalStatus(
                                  app
                                )
                              )}
                            >
                              {getFinalStatus(
                                app
                              )}
                            </span>
                          </td>

                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* ACTIONS */}

                <div style={styles.actions}>

                  <button
                    onClick={() =>
                      viewChecklist(app)
                    }
                    style={
                      styles.checklistButton
                    }
                  >
                    📋 View Promotion Checklist
                  </button>

                  {app.cv && (
                    <a
                      href={getDocumentUrl(
                        app.cv
                      )}
                      target="_blank"
                      rel="noreferrer"
                      style={
                        styles.documentButton
                      }
                    >
                      📄 View CV
                    </a>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* CHECKLIST MODAL */}

      {selectedApplication && (

        <div
          style={
            styles.modalOverlay
          }
        >

          <div style={styles.modal}>

            <div
              style={
                styles.modalHeader
              }
            >

              <div>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Promotion Checklist
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  {getCurrentPosition(
                    selectedApplication
                  )}
                  {" → "}
                  {getTargetPosition(
                    selectedApplication
                  )}
                </p>

              </div>

              <button
                onClick={
                  closeChecklist
                }
                style={
                  styles.modalClose
                }
              >
                ×
              </button>

            </div>

            {loadingMaterials ? (

              <div
                style={
                  styles.modalLoading
                }
              >

                <div
                  style={
                    styles.spinner
                  }
                ></div>

                <p>
                  Loading promotion
                  checklist...
                </p>

              </div>

            ) : materials.length === 0 ? (

              <div
                style={
                  styles.noMaterials
                }
              >
                <p>
                  No promotion materials were
                  found for this submission.
                </p>
              </div>

            ) : (

              <div
                style={
                  styles.modalTableWrapper
                }
              >

                <table
                  style={
                    styles.checklistTable
                  }
                >

                  <thead>

                    <tr>
                      <th>S/No</th>
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
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.points ||
                                  0
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

            <div
              style={
                styles.modalFooter
              }
            >

              <p
                style={
                  styles.footerText
                }
              >
                Your promotion application is
                progressing through the responsible
                approval stages.
              </p>

              <button
                onClick={
                  closeChecklist
                }
                style={
                  styles.closeButton
                }
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
// STATUS CLASS
// ============================================================

const getStatusClass = (status) => {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (!value) {
    return "status pending";
  }

  if (
    value.includes("approved") ||
    value.includes("recommend") ||
    value.includes("accepted") ||
    value.includes("completed") ||
    value.includes("complete") ||
    value.includes("passed") ||
    value.includes("reviewed") ||
    value.includes("evaluated") ||
    value === "submitted"
  ) {
    return "status approved";
  }

  if (
    value.includes("reject") ||
    value.includes("declined") ||
    value.includes("failed") ||
    value.includes("not recommended")
  ) {
    return "status rejected";
  }

  if (
    value.includes("review") ||
    value.includes("pending") ||
    value.includes("waiting") ||
    value.includes("in progress") ||
    value.includes("assigned") ||
    value.includes("draft")
  ) {
    return "status review";
  }

  return "status pending";
};

// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    maxWidth: "1250px",
    margin: "30px auto",
    padding: "0 20px 60px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
  },

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
    marginTop: "8px",
    color: "#6b7280",
    lineHeight: "1.6",
  },

  refreshButton: {
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  staffCard: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1fr",
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

  reviewLoading: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  reviewerProgressBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
  },

  reviewerCompleteBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
  },

  studentProgressBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
  },

  studentCompleteBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
  },

  reviewerProgressText: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  completeBadge: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  progressBadge: {
    background: "#ffedd5",
    color: "#c2410c",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  reviewCount: {
    display: "block",
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "11px",
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
    animation: "spin 1s linear infinite",
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

  submittedDate: {
    color: "#6b7280",
    fontSize: "13px",
    marginTop: "8px",
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

  currentStage: {
    color: "#1d4ed8",
  },

  progressSection: {
    marginTop: "20px",
    padding: "25px 20px",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },

  progressTitle: {
    marginTop: 0,
    marginBottom: "30px",
    color: "#1f2937",
  },

  progressContainer: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    overflowX: "auto",
    paddingBottom: "10px",
  },

  progressItem: {
    display: "flex",
    alignItems: "center",
    minWidth: "120px",
    flex: 1,
  },

  stepCircle: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#e5e7eb",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "2px solid #d1d5db",
  },

  stepCircleActive: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "2px solid #1d4ed8",
  },

  stepCircleCompleted: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "2px solid #15803d",
  },

  stepCircleRejected: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    background: "#dc2626",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    border: "2px solid #b91c1c",
  },

  stageLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    textAlign: "center",
    marginLeft: "6px",
    whiteSpace: "nowrap",
  },

  stageLabelActive: {
    fontSize: "11px",
    color: "#2563eb",
    fontWeight: "700",
    textAlign: "center",
    marginLeft: "6px",
    whiteSpace: "nowrap",
  },

  stageLabelCompleted: {
    fontSize: "11px",
    color: "#15803d",
    fontWeight: "700",
    textAlign: "center",
    marginLeft: "6px",
    whiteSpace: "nowrap",
  },

  progressLine: {
    height: "3px",
    background: "#d1d5db",
    flex: 1,
    margin: "0 8px",
  },

  progressLineCompleted: {
    height: "3px",
    background: "#16a34a",
    flex: 1,
    margin: "0 8px",
  },

  statusSection: {
    marginTop: "25px",
  },

  statusTitle: {
    marginBottom: "15px",
    color: "#1f2937",
  },

  statusTableWrapper: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  statusTable: {
    width: "100%",
    borderCollapse: "collapse",
  },

  finalRow: {
    background: "#f8fafc",
    fontWeight: "600",
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
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

  checklistTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
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