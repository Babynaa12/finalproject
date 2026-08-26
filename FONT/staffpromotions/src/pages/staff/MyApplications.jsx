
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
  // FETCH MY APPLICATIONS
  // ============================================================

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

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

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];

      // --------------------------------------------------------
      // FILTER CURRENT STAFF
      // --------------------------------------------------------

      const myApps = data.filter((app) => {
        return (
          String(app.employee) === String(user?.id) ||
          String(app.employee_id) === String(user?.id) ||
          String(app.user) === String(user?.id) ||
          String(app.user_id) === String(user?.id)
        );
      });

      setApplications(myApps);

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
  // NORMALIZE
  // ============================================================

  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ");
  };

  // ============================================================
  // CHECKLIST
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

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];

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

  const closeChecklist = () => {
    setSelectedApplication(null);
    setMaterials([]);
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const value = normalize(status);

    if (!value) {
      return "status pending";
    }

    if (
      value.includes("approved") ||
      value.includes("recommend") ||
      value.includes("accepted") ||
      value.includes("completed") ||
      value.includes("complete") ||
      value.includes("passed")
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
      value.includes("submitted")
    ) {
      return "status review";
    }

    return "status pending";
  };

  // ============================================================
  // GET VALUE FROM MULTIPLE POSSIBLE FIELDS
  // ============================================================

  const firstValue = (app, fields, defaultValue = "") => {
    for (const field of fields) {
      if (
        app[field] !== undefined &&
        app[field] !== null &&
        app[field] !== ""
      ) {
        return app[field];
      }
    }

    return defaultValue;
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
  // REVIEWER
  // ============================================================

  const getReviewerStatus = (app) => {
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
  // STUDENT EVALUATION
  // ============================================================

  const getStudentStatus = (app) => {
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
    return getFinalStatus(app);
  };

  // ============================================================
  // CHECK WHETHER STAGE IS COMPLETED
  // ============================================================

  const isCompleted = (value) => {
    const status = normalize(value);

    if (!status) return false;

    return (
      status.includes("approved") ||
      status.includes("recommended") ||
      status.includes("accepted") ||
      status.includes("completed") ||
      status.includes("complete") ||
      status.includes("passed")
    );
  };

  // ============================================================
  // CHECK WHETHER STAGE IS REJECTED
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

    const student = getStudentStatus(app);

    if (
      student !== "Waiting" &&
      !isCompleted(student) &&
      !isRejected(student)
    ) {
      return "Student Evaluation";
    }

    if (isCompleted(student)) {
      return "Promotion Committee";
    }

    const reviewer = getReviewerStatus(app);

    if (
      reviewer !== "Waiting" &&
      !isCompleted(reviewer) &&
      !isRejected(reviewer)
    ) {
      return "Reviewer Assessment";
    }

    if (isCompleted(reviewer)) {
      return "Student Evaluation";
    }

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
        return Number(value).toFixed(2);
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

    if (document.startsWith("http")) {
      return document;
    }

    return `http://127.0.0.1:8000${document}`;
  };

  // ============================================================
  // POSITION
  // ============================================================

  const getCurrentPosition = (app) => {
    return (
      app.current_title_name ||
      app.current_title?.title_name ||
      app.current_position ||
      "N/A"
    );
  };

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

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // PROGRESS STAGE
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
  // STAGE INDEX
  // ============================================================

  const getCurrentStageIndex = (app) => {
    const final = getFinalStatus(app);

    if (isCompleted(final) || isRejected(final)) {
      return 6;
    }

    const committee = getCommitteeStatus(app);

    if (isCompleted(committee)) {
      return 6;
    }

    if (committee !== "Waiting") {
      return 5;
    }

    const student = getStudentStatus(app);

    if (isCompleted(student)) {
      return 5;
    }

    if (student !== "Waiting") {
      return 4;
    }

    const reviewer = getReviewerStatus(app);

    if (isCompleted(reviewer)) {
      return 4;
    }

    if (reviewer !== "Waiting") {
      return 3;
    }

    const dean = getDeanStatus(app);

    if (isCompleted(dean)) {
      return 3;
    }

    if (dean !== "Waiting") {
      return 2;
    }

    const hod = getHODStatus(app);

    if (isCompleted(hod)) {
      return 2;
    }

    if (hod !== "Waiting") {
      return 1;
    }

    return 1;
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
            Track your promotion application from submission
            through HOD, Dean, reviewers, student evaluation,
            promotion committee and final decision.
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

      {/* STAFF */}

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
            You have not submitted a promotion request yet.
          </p>

        </div>

      ) : (

        <div style={styles.cards}>

          {applications.map((app) => {

            const status = getOverallStatus(app);
            const currentStage = getCurrentStage(app);
            const currentIndex = getCurrentStageIndex(app);

            return (

              <div
                key={app.id}
                style={styles.applicationCard}
              >

                {/* APPLICATION HEADER */}

                <div style={styles.cardHeader}>

                  <div>

                    <span style={styles.applicationNumber}>
                      PROMOTION APPLICATION #{app.id}
                    </span>

                    <h3 style={styles.positionTitle}>
                      {getCurrentPosition(app)}
                      {" → "}
                      {getTargetPosition(app)}
                    </h3>

                    <p style={styles.submittedDate}>
                      Submitted:{" "}
                      {formatDate(
                        app.created_at ||
                        app.submitted_at ||
                        app.application_date
                      )}
                    </p>

                  </div>

                  <span className={getStatusClass(status)}>
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
                      {getCurrentPosition(app)}
                    </strong>
                  </div>

                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>
                      Position Applied For
                    </span>

                    <strong>
                      {getTargetPosition(app)}
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

                    <strong style={styles.currentStage}>
                      {currentStage}
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

                  <div style={styles.progressContainer}>

                    {stages.map((stage, index) => {

                      const stageStatus =
                        getStageStatus(app, stage.key);

                      const completed =
                        index < currentIndex ||
                        (
                          index === currentIndex &&
                          isCompleted(stageStatus)
                        );

                      const active =
                        index === currentIndex;

                      const rejected =
                        isRejected(stageStatus);

                      return (

                        <div
                          key={stage.key}
                          style={styles.progressItem}
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

                          {index < stages.length - 1 && (
                            <div
                              style={
                                index < currentIndex
                                  ? styles.progressLineCompleted
                                  : styles.progressLine
                              }
                            />
                          )}

                        </div>

                      );
                    })}

                  </div>

                </div>

                {/* ==================================================
                    APPROVAL STATUS TABLE
                ================================================== */}

                <div style={styles.statusSection}>

                  <h4 style={styles.statusTitle}>
                    Approval Stage Details
                  </h4>

                  <div style={styles.statusTableWrapper}>

                    <table style={styles.statusTable}>

                      <thead>

                        <tr>
                          <th>#</th>
                          <th>Approval Stage</th>
                          <th>Status / Recommendation</th>
                        </tr>

                      </thead>

                      <tbody>

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
                              Head of Department (HOD)
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
                              College / Faculty review
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
                              Independent academic assessment
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getReviewerStatus(app)
                              )}
                            >
                              {getReviewerStatus(app)}
                            </span>
                          </td>
                        </tr>

                        {/* STUDENT */}

                        <tr>
                          <td>5</td>

                          <td>
                            <strong>
                              Student Evaluation
                            </strong>

                            <small>
                              Student confidential teaching evaluation
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getStudentStatus(app)
                              )}
                            >
                              {getStudentStatus(app)}
                            </span>
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
                              Committee recommendation
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getCommitteeStatus(app)
                              )}
                            >
                              {getCommitteeStatus(app)}
                            </span>
                          </td>
                        </tr>

                        {/* FINAL */}

                        <tr style={styles.finalRow}>
                          <td>7</td>

                          <td>
                            <strong>
                              Final Decision
                            </strong>

                            <small>
                              Final promotion decision
                            </small>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                getFinalStatus(app)
                              )}
                            >
                              {getFinalStatus(app)}
                            </span>
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div style={styles.actions}>

                  <button
                    onClick={() => viewChecklist(app)}
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
      )}

      {/* ======================================================
          CHECKLIST MODAL
      ====================================================== */}

      {selectedApplication && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  Promotion Checklist
                </h2>

                <p style={styles.modalSubtitle}>
                  {getCurrentPosition(selectedApplication)}
                  {" → "}
                  {getTargetPosition(selectedApplication)}
                </p>

              </div>

              <button
                onClick={closeChecklist}
                style={styles.modalClose}
              >
                ×
              </button>

            </div>

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

                      <th>S/No</th>

                      <th>Promotion Material</th>

                      <th>Score / Points</th>

                      <th>Supporting Document</th>

                      <th>Review Status</th>

                    </tr>

                  </thead>

                  <tbody>

                    {materials.map((material, index) => (

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
                            {material.points ?? "0"}
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
                              style={styles.viewDocument}
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

                    ))}

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

            <div style={styles.modalFooter}>

              <p style={styles.footerText}>
                Your promotion application is progressing
                through the responsible approval stages.
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
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
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
    boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
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

