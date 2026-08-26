import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function MyApplications() {
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data:", error);
  }

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
  // USER IDENTIFIERS
  // ============================================================

  const getUserIds = () => {
    const ids = [];

    const values = [
      user?.id,
      user?.user_id,
      user?.employee_id,
      user?.employee?.id,
      user?.employee?.employee_id,
      user?.profile?.id,
      user?.profile?.employee_id,
    ];

    values.forEach((value) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        ids.push(String(value));
      }
    });

    return [...new Set(ids)];
  };

  // ============================================================
  // NORMALIZE
  // ============================================================

  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/-/g, " ");
  };

  // ============================================================
  // APPLICATION EMPLOYEE IDS
  // ============================================================

  const getApplicationEmployeeIds = (app) => {
    const ids = [];

    const employee = app?.employee;

    const values = [
      app?.employee_id,
      app?.employee,
      app?.user,
      app?.user_id,
      app?.applicant_id,

      employee?.id,
      employee?.employee_id,
      employee?.user_id,
      employee?.user,

      employee?.profile?.id,
      employee?.profile?.user_id,
    ];

    values.forEach((value) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        typeof value !== "object"
      ) {
        ids.push(String(value));
      }
    });

    return [...new Set(ids)];
  };

  // ============================================================
  // CHECK CURRENT USER
  // ============================================================

  const belongsToCurrentUser = (app) => {
    const userIds = getUserIds();

    if (!userIds.length) {
      return false;
    }

    const applicationIds = getApplicationEmployeeIds(app);

    return applicationIds.some((id) =>
      userIds.includes(String(id))
    );
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
      setRefreshing(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token was not found. Please login again."
        );
        return;
      }

      const response = await api.get(
        "/api/applications/",
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
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      }

      console.log("All applications:", data);
      console.log("Logged user:", user);
      console.log("User IDs:", getUserIds());

      const myApplications = data.filter(
        belongsToCurrentUser
      );

      // ========================================================
      // FALLBACK FOR USER-SPECIFIC ENDPOINT
      // ========================================================

      if (
        myApplications.length === 0 &&
        data.length === 1
      ) {
        const single = data[0];

        const employee = single?.employee;

        if (
          employee &&
          typeof employee === "object"
        ) {
          const employeeName =
            employee.full_name ||
            employee.name ||
            employee.username;

          const loggedName =
            user?.full_name ||
            user?.name ||
            user?.username;

          if (
            employeeName &&
            loggedName &&
            normalize(employeeName) ===
              normalize(loggedName)
          ) {
            myApplications.push(single);
          }
        }
      }

      console.log(
        "My promotion applications:",
        myApplications
      );

      setApplications(myApplications);
    } catch (err) {
      console.error(
        "Failed to load applications:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view promotion applications."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load your promotion application."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // APPLICATION STATUS
  // ============================================================

  const getApplicationStatus = (app) => {
    return (
      app?.status ||
      app?.application_status ||
      "DRAFT"
    );
  };

  // ============================================================
  // STATUS LABEL
  // ============================================================

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: "Draft",
      SUBMITTED: "Submitted",

      HOD_REVIEW: "HOD Review",

      DEAN_REVIEW: "Dean Review",

      UNDER_REVIEW: "Academic Review",
      REVIEWER_REVIEW: "Academic Review",
      REVIEWER_COMPLETED: "Academic Review Completed",

      STUDENT_REVIEW: "Student Review",
      STUDENT_ACTION: "Student Action",
      STUDENT_ACKNOWLEDGEMENT:
        "Student Acknowledgement",

      COMMITTEE_REVIEW:
        "Promotion Committee Review",

      APPROVED: "Approved",
      REJECTED: "Rejected",
      APPEALED: "Appealed",
    };

    return (
      labels[status] ||
      String(status || "Pending")
        .replace(/_/g, " ")
    );
  };

  // ============================================================
  // WORKFLOW
  // ============================================================

  const stages = [
    {
      key: "submitted",
      title: "Submitted",
      shortTitle: "Submitted",
      description:
        "Application submitted by staff member.",
    },

    {
      key: "hod",
      title: "HOD",
      shortTitle: "HOD",
      description:
        "Head of Department reviews and recommends the application.",
    },

    {
      key: "dean",
      title: "Dean",
      shortTitle: "Dean",
      description:
        "Dean reviews the departmental recommendation.",
    },

    {
      key: "reviewer",
      title: "Reviewer",
      shortTitle: "Reviewer",
      description:
        "Assigned academic reviewer assesses the promotion materials.",
    },

    {
      key: "student",
      title: "Student",
      shortTitle: "Student",
      description:
        "Applicant receives and acknowledges the academic review.",
    },

    {
      key: "committee",
      title: "Committee",
      shortTitle: "Committee",
      description:
        "Promotion Committee considers the application.",
    },

    {
      key: "final",
      title: "Final",
      shortTitle: "Final",
      description:
        "Final promotion decision is recorded.",
    },
  ];

  // ============================================================
  // CURRENT STAGE
  // ============================================================

  const getCurrentStageIndex = (app) => {
    const status = getApplicationStatus(app);

    switch (status) {
      case "DRAFT":
        return 0;

      case "SUBMITTED":
        return 0;

      case "HOD_REVIEW":
        return 1;

      case "DEAN_REVIEW":
        return 2;

      case "UNDER_REVIEW":
      case "REVIEWER_REVIEW":
        return 3;

      case "REVIEWER_COMPLETED":
      case "STUDENT_REVIEW":
      case "STUDENT_ACTION":
      case "STUDENT_ACKNOWLEDGEMENT":
        return 4;

      case "COMMITTEE_REVIEW":
        return 5;

      case "APPROVED":
      case "REJECTED":
      case "APPEALED":
        return 6;

      default:
        return 0;
    }
  };

  // ============================================================
  // STAGE STATUS
  // ============================================================

  const getStageStatus = (app, key) => {
    const status = getApplicationStatus(app);

    switch (key) {
      // --------------------------------------------------------
      // SUBMITTED
      // --------------------------------------------------------

      case "submitted":
        if (status === "DRAFT") {
          return "Waiting";
        }

        return "Completed";

      // --------------------------------------------------------
      // HOD
      // --------------------------------------------------------

      case "hod":
        if (
          ["DRAFT", "SUBMITTED"].includes(status)
        ) {
          return "Waiting";
        }

        if (
          [
            "DEAN_REVIEW",
            "UNDER_REVIEW",
            "REVIEWER_REVIEW",
            "REVIEWER_COMPLETED",
            "STUDENT_REVIEW",
            "STUDENT_ACTION",
            "STUDENT_ACKNOWLEDGEMENT",
            "COMMITTEE_REVIEW",
            "APPROVED",
          ].includes(status)
        ) {
          return (
            app?.hod_recommendation ||
            app?.hod_status ||
            "Completed"
          );
        }

        if (status === "REJECTED") {
          return (
            app?.hod_recommendation ||
            app?.hod_status ||
            "Rejected"
          );
        }

        return "In Progress";

      // --------------------------------------------------------
      // DEAN
      // --------------------------------------------------------

      case "dean":
        if (
          [
            "DRAFT",
            "SUBMITTED",
            "HOD_REVIEW",
          ].includes(status)
        ) {
          return "Waiting";
        }

        if (
          [
            "UNDER_REVIEW",
            "REVIEWER_REVIEW",
            "REVIEWER_COMPLETED",
            "STUDENT_REVIEW",
            "STUDENT_ACTION",
            "STUDENT_ACKNOWLEDGEMENT",
            "COMMITTEE_REVIEW",
            "APPROVED",
          ].includes(status)
        ) {
          return (
            app?.dean_recommendation ||
            app?.dean_status ||
            "Completed"
          );
        }

        if (status === "REJECTED") {
          return (
            app?.dean_recommendation ||
            app?.dean_status ||
            "Rejected"
          );
        }

        return "In Progress";

      // --------------------------------------------------------
      // REVIEWER
      // --------------------------------------------------------

      case "reviewer":
        if (
          [
            "DRAFT",
            "SUBMITTED",
            "HOD_REVIEW",
            "DEAN_REVIEW",
          ].includes(status)
        ) {
          return "Waiting";
        }

        if (
          [
            "REVIEWER_COMPLETED",
            "STUDENT_REVIEW",
            "STUDENT_ACTION",
            "STUDENT_ACKNOWLEDGEMENT",
            "COMMITTEE_REVIEW",
            "APPROVED",
          ].includes(status)
        ) {
          return (
            app?.reviewer_recommendation ||
            app?.reviewer_status ||
            app?.review_status ||
            "Completed"
          );
        }

        if (
          status === "REJECTED"
        ) {
          return (
            app?.reviewer_recommendation ||
            app?.reviewer_status ||
            "Rejected"
          );
        }

        return "In Progress";

      // --------------------------------------------------------
      // STUDENT
      // --------------------------------------------------------

      case "student":
        if (
          [
            "DRAFT",
            "SUBMITTED",
            "HOD_REVIEW",
            "DEAN_REVIEW",
            "UNDER_REVIEW",
            "REVIEWER_REVIEW",
          ].includes(status)
        ) {
          return "Waiting";
        }

        if (
          [
            "COMMITTEE_REVIEW",
            "APPROVED",
          ].includes(status)
        ) {
          return (
            app?.student_status ||
            app?.student_action_status ||
            app?.applicant_acknowledgement ||
            "Completed"
          );
        }

        if (
          [
            "STUDENT_REVIEW",
            "STUDENT_ACTION",
            "STUDENT_ACKNOWLEDGEMENT",
          ].includes(status)
        ) {
          return (
            app?.student_status ||
            app?.student_action_status ||
            app?.applicant_acknowledgement ||
            "In Progress"
          );
        }

        if (status === "REJECTED") {
          return (
            app?.student_status ||
            "Rejected"
          );
        }

        return "Waiting";

      // --------------------------------------------------------
      // COMMITTEE
      // --------------------------------------------------------

      case "committee":
        if (
          [
            "DRAFT",
            "SUBMITTED",
            "HOD_REVIEW",
            "DEAN_REVIEW",
            "UNDER_REVIEW",
            "REVIEWER_REVIEW",
            "REVIEWER_COMPLETED",
            "STUDENT_REVIEW",
            "STUDENT_ACTION",
            "STUDENT_ACKNOWLEDGEMENT",
          ].includes(status)
        ) {
          return "Waiting";
        }

        if (status === "APPROVED") {
          return (
            app?.committee_recommendation ||
            app?.committee_status ||
            "Completed"
          );
        }

        if (status === "REJECTED") {
          return (
            app?.committee_recommendation ||
            app?.committee_status ||
            "Rejected"
          );
        }

        if (status === "COMMITTEE_REVIEW") {
          return (
            app?.committee_recommendation ||
            app?.committee_status ||
            "In Progress"
          );
        }

        return "Waiting";

      // --------------------------------------------------------
      // FINAL
      // --------------------------------------------------------

      case "final":
        if (status === "APPROVED") {
          return "Approved";
        }

        if (status === "REJECTED") {
          return "Rejected";
        }

        if (status === "APPEALED") {
          return "Appealed";
        }

        return "Waiting";

      default:
        return "Waiting";
    }
  };

  // ============================================================
  // STATUS HELPERS
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

  const isCompleted = (value) => {
    const status = normalize(value);

    return (
      status === "completed" ||
      status === "complete" ||
      status === "done" ||
      status === "approved" ||
      status === "accepted" ||
      status === "passed" ||
      status === "finished"
    );
  };

  const getStatusClass = (value) => {
    const status = normalize(value);

    if (isRejected(status)) {
      return "status rejected";
    }

    if (
      isCompleted(status) ||
      status.includes("approved") ||
      status.includes("completed")
    ) {
      return "status approved";
    }

    if (
      status.includes("review") ||
      status.includes("progress") ||
      status.includes("submitted") ||
      status.includes("appealed") ||
      status.includes("action")
    ) {
      return "status review";
    }

    return "status pending";
  };

  // ============================================================
  // CURRENT STAGE TEXT
  // ============================================================

  const getCurrentStage = (app) => {
    const status = getApplicationStatus(app);

    switch (status) {
      case "DRAFT":
        return "Draft";

      case "SUBMITTED":
        return "HOD";

      case "HOD_REVIEW":
        return "HOD";

      case "DEAN_REVIEW":
        return "Dean";

      case "UNDER_REVIEW":
      case "REVIEWER_REVIEW":
        return "Academic Reviewer";

      case "REVIEWER_COMPLETED":
      case "STUDENT_REVIEW":
      case "STUDENT_ACTION":
      case "STUDENT_ACKNOWLEDGEMENT":
        return "Student";

      case "COMMITTEE_REVIEW":
        return "Promotion Committee";

      case "APPROVED":
        return "Promotion Approved";

      case "REJECTED":
        return "Promotion Rejected";

      case "APPEALED":
        return "Appeal Under Consideration";

      default:
        return getStatusLabel(status);
    }
  };

  // ============================================================
  // APPLICANT NAME
  // ============================================================

  const getApplicantName = (app) => {
    return (
      app?.full_name ||
      app?.employee_name ||
      app?.applicant_name ||
      app?.employee?.full_name ||
      app?.employee?.name ||
      app?.employee?.username ||
      user?.full_name ||
      user?.name ||
      user?.username ||
      "Staff Member"
    );
  };

  // ============================================================
  // CURRENT POSITION
  // ============================================================

  const getCurrentPosition = (app) => {
    return (
      app?.current_title_name ||
      app?.current_title?.title_name ||
      app?.current_title?.name ||
      app?.present_position_name ||
      app?.present_position?.title_name ||
      app?.present_position?.name ||
      app?.current_position ||
      "N/A"
    );
  };

  // ============================================================
  // TARGET POSITION
  // ============================================================

  const getTargetPosition = (app) => {
    return (
      app?.targeted_title_name ||
      app?.targeted_title?.title_name ||
      app?.targeted_title?.name ||
      app?.position_applied_for_name ||
      app?.position_applied_for?.title_name ||
      app?.position_applied_for?.name ||
      app?.target_position ||
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
  // TOTAL POINTS
  // ============================================================

  const getTotalPoints = (app) => {
    const values = [
      app?.total_points,
      app?.total_material_points,
      app?.total_score,
      app?.points,
    ];

    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
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
  // DOCUMENT URL
  // ============================================================

  const getDocumentUrl = (document) => {
    if (!document) {
      return null;
    }

    if (typeof document === "object") {
      document =
        document.url ||
        document.file ||
        document.document;
    }

    if (!document) {
      return null;
    }

    if (
      String(document).startsWith("http")
    ) {
      return document;
    }

    return `http://127.0.0.1:8000${
      String(document).startsWith("/")
        ? document
        : `/${document}`
    }`;
  };

  // ============================================================
  // CV
  // ============================================================

  const getCV = (app) => {
    return (
      app?.cv ||
      app?.cv_url ||
      null
    );
  };

  // ============================================================
  // ADDITIONAL DOCUMENT
  // ============================================================

  const getAdditionalDocument = (app) => {
    return (
      app?.additional_documents ||
      app?.additional_documents_url ||
      null
    );
  };

  // ============================================================
  // REVIEWER
  // ============================================================

  const getReviewerName = (app) => {
    return (
      app?.assigned_reviewer?.full_name ||
      app?.assigned_reviewer?.name ||
      app?.assigned_reviewer?.username ||
      app?.reviewer?.full_name ||
      app?.reviewer?.name ||
      app?.reviewer?.username ||
      "Academic Reviewer"
    );
  };

  // ============================================================
  // HOD
  // ============================================================

  const getHODName = (app) => {
    return (
      app?.hod?.full_name ||
      app?.hod?.name ||
      app?.hod?.username ||
      app?.hod_name ||
      "HOD"
    );
  };

  // ============================================================
  // DEAN
  // ============================================================

  const getDeanName = (app) => {
    return (
      app?.dean?.full_name ||
      app?.dean?.name ||
      app?.dean?.username ||
      app?.dean_name ||
      "Dean"
    );
  };

  // ============================================================
  // CHECKLIST / PROMOTION MATERIALS
  //
  // Matches:
  //
  // PromotionMaterialSerializer
  //
  // material_type
  // material_type_display
  // points
  // document
  // ============================================================

  const viewChecklist = async (application) => {
    try {
      setSelectedApplication(application);
      setLoadingMaterials(true);
      setMaterials([]);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token was not found."
        );
        return;
      }

      const response = await api.get(
        `/api/promotion-materials/?application=${application.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (
        Array.isArray(response.data?.results)
      ) {
        data = response.data.results;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        data = response.data.data;
      }

      console.log(
        "Promotion materials:",
        data
      );

      setMaterials(data);
    } catch (err) {
      console.error(
        "Failed to load promotion materials:",
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
  // MATERIAL TOTAL
  // ============================================================

  const materialTotal = useMemo(() => {
    return materials
      .reduce((total, material) => {
        return (
          total +
          Number(material?.points || 0)
        );
      }, 0)
      .toFixed(2);
  }, [materials]);

  // ============================================================
  // MATERIAL TYPE LABEL
  // ============================================================

  const getMaterialName = (material) => {
    return (
      material?.material_type_display ||
      material?.material_type ||
      "Promotion Material"
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>

          <h3>
            Loading Promotion Application
          </h3>

          <p>
            Retrieving your promotion records...
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
          <div style={styles.breadcrumb}>
            Staff Portal / Promotion / My Application
          </div>

          <h1 style={styles.title}>
            My Promotion Application
          </h1>

          <p style={styles.subtitle}>
            Track the progress of your promotion
            application from submission through
            HOD, Dean, Reviewer, Student,
            Committee and Final Decision.
          </p>
        </div>

        <button
          onClick={fetchMyApplications}
          disabled={refreshing}
          style={{
            ...styles.refreshButton,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div style={styles.errorBox}>
          <div>
            <strong>
              Unable to load application
            </strong>

            <p style={styles.errorText}>
              {error}
            </p>
          </div>

          <button
            onClick={() => setError("")}
            style={styles.errorClose}
          >
            ×
          </button>
        </div>
      )}

      {/* STAFF CARD */}

      <div style={styles.staffCard}>

        <div style={styles.staffAvatar}>
          {(
            user?.full_name ||
            user?.name ||
            user?.username ||
            "S"
          )
            .charAt(0)
            .toUpperCase()}
        </div>

        <div style={styles.staffMain}>
          <span style={styles.label}>
            STAFF MEMBER
          </span>

          <h2 style={styles.staffName}>
            {user?.full_name ||
              user?.name ||
              user?.username ||
              "Staff Member"}
          </h2>

          <p style={styles.staffEmail}>
            {user?.email ||
              "Email not available"}
          </p>
        </div>

        <div style={styles.staffInfo}>
          <span style={styles.label}>
            ROLE
          </span>

          <strong>
            {user?.role || "Staff"}
          </strong>
        </div>

        <div style={styles.staffInfo}>
          <span style={styles.label}>
            APPLICATIONS
          </span>

          <strong style={styles.applicationCount}>
            {applications.length}
          </strong>
        </div>

      </div>

      {/* NO APPLICATION */}

      {applications.length === 0 ? (

        <div style={styles.emptyCard}>

          <div style={styles.emptyIcon}>
            📄
          </div>

          <h2>
            No Promotion Application Found
          </h2>

          <p>
            We could not find a promotion
            application associated with your
            staff account.
          </p>

          <p style={styles.emptyHint}>
            If you have already submitted an
            application, refresh the page or
            contact the administrator.
          </p>

          <button
            onClick={fetchMyApplications}
            style={styles.primaryButton}
          >
            ↻ Check Again
          </button>

        </div>

      ) : (

        <div style={styles.applicationList}>

          {applications.map((app) => {

            const status =
              getApplicationStatus(app);

            const currentStage =
              getCurrentStage(app);

            const currentIndex =
              getCurrentStageIndex(app);

            const cv = getCV(app);

            const additional =
              getAdditionalDocument(app);

            return (

              <div
                key={app.id}
                style={styles.applicationCard}
              >

                {/* APPLICATION HEADER */}

                <div style={styles.cardHeader}>

                  <div>

                    <div style={styles.applicationId}>
                      APPLICATION #{app.id}
                    </div>

                    <h2 style={styles.positionTitle}>
                      {getCurrentPosition(app)}

                      <span style={styles.arrow}>
                        →
                      </span>

                      {getTargetPosition(app)}
                    </h2>

                    <p style={styles.dateText}>
                      Submitted on{" "}
                      {formatDate(
                        app.created_at ||
                        app.submitted_at ||
                        app.application_date
                      )}
                    </p>

                  </div>

                  <div
                    className={getStatusClass(
                      getStatusLabel(status)
                    )}
                  >
                    {getStatusLabel(status)}
                  </div>

                </div>

                {/* CURRENT STAGE */}

                <div
                  style={
                    status === "APPROVED"
                      ? styles.approvedBanner
                      : status === "REJECTED"
                      ? styles.rejectedBanner
                      : styles.currentBanner
                  }
                >

                  <div style={styles.stageIcon}>
                    {status === "APPROVED"
                      ? "✓"
                      : status === "REJECTED"
                      ? "×"
                      : "➜"}
                  </div>

                  <div>

                    <span style={styles.bannerLabel}>
                      CURRENT STAGE
                    </span>

                    <h3 style={styles.bannerTitle}>
                      {currentStage}
                    </h3>

                    <p style={styles.bannerText}>
                      {status === "APPROVED"
                        ? "Your promotion application has been approved."
                        : status === "REJECTED"
                        ? "Your promotion application has been rejected."
                        : status === "DRAFT"
                        ? "Your application is still in draft and has not been submitted."
                        : `Your application is currently being processed at the ${currentStage} stage.`}
                    </p>

                  </div>

                </div>

                {/* SUMMARY */}

                <div style={styles.summaryGrid}>

                  <div style={styles.summaryCard}>
                    <span style={styles.summaryLabel}>
                      Current Position
                    </span>

                    <strong>
                      {getCurrentPosition(app)}
                    </strong>
                  </div>

                  <div style={styles.summaryCard}>
                    <span style={styles.summaryLabel}>
                      Position Applied For
                    </span>

                    <strong>
                      {getTargetPosition(app)}
                    </strong>
                  </div>

                  <div style={styles.summaryCard}>
                    <span style={styles.summaryLabel}>
                      Total Points
                    </span>

                    <strong style={styles.points}>
                      {getTotalPoints(app)}
                    </strong>
                  </div>

                  <div style={styles.summaryCard}>
                    <span style={styles.summaryLabel}>
                      Application Status
                    </span>

                    <span
                      className={getStatusClass(
                        getStatusLabel(status)
                      )}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>

                </div>

                {/* =================================================
                    PROMOTION PROCESS TRACKING
                ================================================= */}

                <div style={styles.trackingSection}>

                  <div style={styles.sectionHeader}>

                    <div>
                      <h3 style={styles.sectionTitle}>
                        Promotion Process Tracking
                      </h3>

                      <p style={styles.sectionSubtitle}>
                        Follow the progress of your
                        application through each
                        approval stage.
                      </p>
                    </div>

                    <div style={styles.stageCounter}>
                      Stage{" "}
                      {Math.min(
                        currentIndex + 1,
                        stages.length
                      )}{" "}
                      of {stages.length}
                    </div>

                  </div>

                  <div style={styles.timeline}>

                    {stages.map(
                      (stage, index) => {

                        const stageStatus =
                          getStageStatus(
                            app,
                            stage.key
                          );

                        const rejected =
                          isRejected(
                            stageStatus
                          );

                        let completed =
                          index <
                          currentIndex;

                        let active =
                          index ===
                            currentIndex &&
                          !rejected;

                        // Final approved
                        if (
                          stage.key === "final" &&
                          status === "APPROVED"
                        ) {
                          completed = true;
                          active = false;
                        }

                        // Final rejected
                        if (
                          stage.key === "final" &&
                          status === "REJECTED"
                        ) {
                          completed = false;
                          active = false;
                        }

                        return (

                          <div
                            key={stage.key}
                            style={styles.timelineItem}
                          >

                            <div style={styles.timelineTop}>

                              <div
                                style={
                                  rejected
                                    ? styles.stepRejected
                                    : completed
                                    ? styles.stepCompleted
                                    : active
                                    ? styles.stepActive
                                    : styles.stepPending
                                }
                              >
                                {rejected
                                  ? "×"
                                  : completed
                                  ? "✓"
                                  : index + 1}
                              </div>

                              {index <
                                stages.length - 1 && (
                                <div
                                  style={
                                    index <
                                    currentIndex
                                      ? styles.lineCompleted
                                      : styles.linePending
                                  }
                                />
                              )}

                            </div>

                            <div
                              style={
                                active
                                  ? styles.stageActive
                                  : completed
                                  ? styles.stageCompleted
                                  : styles.stagePendingText
                              }
                            >
                              {stage.shortTitle}
                            </div>

                            <div style={styles.stageDescription}>
                              {stage.description}
                            </div>

                            <div
                              className={getStatusClass(
                                stageStatus
                              )}
                              style={{
                                marginTop: "8px",
                              }}
                            >
                              {stageStatus}
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* =================================================
                    APPROVAL STAGE DETAILS
                ================================================= */}

                <div style={styles.detailsSection}>

                  <h3 style={styles.sectionTitle}>
                    Approval Stage Details
                  </h3>

                  <div style={styles.tableWrapper}>

                    <table style={styles.table}>

                      <thead>
                        <tr>

                          <th style={styles.th}>
                            #
                          </th>

                          <th style={styles.th}>
                            Stage
                          </th>

                          <th style={styles.th}>
                            Responsible Officer
                          </th>

                          <th style={styles.th}>
                            Status
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {/* 1 SUBMITTED */}

                        <tr>
                          <td style={styles.td}>
                            1
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Application Submitted
                            </strong>

                            <small style={styles.smallText}>
                              Staff submission
                            </small>
                          </td>

                          <td style={styles.td}>
                            Applicant
                          </td>

                          <td style={styles.td}>
                            <span className="status approved">
                              Submitted
                            </span>
                          </td>
                        </tr>

                        {/* 2 HOD */}

                        <tr>
                          <td style={styles.td}>
                            2
                          </td>

                          <td style={styles.td}>
                            <strong>
                              HOD
                            </strong>

                            <small style={styles.smallText}>
                              Departmental review
                            </small>
                          </td>

                          <td style={styles.td}>
                            {getHODName(app)}
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "hod"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "hod"
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* 3 DEAN */}

                        <tr>
                          <td style={styles.td}>
                            3
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Dean
                            </strong>

                            <small style={styles.smallText}>
                              College / Faculty review
                            </small>
                          </td>

                          <td style={styles.td}>
                            {getDeanName(app)}
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "dean"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "dean"
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* 4 REVIEWER */}

                        <tr>
                          <td style={styles.td}>
                            4
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Reviewer
                            </strong>

                            <small style={styles.smallText}>
                              Academic assessment
                            </small>
                          </td>

                          <td style={styles.td}>
                            {getReviewerName(app)}
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "reviewer"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "reviewer"
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* 5 STUDENT */}

                        <tr
                          style={
                            [
                              "STUDENT_REVIEW",
                              "STUDENT_ACTION",
                              "STUDENT_ACKNOWLEDGEMENT",
                            ].includes(status)
                              ? styles.studentActiveRow
                              : {}
                          }
                        >
                          <td style={styles.td}>
                            5
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Student
                            </strong>

                            <small style={styles.smallText}>
                              Applicant receives /
                              acknowledges reviewer assessment
                            </small>
                          </td>

                          <td style={styles.td}>
                            Applicant
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "student"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "student"
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* 6 COMMITTEE */}

                        <tr>
                          <td style={styles.td}>
                            6
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Promotion Committee
                            </strong>

                            <small style={styles.smallText}>
                              Committee consideration
                            </small>
                          </td>

                          <td style={styles.td}>
                            Promotion Committee
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "committee"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "committee"
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* 7 FINAL */}

                        <tr style={styles.finalRow}>
                          <td style={styles.td}>
                            7
                          </td>

                          <td style={styles.td}>
                            <strong>
                              Final Decision
                            </strong>

                            <small style={styles.smallText}>
                              Final promotion decision
                            </small>
                          </td>

                          <td style={styles.td}>
                            University Authority
                          </td>

                          <td style={styles.td}>
                            <span
                              className={getStatusClass(
                                getStageStatus(
                                  app,
                                  "final"
                                )
                              )}
                            >
                              {getStageStatus(
                                app,
                                "final"
                              )}
                            </span>
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>
                </div>

                {/* =================================================
                    APPLICATION INFORMATION
                ================================================= */}

                <div style={styles.infoSection}>

                  <h3 style={styles.sectionTitle}>
                    Application Information
                  </h3>

                  <div style={styles.infoGrid}>

                    <div>
                      <span style={styles.infoLabel}>
                        Applicant Name
                      </span>

                      <strong>
                        {getApplicantName(app)}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Employment Status
                      </span>

                      <strong>
                        {app?.employment_status ||
                          "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Date of Appointment
                      </span>

                      <strong>
                        {formatDate(
                          app?.date_of_appointment_at_suza
                        )}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Date of Current Position
                      </span>

                      <strong>
                        {formatDate(
                          app?.date_of_current_position
                        )}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Applied Same Rank Before
                      </span>

                      <strong>
                        {app?.applied_same_rank_before ||
                          "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Intends New Publications
                      </span>

                      <strong>
                        {app?.intends_new_publications ||
                          "N/A"}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* =================================================
                    DOCUMENTS
                ================================================= */}

                <div style={styles.documentsSection}>

                  <h3 style={styles.sectionTitle}>
                    Application Documents
                  </h3>

                  <div style={styles.documentGrid}>

                    <div style={styles.documentCard}>

                      <div style={styles.documentIcon}>
                        📄
                      </div>

                      <div>
                        <strong>
                          Curriculum Vitae
                        </strong>

                        <p style={styles.documentText}>
                          Submitted CV
                        </p>
                      </div>

                      {cv ? (
                        <a
                          href={getDocumentUrl(cv)}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.documentButton}
                        >
                          View PDF
                        </a>
                      ) : (
                        <span style={styles.noDocument}>
                          Not uploaded
                        </span>
                      )}

                    </div>

                    <div style={styles.documentCard}>

                      <div style={styles.documentIcon}>
                        📎
                      </div>

                      <div>
                        <strong>
                          Additional Documents
                        </strong>

                        <p style={styles.documentText}>
                          Supporting documents
                        </p>
                      </div>

                      {additional ? (
                        <a
                          href={getDocumentUrl(additional)}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.documentButton}
                        >
                          View PDF
                        </a>
                      ) : (
                        <span style={styles.noDocument}>
                          Not uploaded
                        </span>
                      )}

                    </div>

                  </div>
                </div>

                {/* =================================================
                    CHECKLIST BUTTON
                ================================================= */}

                <div style={styles.actions}>

                  <button
                    onClick={() =>
                      viewChecklist(app)
                    }
                    style={styles.primaryButton}
                  >
                    📋 View Promotion Checklist
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ==========================================================
          CHECKLIST MODAL
      ========================================================== */}

      {selectedApplication && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <span style={styles.label}>
                  PROMOTION CHECKLIST
                </span>

                <h2 style={styles.modalTitle}>
                  Promotion Materials
                </h2>

                <p style={styles.modalSubtitle}>
                  {getCurrentPosition(
                    selectedApplication
                  )}

                  <span style={styles.arrow}>
                    →
                  </span>

                  {getTargetPosition(
                    selectedApplication
                  )}
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

                <h3>
                  Loading Checklist
                </h3>

                <p>
                  Retrieving your promotion materials...
                </p>

              </div>

            ) : materials.length === 0 ? (

              <div style={styles.noMaterials}>

                <div style={styles.emptyIcon}>
                  📋
                </div>

                <h3>
                  No Promotion Materials Found
                </h3>

                <p>
                  No promotion materials have been
                  registered for this application yet.
                </p>

              </div>

            ) : (

              <div style={styles.modalContent}>

                <div style={styles.materialSummary}>

                  <div>
                    <span style={styles.summaryLabel}>
                      Materials
                    </span>

                    <strong>
                      {materials.length}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.summaryLabel}>
                      Total Points
                    </span>

                    <strong style={styles.points}>
                      {materialTotal}
                    </strong>
                  </div>

                </div>

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
                          Supporting Evidence
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {materials.map(
                        (material, index) => {

                          return (

                            <tr
                              key={
                                material?.id ||
                                index
                              }
                            >

                              <td style={styles.td}>
                                {index + 1}
                              </td>

                              <td style={styles.td}>

                                <strong>
                                  {getMaterialName(
                                    material
                                  )}
                                </strong>

                              </td>

                              <td style={styles.td}>

                                <strong
                                  style={
                                    styles.points
                                  }
                                >
                                  {Number(
                                    material?.points ||
                                      0
                                  ).toFixed(2)}
                                </strong>

                              </td>

                              <td style={styles.td}>

                                {material?.document ? (

                                  <a
                                    href={getDocumentUrl(
                                      material.document
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={
                                      styles.documentButton
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

                            </tr>

                          );
                        }
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

                        <td
                          style={styles.totalValue}
                        >
                          {materialTotal}
                        </td>

                        <td
                          style={styles.totalBlank}
                        ></td>

                      </tr>

                    </tfoot>

                  </table>

                </div>

              </div>
            )}

            <div style={styles.modalFooter}>

              <p style={styles.footerText}>
                Promotion materials and their
                points contribute to the academic
                promotion assessment.
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

      {/* ==========================================================
          CSS
      ========================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status.approved {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .status.review {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #93c5fd;
        }

        .status.pending {
          background: #f3f4f6;
          color: #4b5563;
          border: 1px solid #d1d5db;
        }

        .status.rejected {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }

        table tbody tr:hover {
          background: #f8fafc;
        }

        button {
          font-family: inherit;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1000px) {
          .timeline {
            overflow-x: auto !important;
            padding-bottom: 15px !important;
          }

          .timeline > div {
            min-width: 170px !important;
          }
        }

        @media (max-width: 700px) {
          table {
            min-width: 750px;
          }

          .status {
            font-size: 11px;
            padding: 5px 9px;
          }
        }

      `}</style>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    maxWidth: "1350px",
    margin: "0 auto",
    padding: "30px 22px 70px",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    color: "#111827",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  breadcrumb: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    color: "#1e3a8a",
  },

  subtitle: {
    maxWidth: "900px",
    margin: "8px 0 0",
    color: "#64748b",
    lineHeight: "1.6",
  },

  refreshButton: {
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    padding: "11px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },

  errorBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "16px 18px",
    borderRadius: "10px",
    marginBottom: "22px",
  },

  errorText: {
    margin: "5px 0 0",
  },

  errorClose: {
    border: "none",
    background: "transparent",
    color: "#991b1b",
    fontSize: "24px",
    cursor: "pointer",
  },

  staffCard: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "25px",
  },

  staffAvatar: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  staffMain: {
    flex: 1,
  },

  label: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.7px",
    fontWeight: "800",
    color: "#64748b",
    marginBottom: "5px",
  },

  staffName: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "20px",
  },

  staffEmail: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  staffInfo: {
    minWidth: "130px",
    paddingLeft: "20px",
    borderLeft: "1px solid #dbeafe",
    display: "flex",
    flexDirection: "column",
  },

  applicationCount: {
    color: "#2563eb",
    fontSize: "20px",
  },

  emptyCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    textAlign: "center",
    padding: "75px 25px",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  emptyHint: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "22px",
  },

  applicationList: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  applicationCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    boxShadow:
      "0 5px 20px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    borderBottom: "1px solid #e5e7eb",
  },

  applicationId: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "0.5px",
  },

  positionTitle: {
    margin: "7px 0 0",
    fontSize: "22px",
    color: "#0f172a",
  },

  arrow: {
    margin: "0 9px",
    color: "#2563eb",
    fontWeight: "800",
  },

  dateText: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  currentBanner: {
    margin: "22px 25px",
    padding: "18px",
    borderRadius: "12px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  approvedBanner: {
    margin: "22px 25px",
    padding: "18px",
    borderRadius: "12px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  rejectedBanner: {
    margin: "22px 25px",
    padding: "18px",
    borderRadius: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  stageIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },

  bannerLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#64748b",
  },

  bannerTitle: {
    margin: "3px 0",
    color: "#1e3a8a",
  },

  bannerText: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
    padding: "0 25px 25px",
  },

  summaryCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px",
    minHeight: "82px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "5px",
  },

  summaryLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
  },

  points: {
    color: "#2563eb",
    fontSize: "19px",
  },

  trackingSection: {
    margin: "0 25px 25px",
    padding: "24px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "30px",
  },

  sectionTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "18px",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  stageCounter: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  timeline: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    overflowX: "auto",
  },

  timelineItem: {
    flex: 1,
    minWidth: "145px",
    textAlign: "center",
  },

  timelineTop: {
    display: "flex",
    alignItems: "center",
  },

  stepCompleted: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "3px solid #bbf7d0",
    zIndex: 2,
  },

  stepActive: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "3px solid #bfdbfe",
    zIndex: 2,
  },

  stepPending: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "3px solid #f1f5f9",
    zIndex: 2,
  },

  stepRejected: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    background: "#dc2626",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    border: "3px solid #fecaca",
    zIndex: 2,
  },

  lineCompleted: {
    height: "4px",
    background: "#16a34a",
    flex: 1,
  },

  linePending: {
    height: "4px",
    background: "#cbd5e1",
    flex: 1,
  },

  stageActive: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#2563eb",
    fontWeight: "800",
  },

  stageCompleted: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#15803d",
    fontWeight: "800",
  },

  stagePendingText: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "700",
  },

  stageDescription: {
    marginTop: "5px",
    color: "#94a3b8",
    fontSize: "10px",
    lineHeight: "1.4",
    minHeight: "30px",
    padding: "0 8px",
  },

  detailsSection: {
    padding: "0 25px 25px",
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    marginTop: "15px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    padding: "13px 14px",
    textAlign: "left",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "800",
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    verticalAlign: "middle",
  },

  smallText: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "4px",
  },

  studentActiveRow: {
    background: "#eff6ff",
  },

  finalRow: {
    background: "#f8fafc",
  },

  infoSection: {
    borderTop: "1px solid #e5e7eb",
    padding: "25px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginTop: "18px",
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "5px",
    fontWeight: "700",
  },

  documentsSection: {
    borderTop: "1px solid #e5e7eb",
    padding: "25px",
  },

  documentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
    marginTop: "18px",
  },

  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  documentIcon: {
    fontSize: "25px",
  },

  documentText: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  documentButton: {
    marginLeft: "auto",
    textDecoration: "none",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    padding: "8px 12px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  noDocument: {
    marginLeft: "auto",
    color: "#94a3b8",
    fontSize: "12px",
  },

  actions: {
    padding: "0 25px 25px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 17px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },

  loadingBox: {
    textAlign: "center",
    padding: "100px 20px",
  },

  spinner: {
    width: "35px",
    height: "35px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 18px",
    animation:
      "spin 1s linear infinite",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
  },

  modal: {
    width: "100%",
    maxWidth: "1150px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.3)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "23px 25px",
    borderBottom: "1px solid #e5e7eb",
  },

  modalTitle: {
    margin: "4px 0",
    color: "#1e3a8a",
  },

  modalSubtitle: {
    margin: 0,
    color: "#64748b",
  },

  modalClose: {
    border: "none",
    background: "#f1f5f9",
    color: "#334155",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    fontSize: "23px",
    cursor: "pointer",
  },

  modalContent: {
    padding: "25px",
  },

  materialSummary: {
    display: "flex",
    gap: "50px",
    marginBottom: "20px",
    padding: "15px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
  },

  modalLoading: {
    textAlign: "center",
    padding: "70px 20px",
  },

  noMaterials: {
    textAlign: "center",
    padding: "70px 20px",
    color: "#64748b",
  },

  totalLabel: {
    padding: "14px",
    textAlign: "right",
    fontWeight: "800",
    background: "#f1f5f9",
  },

  totalValue: {
    padding: "14px",
    fontWeight: "800",
    color: "#2563eb",
    background: "#eff6ff",
  },

  totalBlank: {
    background: "#f1f5f9",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "18px 25px",
    borderTop: "1px solid #e5e7eb",
  },

  footerText: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },

  closeButton: {
    border: "none",
    background: "#334155",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default MyApplications;