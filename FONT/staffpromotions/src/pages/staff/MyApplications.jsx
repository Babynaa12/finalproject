import { useEffect, useState } from "react";
import api from "../../services/api";

function MyApplications() {
  // ============================================================
  // CURRENT LOGGED-IN USER
  // ============================================================

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");

      if (!stored) {
        return {};
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to read logged-in user:", error);
      return {};
    }
  };

  const user = getStoredUser();

  // ============================================================
  // STATES
  // ============================================================

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
    if (!obj) {
      return defaultValue;
    }

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
  // CURRENT USER IDENTIFIERS
  // ============================================================

  const getCurrentUserIdentifiers = () => {
    const identifiers = {
      ids: [],
      usernames: [],
      emails: [],
      names: [],
    };

    const add = (array, value) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        const normalized = String(value).trim().toLowerCase();

        if (!array.includes(normalized)) {
          array.push(normalized);
        }
      }
    };

    // IDs
    add(identifiers.ids, user?.id);
    add(identifiers.ids, user?.user_id);
    add(identifiers.ids, user?.employee_id);

    // Username
    add(identifiers.usernames, user?.username);
    add(identifiers.usernames, user?.user_name);

    // Email
    add(identifiers.emails, user?.email);
    add(identifiers.emails, user?.employee_email);

    // Names
    add(identifiers.names, user?.full_name);
    add(identifiers.names, user?.name);

    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";

    const fullName = `${firstName} ${lastName}`.trim();

    add(identifiers.names, fullName);

    return identifiers;
  };

  // ============================================================
  // EMPLOYEE OBJECT
  // ============================================================

  const getEmployeeObject = (app) => {
    if (!app) {
      return null;
    }

    if (
      app.employee &&
      typeof app.employee === "object"
    ) {
      return app.employee;
    }

    if (
      app.user &&
      typeof app.user === "object"
    ) {
      return app.user;
    }

    if (
      app.applicant &&
      typeof app.applicant === "object"
    ) {
      return app.applicant;
    }

    return null;
  };

  // ============================================================
  // APPLICATION EMPLOYEE ID
  // ============================================================

  const getApplicationEmployeeId = (app) => {
    const employee = getEmployeeObject(app);

    const value = firstValue(
      app,
      [
        "employee_id",
        "user_id",
        "applicant_id",
        "staff_id",
      ],
      null
    );

    if (value !== null) {
      return String(value).trim().toLowerCase();
    }

    if (employee) {
      const nestedId = firstValue(
        employee,
        [
          "id",
          "user_id",
          "employee_id",
        ],
        null
      );

      if (nestedId !== null) {
        return String(nestedId)
          .trim()
          .toLowerCase();
      }
    }

    if (
      app.employee !== undefined &&
      app.employee !== null &&
      typeof app.employee !== "object"
    ) {
      return String(app.employee)
        .trim()
        .toLowerCase();
    }

    return null;
  };

  // ============================================================
  // APPLICATION USERNAME
  // ============================================================

  const getApplicationUsername = (app) => {
    const employee = getEmployeeObject(app);

    return normalize(
      firstValue(
        app,
        [
          "employee_username",
          "username",
          "user_username",
          "applicant_username",
        ],
        employee
          ? firstValue(
              employee,
              ["username", "user_name"],
              ""
            )
          : ""
      )
    );
  };

  // ============================================================
  // APPLICATION EMAIL
  // ============================================================

  const getApplicationEmail = (app) => {
    const employee = getEmployeeObject(app);

    return normalize(
      firstValue(
        app,
        [
          "employee_email",
          "email",
          "user_email",
          "applicant_email",
        ],
        employee
          ? firstValue(employee, ["email"], "")
          : ""
      )
    );
  };

  // ============================================================
  // APPLICATION NAME
  // ============================================================

  const getApplicationEmployeeName = (app) => {
    const employee = getEmployeeObject(app);

    if (app?.employee_name) {
      return normalize(app.employee_name);
    }

    if (app?.applicant_name) {
      return normalize(app.applicant_name);
    }

    if (employee) {
      const fullName =
        `${employee.first_name || ""} ${
          employee.last_name || ""
        }`.trim();

      if (fullName) {
        return normalize(fullName);
      }

      return normalize(
        employee.full_name ||
          employee.name ||
          ""
      );
    }

    return "";
  };

  // ============================================================
  // CHECK APPLICATION OWNER
  // ============================================================

  const isMyApplication = (app) => {
    const identifiers =
      getCurrentUserIdentifiers();

    const applicationEmployeeId =
      getApplicationEmployeeId(app);

    const applicationUsername =
      getApplicationUsername(app);

    const applicationEmail =
      getApplicationEmail(app);

    const applicationName =
      getApplicationEmployeeName(app);

    // ID
    if (
      applicationEmployeeId &&
      identifiers.ids.includes(
        applicationEmployeeId
      )
    ) {
      return true;
    }

    // Username
    if (
      applicationUsername &&
      identifiers.usernames.includes(
        applicationUsername
      )
    ) {
      return true;
    }

    // Email
    if (
      applicationEmail &&
      identifiers.emails.includes(
        applicationEmail
      )
    ) {
      return true;
    }

    // Name
    if (
      applicationName &&
      identifiers.names.includes(
        applicationName
      )
    ) {
      return true;
    }

    return false;
  };

  // ============================================================
  // FETCH APPLICATIONS
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
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      if (
        !user?.id &&
        !user?.user_id &&
        !user?.username &&
        !user?.email
      ) {
        setError(
          "Current user information was not found. Please login again."
        );
        return;
      }

      const res = await api.get(
        "/api/applications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = extractArray(res.data);

      const myApps = data.filter(
        isMyApplication
      );

      setApplications(myApps);

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
  // ACADEMIC REVIEWS
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

            reviewMap[app.id] =
              extractArray(res.data);
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
    } finally {
      setLoadingReviews(false);
    }
  };

  // ============================================================
  // STUDENT EVALUATIONS
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

            evaluationMap[app.id] =
              extractArray(res.data);
          } catch (err) {
            console.error(
              `Failed to fetch student evaluations for application ${app.id}:`,
              err.response?.data || err
            );

            evaluationMap[app.id] = [];
          }
        })
      );

      setStudentEvaluations(
        evaluationMap
      );
    } finally {
      setLoadingEvaluations(false);
    }
  };

  // ============================================================
  // GET REVIEWS
  // ============================================================

  const getApplicationReviews = (app) => {
    return academicReviews[app.id] || [];
  };

  // ============================================================
  // GET STUDENT EVALUATIONS
  // ============================================================

  const getApplicationStudentEvaluations = (
    app
  ) => {
    return studentEvaluations[app.id] || [];
  };

  // ============================================================
  // CHECK REVIEW COMPLETION
  // ============================================================

  const isReviewRecordCompleted = (
    review
  ) => {
    if (!review) {
      return false;
    }

    // Explicit boolean completion fields
    if (
      review.completed === true ||
      review.is_completed === true ||
      review.review_completed === true ||
      review.is_reviewed === true
    ) {
      return true;
    }

    const statusFields = [
      review.status,
      review.review_status,
      review.reviewer_status,
      review.decision,
      review.recommendation,
      review.review_decision,
      review.assessment_status,
    ];

    const value = statusFields.find(
      (item) =>
        item !== undefined &&
        item !== null &&
        String(item).trim() !== ""
    );

    if (value !== undefined) {
      const status = normalize(value);

      // Explicit incomplete values
      if (
        status.includes("pending") ||
        status.includes("waiting") ||
        status.includes("assigned") ||
        status.includes("in progress") ||
        status.includes("not reviewed") ||
        status.includes("not started") ||
        status.includes("draft")
      ) {
        return false;
      }

      // Explicit rejected values are not completed
      if (
        status.includes("rejected") ||
        status.includes("not recommended") ||
        status.includes("declined")
      ) {
        return false;
      }

      if (
        status.includes("complete") ||
        status === "approved" ||
        status === "recommend" ||
        status === "recommended" ||
        status === "accepted" ||
        status === "submitted" ||
        status === "reviewed" ||
        status === "passed" ||
        status === "evaluated"
      ) {
        return true;
      }
    }

    // Score can indicate a completed assessment
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

    if (hasScore) {
      return true;
    }

    // Comment can indicate completed review
    const hasComment =
      review.comment ||
      review.comments ||
      review.remarks ||
      review.reviewer_comment ||
      review.assessment_comment;

    if (hasComment) {
      return true;
    }

    return false;
  };

  // ============================================================
  // ALL REVIEWER ASSESSMENTS COMPLETE
  // ============================================================

  const areAllReviewerAssessmentsComplete = (
    app
  ) => {
    const reviews =
      getApplicationReviews(app);

    if (!reviews.length) {
      return false;
    }

    return reviews.every(
      isReviewRecordCompleted
    );
  };

  // ============================================================
  // REVIEWER STATUS
  // ============================================================

  const getReviewerStatus = (app) => {
    const reviews =
      getApplicationReviews(app);

    if (reviews.length > 0) {
      const completedReviews =
        reviews.filter(
          isReviewRecordCompleted
        ).length;

      if (
        completedReviews ===
        reviews.length
      ) {
        return "Completed";
      }

      return `In Progress (${completedReviews}/${reviews.length})`;
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
  // STUDENT EVALUATION COMPLETION
  // ============================================================

  const isStudentEvaluationCompleted = (
    evaluation
  ) => {
    if (!evaluation) {
      return false;
    }

    // Explicit booleans
    if (
      evaluation.completed === true ||
      evaluation.is_completed === true ||
      evaluation.evaluation_completed === true ||
      evaluation.is_submitted === true ||
      evaluation.submitted === true ||
      evaluation.submission_complete === true
    ) {
      return true;
    }

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
      const status =
        normalize(statusValue);

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

      if (
        status.includes("rejected") ||
        status.includes("failed")
      ) {
        return false;
      }

      if (
        status.includes("complete") ||
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

    // Completion date
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

    // Score
    const scoreFields = [
      evaluation.score,
      evaluation.total_score,
      evaluation.total_points,
      evaluation.mark,
      evaluation.rating,
      evaluation.average_score,
      evaluation.percentage,
    ];

    if (
      scoreFields.some(
        (value) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    ) {
      return true;
    }

    // Answers
    const answerFields = [
      evaluation.answers,
      evaluation.responses,
      evaluation.ratings,
      evaluation.questions,
      evaluation.feedback,
    ];

    return answerFields.some((value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === "object") {
        return (
          Object.keys(value).length > 0
        );
      }

      return String(value).trim() !== "";
    });
  };

  // ============================================================
  // ALL STUDENT EVALUATIONS COMPLETE
  // ============================================================

  const isStudentEvaluationStageComplete = (
    app
  ) => {
    const evaluations =
      getApplicationStudentEvaluations(
        app
      );

    if (!evaluations.length) {
      return false;
    }

    return evaluations.every(
      isStudentEvaluationCompleted
    );
  };

  // ============================================================
  // STUDENT STATUS
  // ============================================================

  const getStudentStatus = (app) => {
    const evaluations =
      getApplicationStudentEvaluations(
        app
      );

    if (evaluations.length > 0) {
      const completed =
        evaluations.filter(
          isStudentEvaluationCompleted
        ).length;

      if (
        completed === evaluations.length
      ) {
        return "Completed";
      }

      return `In Progress (${completed}/${evaluations.length})`;
    }

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
  // HOD STATUS
  // ============================================================

  const getHODStatus = (app) => {
    return firstValue(
      app,
      [
        "hod_recommendation",
        "hod_status",
        "hod_review_status",
        "hod_decision",
        "head_of_department_status",
        "head_of_department_recommendation",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // DEAN STATUS
  // ============================================================

  const getDeanStatus = (app) => {
    return firstValue(
      app,
      [
        "dean_recommendation",
        "dean_status",
        "dean_review_status",
        "dean_decision",
        "status",
      ],
      "Waiting"
    );
  };

  // ============================================================
  // COMMITTEE STATUS
  // ============================================================

  const getCommitteeStatus = (app) => {
    return firstValue(
      app,
      [
        "committee_recommendation",
        "committee_status",
        "committee_decision",
        "promotion_committee_status",
        "promotion_committee_recommendation",
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
        "application_status",
        "approval_status",
        "decision",
      ],
      "Pending"
    );
  };

  // ============================================================
  // STATUS HELPERS
  // ============================================================

  const isRejected = (value) => {
    const status = normalize(value);

    if (!status) {
      return false;
    }

    return (
      status.includes("rejected") ||
      status.includes("reject") ||
      status.includes("declined") ||
      status.includes("failed") ||
      status.includes("not recommended") ||
      status.includes("not approved")
    );
  };

  const isCompleted = (value) => {
    const status = normalize(value);

    if (!status) {
      return false;
    }

    // These ALWAYS mean incomplete
    if (
      status.includes("pending") ||
      status.includes("waiting") ||
      status.includes("assigned") ||
      status.includes("in progress") ||
      status.includes("draft") ||
      status.includes("not started") ||
      status.includes("not reviewed") ||
      status.includes("not evaluated") ||
      status.includes("rejected") ||
      status.includes("not recommended") ||
      status.includes("not approved") ||
      status.includes("declined") ||
      status.includes("failed")
    ) {
      return false;
    }

    return (
      status === "approved" ||
      status === "recommended" ||
      status === "recommend" ||
      status === "accepted" ||
      status === "completed" ||
      status === "complete" ||
      status === "passed" ||
      status === "reviewed" ||
      status === "evaluated" ||
      status === "submitted" ||
      status.includes("approved") ||
      status.includes("recommended") ||
      status.includes("accepted") ||
      status.includes("completed") ||
      status.includes("complete") ||
      status.includes("passed") ||
      status.includes("reviewed") ||
      status.includes("evaluated")
    );
  };

  // ============================================================
  // STAGE OBJECTS
  // ============================================================

  const getStageStates = (app) => {
    const hodStatus =
      getHODStatus(app);

    const deanStatus =
      getDeanStatus(app);

    const reviewerComplete =
      areAllReviewerAssessmentsComplete(
        app
      );

    const studentComplete =
      isStudentEvaluationStageComplete(
        app
      );

    const committeeStatus =
      getCommitteeStatus(app);

    const finalStatus =
      getFinalStatus(app);

    return {
      submitted: {
        completed: true,
        rejected: false,
        status: "Submitted",
      },

      hod: {
        completed: isCompleted(
          hodStatus
        ),
        rejected: isRejected(
          hodStatus
        ),
        status: hodStatus,
      },

      dean: {
        completed: isCompleted(
          deanStatus
        ),
        rejected: isRejected(
          deanStatus
        ),
        status: deanStatus,
      },

      reviewer: {
        completed: reviewerComplete,
        rejected: false,
        status: getReviewerStatus(
          app
        ),
      },

      student: {
        completed: studentComplete,
        rejected: false,
        status: getStudentStatus(
          app
        ),
      },

      committee: {
        completed: isCompleted(
          committeeStatus
        ),
        rejected: isRejected(
          committeeStatus
        ),
        status: committeeStatus,
      },

      final: {
        completed: isCompleted(
          finalStatus
        ),
        rejected: isRejected(
          finalStatus
        ),
        status: finalStatus,
      },
    };
  };

  // ============================================================
  // CURRENT STAGE
  // ============================================================

  const getCurrentStage = (app) => {
    const stages =
      getStageStates(app);

    // Final decision first
    if (stages.final.rejected) {
      return "Promotion Rejected";
    }

    if (stages.final.completed) {
      return "Promotion Approved";
    }

    // HOD
    if (stages.hod.rejected) {
      return "HOD Review - Rejected";
    }

    if (!stages.hod.completed) {
      return "HOD Review";
    }

    // Dean
    if (stages.dean.rejected) {
      return "Dean Review - Rejected";
    }

    if (!stages.dean.completed) {
      return "Dean Review";
    }

    // Reviewer
    if (!stages.reviewer.completed) {
      return "Reviewer Assessment";
    }

    // Student evaluation
    if (!stages.student.completed) {
      return "Student Evaluation";
    }

    // Committee
    if (stages.committee.rejected) {
      return "Promotion Committee - Rejected";
    }

    if (!stages.committee.completed) {
      return "Promotion Committee";
    }

    // Final decision
    return "Final Decision";
  };

  // ============================================================
  // CURRENT STAGE INDEX
  //
  // 0 = Submitted
  // 1 = HOD
  // 2 = Dean
  // 3 = Reviewer
  // 4 = Student
  // 5 = Committee
  // 6 = Final
  // ============================================================

  const getCurrentStageIndex = (app) => {
    const stages =
      getStageStates(app);

    // Final result
    if (
      stages.final.completed ||
      stages.final.rejected
    ) {
      return 6;
    }

    // HOD
    if (
      !stages.hod.completed ||
      stages.hod.rejected
    ) {
      return 1;
    }

    // Dean
    if (
      !stages.dean.completed ||
      stages.dean.rejected
    ) {
      return 2;
    }

    // Reviewer
    if (!stages.reviewer.completed) {
      return 3;
    }

    // Student
    if (!stages.student.completed) {
      return 4;
    }

    // Committee
    if (
      !stages.committee.completed ||
      stages.committee.rejected
    ) {
      return 5;
    }

    // Final
    return 6;
  };

  // ============================================================
  // OVERALL STATUS
  // ============================================================

  const getOverallStatus = (app) => {
    const finalStatus =
      getFinalStatus(app);

    if (isRejected(finalStatus)) {
      return finalStatus;
    }

    if (isCompleted(finalStatus)) {
      return finalStatus;
    }

    return "In Progress";
  };

  // ============================================================
  // TOTAL SCORE
  // ============================================================

  const getTotalPoints = (app) => {
    const possibleFields = [
      app.total_points,
      app.total_material_points,
      app.total_score,
      app.points,
      app.score,
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

    // If application itself doesn't have a score,
    // calculate from loaded promotion materials.
    const appMaterials =
      materials.filter(
        (item) =>
          String(
            item.application
          ) === String(app.id)
      );

    if (appMaterials.length > 0) {
      const total =
        appMaterials.reduce(
          (sum, item) =>
            sum + Number(item.points || 0),
          0
        );

      return total.toFixed(2);
    }

    return "0.00";
  };

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    const employee =
      getEmployeeObject(app);

    return (
      app.employee_name ||
      app.applicant_name ||
      employee?.full_name ||
      employee?.name ||
      employee?.username ||
      "Staff Member"
    );
  };

  // ============================================================
  // DOCUMENT URL
  // ============================================================

  const getDocumentUrl = (document) => {
    if (!document) {
      return null;
    }

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
      app.current_title ||
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
      app.target_title ||
      "N/A"
    );
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
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

  const getStageStatus = (
    app,
    key
  ) => {
    const states =
      getStageStates(app);

    return (
      states[key]?.status ||
      "Waiting"
    );
  };

  // ============================================================
  // VIEW CHECKLIST
  // ============================================================

  const viewChecklist = async (
    application
  ) => {
    try {
      setSelectedApplication(
        application
      );

      setLoadingMaterials(true);

      setMaterials([]);

      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found."
        );
        return;
      }

      const res = await api.get(
        `/api/promotion-materials/?application=${application.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMaterials(
        extractArray(res.data)
      );
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
            Loading your promotion
            records...
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

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            My Promotion Status
          </h2>

          <p style={styles.subtitle}>
            Track your promotion
            application from submission
            through HOD, Dean, academic
            reviewer, student evaluation,
            promotion committee and final
            decision.
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
      ======================================================= */}

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
          STAFF CARD
      ======================================================= */}

      <div style={styles.staffCard}>
        <div>
          <span
            style={styles.smallLabel}
          >
            STAFF MEMBER
          </span>

          <h3
            style={styles.staffName}
          >
            {user?.full_name ||
              user?.name ||
              `${user?.first_name || ""} ${
                user?.last_name || ""
              }`.trim() ||
              getApplicantName(
                applications[0] || {}
              )}
          </h3>
        </div>

        <div>
          <span
            style={styles.smallLabel}
          >
            EMAIL
          </span>

          <p style={styles.staffValue}>
            {user?.email || "N/A"}
          </p>
        </div>

        <div>
          <span
            style={styles.smallLabel}
          >
            ROLE
          </span>

          <p style={styles.staffValue}>
            {user?.role || "Staff"}
          </p>
        </div>
      </div>

      {/* ======================================================
          REVIEW LOADING
      ======================================================= */}

      {(loadingReviews ||
        loadingEvaluations) && (
        <div
          style={
            styles.reviewLoading
          }
        >
          Checking promotion review
          and student evaluation
          progress...
        </div>
      )}

      {/* ======================================================
          NO APPLICATION
      ======================================================= */}

      {applications.length === 0 ? (
        <div style={styles.emptyBox}>
          <div
            style={styles.emptyIcon}
          >
            📋
          </div>

          <h3>
            No Promotion Submission
            Found
          </h3>

          <p>
            You have not submitted a
            promotion request yet.
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

            const states =
              getStageStates(app);

            const reviews =
              getApplicationReviews(app);

            const evaluations =
              getApplicationStudentEvaluations(
                app
              );

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
                style={
                  styles.applicationCard
                }
              >

                {/* ==================================================
                    APPLICATION HEADER
                =================================================== */}

                <div
                  style={styles.cardHeader}
                >
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
                      {getCurrentPosition(
                        app
                      )}

                      {" → "}

                      {getTargetPosition(
                        app
                      )}
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

                {/* ==================================================
                    SUMMARY
                =================================================== */}

                <div
                  style={styles.summaryGrid}
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

                {/* ==================================================
                    ACADEMIC REVIEWER PROGRESS
                =================================================== */}

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
                        Academic Reviewer
                        Progress
                      </strong>

                      <p
                        style={
                          styles.reviewerProgressText
                        }
                      >
                        {completedReviews}{" "}
                        of{" "}
                        {reviews.length}{" "}
                        academic material
                        reviews completed.
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

                {/* ==================================================
                    STUDENT EVALUATION
                =================================================== */}

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
                        Student Evaluation
                        Progress
                      </strong>

                      <p
                        style={
                          styles.reviewerProgressText
                        }
                      >
                        {completedEvaluations}{" "}
                        of{" "}
                        {evaluations.length}{" "}
                        student evaluations
                        completed.
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

                {/* ==================================================
                    APPROVAL PROGRESS
                =================================================== */}

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
                    Promotion Approval
                    Progress
                  </h4>

                  <div
                    style={
                      styles.progressContainer
                    }
                  >
                    {stages.map(
                      (stage, index) => {
                        const stageState =
                          states[
                            stage.key
                          ];

                        const completed =
                          stageState?.completed ===
                            true &&
                          !stageState?.rejected;

                        const rejected =
                          stageState?.rejected ===
                          true;

                        const active =
                          index ===
                          currentIndex;

                        return (
                          <div
                            key={
                              stage.key
                            }
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
                                  : rejected
                                  ? styles.stageLabelRejected
                                  : active
                                  ? styles.stageLabelActive
                                  : styles.stageLabel
                              }
                            >
                              {
                                stage.title
                              }
                            </span>

                            {index <
                              stages.length -
                                1 && (
                              <div
                                style={
                                  completed
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

                {/* ==================================================
                    STATUS TABLE
                =================================================== */}

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
                          <th
                            style={
                              styles.th
                            }
                          >
                            #
                          </th>

                          <th
                            style={
                              styles.th
                            }
                          >
                            Approval Stage
                          </th>

                          <th
                            style={
                              styles.th
                            }
                          >
                            Status /
                            Recommendation
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {/* SUBMISSION */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            1
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Application
                              Submission
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Staff application
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span className="status approved">
                              Submitted
                            </span>
                          </td>
                        </tr>

                        {/* HOD */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            2
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Head of
                              Department
                              (HOD)
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Departmental
                              review
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              className={getStatusClass(
                                getHODStatus(
                                  app
                                )
                              )}
                            >
                              {getHODStatus(
                                app
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* DEAN */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            3
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Dean Review
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              College /
                              Faculty review
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              className={getStatusClass(
                                getDeanStatus(
                                  app
                                )
                              )}
                            >
                              {getDeanStatus(
                                app
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* REVIEWER */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            4
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Academic
                              Reviewer
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Independent
                              academic
                              assessment
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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
                                {
                                  completedReviews
                                }
                                /
                                {
                                  reviews.length
                                }{" "}
                                reviews
                                completed
                              </small>
                            )}
                          </td>
                        </tr>

                        {/* STUDENT */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            5
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Student
                              Evaluation
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Student
                              confidential
                              teaching
                              evaluation
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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
                                {
                                  completedEvaluations
                                }
                                /
                                {
                                  evaluations.length
                                }{" "}
                                evaluations
                                completed
                              </small>
                            )}
                          </td>
                        </tr>

                        {/* COMMITTEE */}

                        <tr>
                          <td
                            style={
                              styles.td
                            }
                          >
                            6
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Promotion
                              Committee
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Committee
                              recommendation
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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
                          <td
                            style={
                              styles.td
                            }
                          >
                            7
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              Final Decision
                            </strong>

                            <small
                              style={
                                styles.rowDescription
                              }
                            >
                              Final promotion
                              decision
                            </small>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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

                {/* ==================================================
                    ACTIONS
                =================================================== */}

                <div
                  style={styles.actions}
                >
                  <button
                    onClick={() =>
                      viewChecklist(app)
                    }
                    style={
                      styles.checklistButton
                    }
                  >
                    📋 View Promotion
                    Checklist
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

      {/* ========================================================
          CHECKLIST MODAL
      ========================================================= */}

      {selectedApplication && (
        <div
          style={
            styles.modalOverlay
          }
        >
          <div style={styles.modal}>

            {/* MODAL HEADER */}

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

            {/* MODAL CONTENT */}

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
            ) : materials.length ===
              0 ? (
              <div
                style={
                  styles.noMaterials
                }
              >
                <p>
                  No promotion
                  materials were found
                  for this submission.
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
                      <th
                        style={
                          styles.th
                        }
                      >
                        S/No
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Promotion Material
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Score / Points
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Supporting Document
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Review Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {materials.map(
                      (
                        material,
                        index
                      ) => (
                        <tr
                          key={
                            material.id ||
                            index
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            {index + 1}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {material.material_type_display ||
                              material.material_type ||
                              material.title ||
                              "Promotion Material"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              {material.points ??
                                "0"}
                            </strong>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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

                          <td
                            style={
                              styles.td
                            }
                          >
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

                      <td
                        colSpan="2"
                      ></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* MODAL FOOTER */}

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
                Your promotion
                application is
                progressing through the
                responsible approval
                stages.
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

const getStatusClass = (
  status
) => {
  const value = String(
    status ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (!value) {
    return "status pending";
  }

  // REJECTED
  if (
    value.includes("reject") ||
    value.includes("declined") ||
    value.includes("failed") ||
    value.includes("not recommended") ||
    value.includes("not approved")
  ) {
    return "status rejected";
  }

  // WAITING / PROCESSING
  if (
    value.includes("review") ||
    value.includes("pending") ||
    value.includes("waiting") ||
    value.includes("in progress") ||
    value.includes("assigned") ||
    value.includes("draft") ||
    value.includes("not started") ||
    value.includes("not reviewed")
  ) {
    return "status review";
  }

  // COMPLETED
  if (
    value.includes("approved") ||
    value === "recommend" ||
    value.includes("recommended") ||
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
    fontFamily:
      "Arial, Helvetica, sans-serif",
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
    borderTop:
      "4px solid #2563eb",
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
    alignItems: "center",
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

  stageLabelRejected: {
    fontSize: "11px",
    color: "#dc2626",
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
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  },

  statusTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },

  th: {
    padding: "13px 14px",
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  td: {
    padding: "14px",
    border: "1px solid #d1d5db",
    verticalAlign: "top",
    fontSize: "13px",
  },

  rowDescription: {
    display: "block",
    marginTop: "4px",
    color: "#6b7280",
    fontSize: "11px",
  },

  finalRow: {
    background: "#f8fafc",
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
    borderBottom:
      "1px solid #e5e7eb",
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
    border: "1px solid #d1d5db",
  },

  totalValue: {
    padding: "14px",
    fontWeight: "bold",
    color: "#2563eb",
    background: "#eff6ff",
    border: "1px solid #d1d5db",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "20px 25px",
    borderTop:
      "1px solid #e5e7eb",
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