import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function ReviewMaterial() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // ============================================================
  // URL
  // ============================================================

  const searchParams = new URLSearchParams(location.search);

  const applicationId = useMemo(() => {
    return (
      params.applicationId ||
      params.id ||
      params.pk ||
      searchParams.get("applicationId") ||
      searchParams.get("application_id") ||
      searchParams.get("application") ||
      location.pathname.match(
        /\/reviewer\/review\/([^/?]+)/
      )?.[1] ||
      null
    );
  }, [params, location.pathname, location.search]);

  const assignmentId = useMemo(() => {
    return (
      searchParams.get("assignment") ||
      searchParams.get("assignmentId") ||
      searchParams.get("assignment_id") ||
      null
    );
  }, [location.search]);

  // ============================================================
  // AUTH
  // ============================================================

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const role = localStorage.getItem("role");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ============================================================
  // STATE
  // ============================================================

  const [assignment, setAssignment] = useState(null);
  const [application, setApplication] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reviewForms, setReviewForms] = useState({});

  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (role && role.toUpperCase() !== "REVIEWER") {
      navigate("/login");
      return;
    }

    initialize();
  }, [applicationId, assignmentId]);

  // ============================================================
  // HELPERS
  // ============================================================

  const unwrap = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const normalizeId = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    if (typeof value === "object") {
      return (
        value.id ||
        value.pk ||
        value.application_id ||
        value.material_id ||
        value.reviewer_id ||
        null
      );
    }

    return String(value);
  };

  const sameId = (a, b) => {
    const first = normalizeId(a);
    const second = normalizeId(b);

    if (!first || !second) {
      return false;
    }

    return String(first) === String(second);
  };

  // ============================================================
  // GET APPLICATION ID
  // ============================================================

  const getApplicationIdFromObject = (obj) => {
    if (!obj) return null;

    return (
      obj.application_id ||
      obj.application?.id ||
      obj.application?.pk ||
      obj.application ||
      obj.promotion_application_id ||
      obj.promotion_application?.id ||
      obj.promotion_application?.pk ||
      obj.promotion_application ||
      obj.promotionApplication?.id ||
      obj.promotionApplication?.pk ||
      null
    );
  };

  // ============================================================
  // GET MATERIAL ID
  // ============================================================

  const getMaterialId = (material) => {
    if (!material) return null;

    return (
      material.id ||
      material.pk ||
      material.material_id ||
      null
    );
  };

  // ============================================================
  // GET REVIEW MATERIAL ID
  // ============================================================

  const getReviewMaterialId = (review) => {
    if (!review) return null;

    return (
      review.material_id ||
      review.material?.id ||
      review.material?.pk ||
      review.material ||
      review.academic_material_id ||
      review.promotion_material_id ||
      review.promotion_material?.id ||
      review.promotion_material?.pk ||
      null
    );
  };

  // ============================================================
  // GET REVIEW APPLICATION ID
  // ============================================================

  const getReviewApplicationId = (review) => {
    if (!review) return null;

    return (
      review.application_id ||
      review.application?.id ||
      review.application?.pk ||
      review.application ||
      review.promotion_application_id ||
      review.promotion_application?.id ||
      review.promotion_application?.pk ||
      null
    );
  };

  // ============================================================
  // GET REVIEW ASSIGNMENT ID
  // ============================================================

  const getReviewAssignmentId = (review) => {
    if (!review) return null;

    return (
      review.assignment_id ||
      review.reviewer_assignment_id ||
      review.assignment?.id ||
      review.reviewer_assignment?.id ||
      null
    );
  };

  // ============================================================
  // GET REVIEWER ID
  // ============================================================

  const getReviewReviewerId = (review) => {
    if (!review) return null;

    return (
      review.reviewer_id ||
      review.reviewer?.id ||
      review.reviewer ||
      null
    );
  };

  // ============================================================
  // GET ASSIGNMENT REVIEWER ID
  // ============================================================

  const getAssignmentReviewerId = (selectedAssignment) => {
    if (!selectedAssignment) return null;

    return (
      selectedAssignment.reviewer_id ||
      selectedAssignment.reviewer?.id ||
      selectedAssignment.reviewer ||
      null
    );
  };

  // ============================================================
  // INITIALIZE
  // ============================================================

  const initialize = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("============================================");
      console.log("REVIEW MATERIAL INITIALIZATION");
      console.log("Application ID:", applicationId);
      console.log("Assignment ID:", assignmentId);
      console.log("Current URL:", window.location.href);
      console.log("============================================");

      if (!applicationId) {
        throw new Error(
          "No promotion application was selected."
        );
      }

      if (!assignmentId) {
        throw new Error(
          "No reviewer assignment was selected."
        );
      }

      // ========================================================
      // 1. LOAD ASSIGNMENT
      // ========================================================

      const assignmentResponse = await axios.get(
        `${API_URL}/reviewer-assignments/`,
        {
          headers,
        }
      );

      const assignments = unwrap(
        assignmentResponse.data
      );

      console.log(
        "Reviewer assignments:",
        assignments
      );

      const selectedAssignment =
        assignments.find((item) =>
          sameId(item.id, assignmentId)
        );

      if (!selectedAssignment) {
        throw new Error(
          `Reviewer assignment ${assignmentId} was not found.`
        );
      }

      console.log(
        "Selected reviewer assignment:",
        selectedAssignment
      );

      setAssignment(selectedAssignment);

      // ========================================================
      // VERIFY APPLICATION
      // ========================================================

      const assignmentApplicationId =
        getApplicationIdFromObject(
          selectedAssignment
        );

      if (
        assignmentApplicationId &&
        !sameId(
          assignmentApplicationId,
          applicationId
        )
      ) {
        throw new Error(
          "The selected reviewer assignment does not belong to this promotion application."
        );
      }

      // ========================================================
      // 2. LOAD APPLICATION
      // ========================================================

      const applicationResponse = await axios.get(
        `${API_URL}/applications/${applicationId}/`,
        {
          headers,
        }
      );

      console.log(
        "Promotion application:",
        applicationResponse.data
      );

      setApplication(
        applicationResponse.data
      );

      // ========================================================
      // 3. LOAD PROMOTION MATERIALS
      // ========================================================

      const materialsResponse = await axios.get(
        `${API_URL}/promotion-materials/`,
        {
          headers,
        }
      );

      const allMaterials = unwrap(
        materialsResponse.data
      );

      console.log(
        "Promotion materials:",
        allMaterials
      );

      const filteredMaterials =
        allMaterials.filter((material) => {
          const materialApplicationId =
            getApplicationIdFromObject(
              material
            );

          return sameId(
            materialApplicationId,
            applicationId
          );
        });

      console.log(
        "Filtered promotion materials:",
        filteredMaterials
      );

      let finalMaterials =
        filteredMaterials;

      /*
        Fallback for serializers that don't expose
        application information.
      */

      if (
        finalMaterials.length === 0 &&
        allMaterials.length > 0
      ) {
        const materialsHaveApplicationInfo =
          allMaterials.some(
            (material) =>
              getApplicationIdFromObject(
                material
              ) !== null
          );

        if (!materialsHaveApplicationInfo) {
          finalMaterials = allMaterials;
        }
      }

      setMaterials(finalMaterials);

      // ========================================================
      // 4. LOAD ACADEMIC MATERIAL REVIEWS
      // ========================================================

      const reviewsResponse = await axios.get(
        `${API_URL}/academic-material-reviews/`,
        {
          headers,
        }
      );

      const allReviews = unwrap(
        reviewsResponse.data
      );

      console.log(
        "Academic material reviews:",
        allReviews
      );

      const selectedReviewerId =
        getAssignmentReviewerId(
          selectedAssignment
        );

      /*
        Primary matching:
        material belongs to current application
        AND reviewer belongs to assignment.
      */

      const finalReviews =
        allReviews.filter((review) => {
          const reviewMaterialId =
            getReviewMaterialId(review);

          const materialBelongs =
            finalMaterials.some((material) =>
              sameId(
                getMaterialId(material),
                reviewMaterialId
              )
            );

          if (!materialBelongs) {
            return false;
          }

          const reviewReviewerId =
            getReviewReviewerId(review);

          /*
            If reviewer information is available,
            make sure it belongs to the current reviewer.
          */

          if (
            selectedReviewerId &&
            reviewReviewerId
          ) {
            return sameId(
              selectedReviewerId,
              reviewReviewerId
            );
          }

          return true;
        });

      console.log(
        "Filtered academic material reviews:",
        finalReviews
      );

      setReviews(finalReviews);

      // ========================================================
      // 5. CREATE FORM VALUES
      // ========================================================

      const formValues = {};

      finalMaterials.forEach((material) => {
        const materialId =
          getMaterialId(material);

        const existingReview =
          finalReviews.find((review) =>
            sameId(
              getReviewMaterialId(review),
              materialId
            )
          );

        formValues[materialId] = {
          authenticity:
            existingReview?.authenticity || "",

          originality:
            existingReview?.originality || "",

          coverage_of_subject:
            existingReview?.coverage_of_subject ||
            "",

          contribution_to_knowledge:
            existingReview?.contribution_to_knowledge ||
            "",

          relevance_to_discipline:
            existingReview?.relevance_to_discipline ||
            "",

          presentation_quality:
            existingReview?.presentation_quality ||
            "",

          technical_recommendation:
            existingReview?.technical_recommendation ||
            "",

          grade:
            existingReview?.grade || "",

          points:
            existingReview?.points ??
            "",

          overall_quality:
            existingReview?.overall_quality ||
            "",

          strengths:
            existingReview?.strengths ||
            "",

          shortcomings:
            existingReview?.shortcomings ||
            "",

          reviewer_name:
            existingReview?.reviewer_name ||
            selectedAssignment?.reviewer_name ||
            selectedAssignment?.reviewer?.full_name ||
            selectedAssignment?.reviewer?.name ||
            "",

          reviewer_academic_rank:
            existingReview?.reviewer_academic_rank ||
            selectedAssignment?.reviewer_academic_rank ||
            selectedAssignment?.reviewer?.academic_rank ||
            "",

          reviewer_affiliation:
            existingReview?.reviewer_affiliation ||
            selectedAssignment?.reviewer_affiliation ||
            "",

          reviewer_signature_date:
            existingReview?.reviewer_signature_date ||
            new Date().toISOString().split("T")[0],
        };
      });

      setReviewForms(formValues);

    } catch (err) {
      console.error(
        "Review page initialization failed:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load reviewer assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APPLICATION INFORMATION
  // ============================================================

  const getApplicantName = () => {
    return (
      application?.employee_name ||
      application?.applicant_name ||
      application?.employee?.full_name ||
      application?.employee?.name ||
      application?.employee?.username ||
      application?.user?.full_name ||
      application?.user?.name ||
      "N/A"
    );
  };

  const getDepartment = () => {
    return (
      application?.department_name ||
      application?.department?.name ||
      application?.employee?.department_name ||
      application?.employee?.department?.name ||
      application?.employee?.department ||
      "N/A"
    );
  };

  const getCurrentRank = () => {
    return (
      application?.current_title_name ||
      application?.current_title?.title_name ||
      application?.current_title?.name ||
      application?.current_title ||
      application?.current_position ||
      "N/A"
    );
  };

  const getTargetRank = () => {
    return (
      application?.targeted_title_name ||
      application?.targeted_title?.title_name ||
      application?.targeted_title?.name ||
      application?.targeted_title ||
      application?.target_position ||
      "N/A"
    );
  };

  const getReviewerName = () => {
    return (
      assignment?.reviewer_name ||
      assignment?.reviewer?.full_name ||
      assignment?.reviewer?.name ||
      assignment?.reviewer_full_name ||
      "You"
    );
  };

  // ============================================================
  // ASSIGNMENT STATUS
  // ============================================================

  const getAssignmentStatus = () => {
    if (!assignment) {
      return "PENDING";
    }

    if (assignment.completed === true) {
      return "COMPLETED";
    }

    return (
      assignment.review_status ||
      assignment.status ||
      "PENDING"
    );
  };

  // ============================================================
  // REVIEW LOOKUP
  // ============================================================

  const getReviewForMaterial = (material) => {
    const materialId =
      getMaterialId(material);

    return reviews.find((review) =>
      sameId(
        getReviewMaterialId(review),
        materialId
      )
    );
  };

  // ============================================================
  // UPDATE FORM
  // ============================================================

  const updateForm = (
    materialId,
    field,
    value
  ) => {
    setReviewForms((previous) => ({
      ...previous,

      [materialId]: {
        ...(previous[materialId] || {}),
        [field]: value,
      },
    }));
  };

  // ============================================================
  // REVIEWED
  // ============================================================

  const isReviewed = (material) => {
    const review =
      getReviewForMaterial(material);

    if (review) {
      return true;
    }

    const materialId =
      getMaterialId(material);

    const form =
      reviewForms[materialId];

    if (!form) {
      return false;
    }

    return Boolean(
      form.authenticity?.trim() &&
      form.originality?.trim() &&
      form.coverage_of_subject?.trim() &&
      form.contribution_to_knowledge?.trim() &&
      form.relevance_to_discipline?.trim() &&
      form.presentation_quality?.trim() &&
      form.technical_recommendation?.trim() &&
      form.grade &&
      form.overall_quality?.trim() &&
      form.strengths?.trim() &&
      form.shortcomings?.trim() &&
      form.reviewer_name?.trim() &&
      form.reviewer_academic_rank?.trim() &&
      form.reviewer_affiliation?.trim() &&
      form.reviewer_signature_date
    );
  };

  // ============================================================
  // PROGRESS
  // ============================================================

  const reviewedCount =
    materials.filter(isReviewed).length;

  const totalMaterials =
    materials.length;

  const progress =
    totalMaterials > 0
      ? Math.round(
          (reviewedCount /
            totalMaterials) *
            100
        )
      : 0;

  const allMaterialsReviewed =
    totalMaterials > 0 &&
    reviewedCount === totalMaterials;

  // ============================================================
  // SUBMIT ACADEMIC MATERIAL REVIEW
  // ============================================================

  const submitMaterialReview = async (
    material
  ) => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const materialId =
        getMaterialId(material);

      const form =
        reviewForms[materialId] || {};

      const reviewerId =
        getAssignmentReviewerId(
          assignment
        );

      if (!materialId) {
        throw new Error(
          "Invalid academic material."
        );
      }

      if (!reviewerId) {
        throw new Error(
          "Reviewer ID could not be determined from the reviewer assignment."
        );
      }

      // ========================================================
      // VALIDATION
      // ========================================================

      const requiredFields = [
        [
          "authenticity",
          "Please provide an authenticity assessment.",
        ],
        [
          "originality",
          "Please provide an originality assessment.",
        ],
        [
          "coverage_of_subject",
          "Please provide coverage of subject assessment.",
        ],
        [
          "contribution_to_knowledge",
          "Please provide contribution to knowledge assessment.",
        ],
        [
          "relevance_to_discipline",
          "Please provide relevance to discipline assessment.",
        ],
        [
          "presentation_quality",
          "Please provide presentation quality assessment.",
        ],
        [
          "technical_recommendation",
          "Please provide technical recommendation.",
        ],
        [
          "overall_quality",
          "Please provide overall quality assessment.",
        ],
        [
          "strengths",
          "Please provide the strengths of the material.",
        ],
        [
          "shortcomings",
          "Please provide the shortcomings of the material.",
        ],
        [
          "reviewer_name",
          "Please provide reviewer name.",
        ],
        [
          "reviewer_academic_rank",
          "Please provide reviewer academic rank.",
        ],
        [
          "reviewer_affiliation",
          "Please provide reviewer affiliation.",
        ],
      ];

      for (const [field, message] of requiredFields) {
        if (!form[field]?.trim()) {
          throw new Error(message);
        }
      }

      if (!form.grade) {
        throw new Error(
          "Please select an academic grade."
        );
      }

      if (
        form.points === "" ||
        form.points === null ||
        form.points === undefined
      ) {
        throw new Error(
          "Please enter academic points."
        );
      }

      if (!form.reviewer_signature_date) {
        throw new Error(
          "Please provide the reviewer signature date."
        );
      }

      // ========================================================
      // PAYLOAD
      // EXACTLY MATCHES AcademicMaterialReview MODEL
      // ========================================================

      const payload = {
        material: Number(materialId),

        reviewer: Number(reviewerId),

        authenticity:
          form.authenticity.trim(),

        originality:
          form.originality.trim(),

        coverage_of_subject:
          form.coverage_of_subject.trim(),

        contribution_to_knowledge:
          form.contribution_to_knowledge.trim(),

        relevance_to_discipline:
          form.relevance_to_discipline.trim(),

        presentation_quality:
          form.presentation_quality.trim(),

        technical_recommendation:
          form.technical_recommendation.trim(),

        grade:
          form.grade,

        points:
          Number(form.points),

        overall_quality:
          form.overall_quality.trim(),

        strengths:
          form.strengths.trim(),

        shortcomings:
          form.shortcomings.trim(),

        reviewer_name:
          form.reviewer_name.trim(),

        reviewer_academic_rank:
          form.reviewer_academic_rank.trim(),

        reviewer_affiliation:
          form.reviewer_affiliation.trim(),

        reviewer_signature_date:
          form.reviewer_signature_date,
      };

      console.log(
        "Submitting AcademicMaterialReview:",
        payload
      );

      // ========================================================
      // CREATE OR UPDATE
      // ========================================================

      const existingReview =
        getReviewForMaterial(material);

      let response;

      if (existingReview?.id) {
        response = await axios.patch(
          `${API_URL}/academic-material-reviews/${existingReview.id}/`,
          payload,
          {
            headers,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/academic-material-reviews/`,
          payload,
          {
            headers,
          }
        );
      }

      console.log(
        "Academic material review saved:",
        response.data
      );

      setSuccess(
        existingReview?.id
          ? "Academic material review updated successfully."
          : "Academic material review saved successfully."
      );

      await initialize();

    } catch (err) {
      console.error(
        "Failed to save academic review:",
        err.response?.data || err
      );

      const backendError =
        err.response?.data;

      let message =
        "Failed to save academic material review.";

      if (typeof backendError === "string") {
        message = backendError;
      } else if (backendError?.detail) {
        message = backendError.detail;
      } else if (
        backendError &&
        typeof backendError === "object"
      ) {
        message = Object.entries(
          backendError
        )
          .map(
            ([field, value]) =>
              `${field}: ${
                Array.isArray(value)
                  ? value.join(", ")
                  : value
              }`
          )
          .join(" | ");
      } else if (err.message) {
        message = err.message;
      }

      setError(message);

    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // COMPLETE REVIEWER ASSIGNMENT
  // ============================================================

  const completeReviewerAssignment =
    async () => {
      try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        if (!allMaterialsReviewed) {
          throw new Error(
            "You must review every submitted academic material before completing the reviewer assessment."
          );
        }

        if (!assignmentId) {
          throw new Error(
            "Reviewer assignment ID is missing."
          );
        }

        const payload = {
          completed: true,
          review_status: "COMPLETED",
          status: "COMPLETED",
        };

        const response =
          await axios.patch(
            `${API_URL}/reviewer-assignments/${assignmentId}/`,
            payload,
            {
              headers,
            }
          );

        console.log(
          "Reviewer assignment completed:",
          response.data
        );

        setSuccess(
          "Reviewer assessment completed successfully."
        );

        setAssignment(
          response.data
        );

        try {
          const appResponse =
            await axios.get(
              `${API_URL}/applications/${applicationId}/`,
              {
                headers,
              }
            );

          setApplication(
            appResponse.data
          );
        } catch (refreshError) {
          console.error(
            "Failed to refresh application:",
            refreshError
          );
        }

      } catch (err) {
        console.error(
          "Failed to complete reviewer assignment:",
          err.response?.data || err
        );

        const backendError =
          err.response?.data;

        let message =
          "Failed to complete reviewer assessment.";

        if (backendError?.detail) {
          message = backendError.detail;
        } else if (
          backendError &&
          typeof backendError === "object"
        ) {
          message = Object.entries(
            backendError
          )
            .map(
              ([field, value]) =>
                `${field}: ${
                  Array.isArray(value)
                    ? value.join(", ")
                    : value
                }`
            )
            .join(" | ");
        } else if (err.message) {
          message = err.message;
        }

        setError(message);

      } finally {
        setSubmitting(false);
      }
    };

  // ============================================================
  // MATERIAL NAME
  // ============================================================

  const getMaterialName = (material) => {
    return (
      material.material_type_display ||
      material.material_type_name ||
      material.material_type ||
      material.title ||
      material.name ||
      material.description ||
      "Academic Material"
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
  // GRADE OPTIONS
  // MATCHES DJANGO MODEL
  // ============================================================

  const gradeOptions = [
    {
      value: "A",
      label: "A - Excellent",
    },
    {
      value: "B",
      label: "B - Very Good",
    },
    {
      value: "C",
      label: "C - Good",
    },
    {
      value: "D",
      label: "D - Poor",
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>

          <h2>
            Academic Material Review
          </h2>

          <p>
            Loading assigned promotion
            application...
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
          TOP NAVIGATION
      ====================================================== */}

      <div style={styles.topBar}>

        <button
          onClick={() =>
            navigate(
              "/reviewer/assigned-reviews"
            )
          }
          style={styles.backButton}
        >
          ← Assigned Reviews
        </button>

        <button
          onClick={() =>
            navigate(
              "/reviewer/dashboard"
            )
          }
          style={styles.dashboardButton}
        >
          Dashboard
        </button>

      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <div style={styles.formLabel}>
            FORM C
          </div>

          <h1 style={styles.title}>
            Academic Material Review
          </h1>

          <p style={styles.subtitle}>
            Academic assessment of submitted
            promotion materials.
          </p>

        </div>

        <div style={styles.headerStatus}>

          <span style={styles.statusCaption}>
            REVIEWER STATUS
          </span>

          <span
            style={
              getAssignmentStatus()
                .toUpperCase()
                .includes("COMPLETED")
                ? styles.completedBadge
                : styles.pendingBadge
            }
          >
            {getAssignmentStatus()}
          </span>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={styles.errorBox}>

          <strong>
            Error
          </strong>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              setError("")
            }
            style={styles.closeError}
          >
            ×
          </button>

        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div style={styles.successBox}>

          <strong>
            ✓ Success
          </strong>

          <span>
            {success}
          </span>

        </div>
      )}

      {/* ======================================================
          APPLICANT INFORMATION
      ====================================================== */}

      <div style={styles.card}>

        <div style={styles.cardHeader}>

          <div>

            <h2 style={styles.cardTitle}>
              Applicant Information
            </h2>

            <p style={styles.cardDescription}>
              This information comes from the
              assigned promotion application.
            </p>

          </div>

        </div>

        <div style={styles.infoGrid}>

          <InfoItem
            label="Application ID"
            value={`APP-${String(
              applicationId
            ).padStart(3, "0")}`}
          />

          <InfoItem
            label="Applicant"
            value={getApplicantName()}
          />

          <InfoItem
            label="Department"
            value={getDepartment()}
          />

          <InfoItem
            label="Current Rank"
            value={getCurrentRank()}
          />

          <InfoItem
            label="Promotion To"
            value={getTargetRank()}
          />

          <InfoItem
            label="Reviewer"
            value={getReviewerName()}
          />

        </div>

      </div>

      {/* ======================================================
          REVIEW PROGRESS
      ====================================================== */}

      <div style={styles.progressCard}>

        <div style={styles.progressHeader}>

          <div>

            <h2 style={styles.cardTitle}>
              Review Progress
            </h2>

            <p style={styles.cardDescription}>
              Review every promotion material
              before the reviewer status becomes
              COMPLETED.
            </p>

          </div>

          <strong
            style={styles.progressPercentage}
          >
            {progress}%
          </strong>

        </div>

        <div style={styles.progressBarBackground}>

          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`,
            }}
          />

        </div>

        <div style={styles.progressFooter}>

          <span>
            {reviewedCount} /{" "}
            {totalMaterials} reviewed
          </span>

          <span
            style={
              allMaterialsReviewed
                ? styles.progressComplete
                : styles.progressPending
            }
          >
            {allMaterialsReviewed
              ? "✓ Review completed"
              : "Review in progress"}
          </span>

        </div>

      </div>

      {/* ======================================================
          PROMOTION MATERIALS
      ====================================================== */}

      <div style={styles.card}>

        <div style={styles.cardHeader}>

          <div>

            <h2 style={styles.cardTitle}>
              Promotion Materials
            </h2>

            <p style={styles.cardDescription}>
              Review each submitted material
              individually.
            </p>

          </div>

          <div style={styles.materialCounter}>
            {reviewedCount} /{" "}
            {totalMaterials} reviewed
          </div>

        </div>

        {materials.length === 0 ? (

          <div style={styles.emptyBox}>

            <div style={styles.emptyIcon}>
              📄
            </div>

            <h3>
              No Promotion Materials
            </h3>

            <p>
              No promotion materials have
              been submitted for this
              application.
            </p>

            <div style={styles.debugBox}>

              <strong>
                Application:
              </strong>{" "}
              {applicationId}

              <br />

              <strong>
                Assignment:
              </strong>{" "}
              {assignmentId}

            </div>

          </div>

        ) : (

          <div style={styles.materialList}>

            {materials.map(
              (material, index) => {

                const materialId =
                  getMaterialId(
                    material
                  );

                const existingReview =
                  getReviewForMaterial(
                    material
                  );

                const form =
                  reviewForms[
                    materialId
                  ] || {};

                const reviewed =
                  Boolean(
                    existingReview
                  );

                return (
                  <div
                    key={
                      materialId ||
                      index
                    }
                    style={
                      reviewed
                        ? styles.materialCardReviewed
                        : styles.materialCard
                    }
                  >

                    {/* MATERIAL HEADER */}

                    <div style={styles.materialHeader}>

                      <div>

                        <span
                          style={
                            styles.materialNumber
                          }
                        >
                          MATERIAL{" "}
                          {index + 1}
                        </span>

                        <h3
                          style={
                            styles.materialTitle
                          }
                        >
                          {getMaterialName(
                            material
                          )}
                        </h3>

                      </div>

                      <span
                        style={
                          reviewed
                            ? styles.reviewedBadge
                            : styles.notReviewedBadge
                        }
                      >
                        {reviewed
                          ? "✓ REVIEWED"
                          : "NOT REVIEWED"}
                      </span>

                    </div>

                    {/* MATERIAL DETAILS */}

                    <div
                      style={
                        styles.materialDetails
                      }
                    >

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Points
                        </span>

                        <strong>
                          {material.points ??
                            material.score ??
                            "0"}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Submitted
                        </span>

                        <strong>
                          {material.created_at
                            ? new Date(
                                material.created_at
                              ).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span
                          style={
                            styles.detailLabel
                          }
                        >
                          Material ID
                        </span>

                        <strong>
                          {materialId}
                        </strong>
                      </div>

                    </div>

                    {/* DOCUMENT */}

                    <div style={styles.documentBox}>

                      {material.document ||
                      material.file ||
                      material.document_url ? (

                        <a
                          href={getDocumentUrl(
                            material.document ||
                              material.file ||
                              material.document_url
                          )}
                          target="_blank"
                          rel="noreferrer"
                          style={
                            styles.documentButton
                          }
                        >
                          📄 View Supporting
                          Document
                        </a>

                      ) : (

                        <span
                          style={
                            styles.noDocument
                          }
                        >
                          No supporting document
                          attached.
                        </span>

                      )}

                    </div>

                    {/* =================================================
                        ACADEMIC REVIEW FORM
                    ================================================= */}

                    <div
                      style={
                        styles.reviewForm
                      }
                    >

                      <h4
                        style={
                          styles.reviewFormTitle
                        }
                      >
                        Academic Assessment
                      </h4>

                      <div style={styles.formNotice}>
                        Complete all academic assessment
                        fields before saving this review.
                      </div>

                      {/* =================================================
                          1. AUTHENTICITY
                      ================================================= */}

                      <ReviewTextarea
                        number="1"
                        label="Authenticity"
                        required
                        value={
                          form.authenticity || ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "authenticity",
                            value
                          )
                        }
                        placeholder="Assess whether the material is authentic, genuine and properly attributed to the applicant..."
                      />

                      {/* =================================================
                          2. ORIGINALITY
                      ================================================= */}

                      <ReviewTextarea
                        number="2"
                        label="Originality"
                        required
                        value={
                          form.originality || ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "originality",
                            value
                          )
                        }
                        placeholder="Assess the originality, uniqueness and independent contribution of the work..."
                      />

                      {/* =================================================
                          3. COVERAGE
                      ================================================= */}

                      <ReviewTextarea
                        number="3"
                        label="Coverage of Subject"
                        required
                        value={
                          form.coverage_of_subject ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "coverage_of_subject",
                            value
                          )
                        }
                        placeholder="Assess how adequately the material covers the relevant subject area..."
                      />

                      {/* =================================================
                          4. CONTRIBUTION
                      ================================================= */}

                      <ReviewTextarea
                        number="4"
                        label="Contribution to Knowledge"
                        required
                        value={
                          form.contribution_to_knowledge ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "contribution_to_knowledge",
                            value
                          )
                        }
                        placeholder="Explain the contribution of this material to knowledge, research or academic practice..."
                      />

                      {/* =================================================
                          5. RELEVANCE
                      ================================================= */}

                      <ReviewTextarea
                        number="5"
                        label="Relevance to Discipline"
                        required
                        value={
                          form.relevance_to_discipline ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "relevance_to_discipline",
                            value
                          )
                        }
                        placeholder="Assess the relevance of the material to the applicant's academic discipline..."
                      />

                      {/* =================================================
                          6. PRESENTATION QUALITY
                      ================================================= */}

                      <ReviewTextarea
                        number="6"
                        label="Presentation Quality"
                        required
                        value={
                          form.presentation_quality ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "presentation_quality",
                            value
                          )
                        }
                        placeholder="Assess the quality, organization, clarity and professional presentation of the material..."
                      />

                      {/* =================================================
                          7. TECHNICAL RECOMMENDATION
                      ================================================= */}

                      <ReviewTextarea
                        number="7"
                        label="Technical Recommendation"
                        required
                        value={
                          form.technical_recommendation ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "technical_recommendation",
                            value
                          )
                        }
                        placeholder="Provide your technical recommendation concerning the academic quality and suitability of this material..."
                      />

                      {/* =================================================
                          GRADE + POINTS
                      ================================================= */}

                      <div
                        style={
                          styles.twoColumns
                        }
                      >

                        <div
                          style={
                            styles.field
                          }
                        >

                          <label
                            style={
                              styles.label
                            }
                          >
                            8. Academic Grade
                            <span>
                              *
                            </span>
                          </label>

                          <select
                            value={
                              form.grade ||
                              ""
                            }
                            onChange={(e) =>
                              updateForm(
                                materialId,
                                "grade",
                                e.target.value
                              )
                            }
                            style={
                              styles.select
                            }
                          >

                            <option value="">
                              Select grade
                            </option>

                            {gradeOptions.map(
                              (grade) => (
                                <option
                                  key={
                                    grade.value
                                  }
                                  value={
                                    grade.value
                                  }
                                >
                                  {grade.label}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div
                          style={
                            styles.field
                          }
                        >

                          <label
                            style={
                              styles.label
                            }
                          >
                            9. Points
                            <span>
                              *
                            </span>
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              form.points ??
                              ""
                            }
                            onChange={(e) =>
                              updateForm(
                                materialId,
                                "points",
                                e.target.value
                              )
                            }
                            placeholder="Enter points"
                            style={
                              styles.input
                            }
                          />

                        </div>

                      </div>

                      {/* =================================================
                          10. OVERALL QUALITY
                      ================================================= */}

                      <ReviewTextarea
                        number="10"
                        label="Overall Quality"
                        required
                        value={
                          form.overall_quality ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "overall_quality",
                            value
                          )
                        }
                        placeholder="Give your overall assessment of the academic quality of this material..."
                      />

                      {/* =================================================
                          11. STRENGTHS
                      ================================================= */}

                      <ReviewTextarea
                        number="11"
                        label="Strengths"
                        required
                        value={
                          form.strengths ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "strengths",
                            value
                          )
                        }
                        placeholder="Identify the major strengths of this academic material..."
                      />

                      {/* =================================================
                          12. SHORTCOMINGS
                      ================================================= */}

                      <ReviewTextarea
                        number="12"
                        label="Shortcomings"
                        required
                        value={
                          form.shortcomings ||
                          ""
                        }
                        onChange={(value) =>
                          updateForm(
                            materialId,
                            "shortcomings",
                            value
                          )
                        }
                        placeholder="Identify weaknesses, limitations or shortcomings that should be considered..."
                      />

                      {/* =================================================
                          REVIEWER INFORMATION
                      ================================================= */}

                      <div style={styles.reviewerSection}>

                        <h4
                          style={
                            styles.sectionTitle
                          }
                        >
                          Reviewer Information
                        </h4>

                        <div
                          style={
                            styles.twoColumns
                          }
                        >

                          <div
                            style={
                              styles.field
                            }
                          >

                            <label
                              style={
                                styles.label
                              }
                            >
                              Reviewer Name
                              <span>
                                *
                              </span>
                            </label>

                            <input
                              type="text"
                              value={
                                form.reviewer_name ||
                                ""
                              }
                              onChange={(e) =>
                                updateForm(
                                  materialId,
                                  "reviewer_name",
                                  e.target.value
                                )
                              }
                              placeholder="Reviewer full name"
                              style={
                                styles.input
                              }
                            />

                          </div>

                          <div
                            style={
                              styles.field
                            }
                          >

                            <label
                              style={
                                styles.label
                              }
                            >
                              Academic Rank
                              <span>
                                *
                              </span>
                            </label>

                            <input
                              type="text"
                              value={
                                form.reviewer_academic_rank ||
                                ""
                              }
                              onChange={(e) =>
                                updateForm(
                                  materialId,
                                  "reviewer_academic_rank",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Senior Lecturer"
                              style={
                                styles.input
                              }
                            />

                          </div>

                        </div>

                        <div
                          style={
                            styles.twoColumns
                          }
                        >

                          <div
                            style={
                              styles.field
                            }
                          >

                            <label
                              style={
                                styles.label
                              }
                            >
                              Affiliation
                              <span>
                                *
                              </span>
                            </label>

                            <input
                              type="text"
                              value={
                                form.reviewer_affiliation ||
                                ""
                              }
                              onChange={(e) =>
                                updateForm(
                                  materialId,
                                  "reviewer_affiliation",
                                  e.target.value
                                )
                              }
                              placeholder="University / Institution / Department"
                              style={
                                styles.input
                              }
                            />

                          </div>

                          <div
                            style={
                              styles.field
                            }
                          >

                            <label
                              style={
                                styles.label
                              }
                            >
                              Signature Date
                              <span>
                                *
                              </span>
                            </label>

                            <input
                              type="date"
                              value={
                                form.reviewer_signature_date ||
                                ""
                              }
                              onChange={(e) =>
                                updateForm(
                                  materialId,
                                  "reviewer_signature_date",
                                  e.target.value
                                )
                              }
                              style={
                                styles.input
                              }
                            />

                          </div>

                        </div>

                      </div>

                      {/* SAVE */}

                      <div
                        style={
                          styles.formActions
                        }
                      >

                        <button
                          disabled={
                            submitting
                          }
                          onClick={() =>
                            submitMaterialReview(
                              material
                            )
                          }
                          style={
                            styles.saveButton
                          }
                        >
                          {submitting
                            ? "Saving..."
                            : reviewed
                            ? "Update Academic Review"
                            : "Save Academic Review"}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* ======================================================
          COMPLETE REVIEWER ASSESSMENT
      ====================================================== */}

      <div
        style={
          allMaterialsReviewed
            ? styles.completeCard
            : styles.completeCardDisabled
        }
      >

        <div>

          <h2
            style={
              styles.completeTitle
            }
          >
            Complete Reviewer Assessment
          </h2>

          <p
            style={
              styles.completeDescription
            }
          >
            {allMaterialsReviewed
              ? "All submitted academic materials have been reviewed. You can now complete this reviewer assignment."
              : `You can complete this reviewer assignment only after every submitted academic material has been reviewed. ${reviewedCount} of ${totalMaterials} materials are currently reviewed.`}
          </p>

        </div>

        <button
          disabled={
            !allMaterialsReviewed ||
            submitting ||
            getAssignmentStatus()
              .toUpperCase()
              .includes("COMPLETED")
          }
          onClick={
            completeReviewerAssignment
          }
          style={
            allMaterialsReviewed
              ? styles.completeButton
              : styles.completeButtonDisabled
          }
        >
          {getAssignmentStatus()
            .toUpperCase()
            .includes("COMPLETED")
            ? "✓ Reviewer Completed"
            : submitting
            ? "Completing..."
            : "Complete Reviewer Assessment"}
        </button>

      </div>

      {/* ======================================================
          WORKFLOW
      ====================================================== */}

      <div style={styles.workflowCard}>

        <h3 style={styles.workflowTitle}>
          Promotion Workflow
        </h3>

        <div style={styles.workflow}>

          <WorkflowStep
            number="1"
            title="HOD"
            text="Departmental review"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="2"
            title="Dean"
            text="College review"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="3"
            title="Reviewer"
            text="Academic assessment"
            active
          />

          <WorkflowArrow />

          <WorkflowStep
            number="4"
            title="Student Evaluation"
            text="Teaching evaluation"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="5"
            title="Committee"
            text="Committee recommendation"
          />

          <WorkflowArrow />

          <WorkflowStep
            number="6"
            title="Final Decision"
            text="Promotion decision"
          />

        </div>

        <p style={styles.workflowNote}>
          After the reviewer and student evaluation
          stages are both completed, Django should
          automatically make the application eligible
          for Promotion Committee review.
        </p>

      </div>

    </div>
  );
}

// ============================================================
// REVIEW TEXTAREA
// ============================================================

function ReviewTextarea({
  number,
  label,
  required,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div style={styles.field}>

      <label style={styles.label}>
        {number}. {label}

        {required && (
          <span>
            *
          </span>
        )}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={styles.textarea}
        rows={4}
      />

    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
}) {
  return (
    <div style={styles.infoItem}>

      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>

    </div>
  );
}

// ============================================================
// WORKFLOW STEP
// ============================================================

function WorkflowStep({
  number,
  title,
  text,
  active,
}) {
  return (
    <div
      style={
        active
          ? styles.workflowStepActive
          : styles.workflowStep
      }
    >

      <div
        style={
          active
            ? styles.workflowCircleActive
            : styles.workflowCircle
        }
      >
        {number}
      </div>

      <strong>
        {title}
      </strong>

      <small>
        {text}
      </small>

    </div>
  );
}

// ============================================================
// WORKFLOW ARROW
// ============================================================

function WorkflowArrow() {
  return (
    <div style={styles.workflowArrow}>
      →
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "25px 30px 60px",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
  },

  topBar: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    padding: "8px 0",
  },

  dashboardButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: "7px",
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  header: {
    maxWidth: "1400px",
    margin: "0 auto 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  formLabel: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "5px 10px",
    borderRadius: "5px",
    fontSize: "11px",
    fontWeight: "800",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },

  headerStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "7px",
  },

  statusCaption: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "800",
  },

  completedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "800",
    fontSize: "12px",
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "800",
    fontSize: "12px",
  },

  card: {
    maxWidth: "1400px",
    margin: "0 auto 25px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    padding: "22px 25px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardDescription: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  infoGrid: {
    padding: "25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  infoItem: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
  },

  infoLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: "6px",
  },

  infoValue: {
    color: "#111827",
    fontSize: "14px",
  },

  progressCard: {
    maxWidth: "1400px",
    margin: "0 auto 25px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "24px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  progressPercentage: {
    color: "#1d4ed8",
    fontSize: "26px",
  },

  progressBarBackground: {
    height: "10px",
    background: "#dbeafe",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "20px",
  },

  progressBar: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "20px",
    transition: "width 0.3s ease",
  },

  progressFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    fontSize: "13px",
  },

  progressComplete: {
    color: "#15803d",
    fontWeight: "700",
  },

  progressPending: {
    color: "#92400e",
    fontWeight: "700",
  },

  materialCounter: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  materialList: {
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },

  materialCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },

  materialCardReviewed: {
    border: "1px solid #86efac",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fafffb",
  },

  materialHeader: {
    padding: "20px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },

  materialNumber: {
    display: "block",
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: "800",
    marginBottom: "5px",
  },

  materialTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  reviewedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  notReviewedBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  materialDetails: {
    padding: "15px 20px",
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    borderBottom: "1px solid #e5e7eb",
  },

  detailLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: "11px",
    marginBottom: "4px",
  },

  documentBox: {
    padding: "18px 20px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },

  documentButton: {
    display: "inline-block",
    textDecoration: "none",
    background: "#f3f4f6",
    color: "#2563eb",
    padding: "9px 14px",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "13px",
  },

  noDocument: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  reviewForm: {
    padding: "25px",
  },

  reviewFormTitle: {
    margin: "0 0 10px",
    color: "#1f2937",
    fontSize: "19px",
  },

  formNotice: {
    marginBottom: "25px",
    padding: "12px 15px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "7px",
    color: "#1e40af",
    fontSize: "13px",
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
    marginBottom: "7px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "11px 12px",
    fontSize: "14px",
    fontFamily: "Arial, Helvetica, sans-serif",
    resize: "vertical",
    outline: "none",
    minHeight: "100px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "11px 12px",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "11px 12px",
    background: "#fff",
    fontSize: "14px",
  },

  reviewerSection: {
    marginTop: "25px",
    padding: "20px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
  },

  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "16px",
    color: "#1f2937",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "10px",
  },

  saveButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: "700",
  },

  emptyBox: {
    textAlign: "center",
    padding: "70px 25px",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  debugBox: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 15px",
    background: "#f3f4f6",
    borderRadius: "7px",
    textAlign: "left",
    fontSize: "12px",
  },

  completeCard: {
    maxWidth: "1400px",
    margin: "0 auto 25px",
    padding: "25px",
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    flexWrap: "wrap",
  },

  completeCardDisabled: {
    maxWidth: "1400px",
    margin: "0 auto 25px",
    padding: "25px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    flexWrap: "wrap",
  },

  completeTitle: {
    margin: 0,
    color: "#166534",
    fontSize: "19px",
  },

  completeDescription: {
    margin: "7px 0 0",
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.5",
    maxWidth: "800px",
  },

  completeButton: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  completeButtonDisabled: {
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    padding: "12px 20px",
    borderRadius: "7px",
    cursor: "not-allowed",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  workflowCard: {
    maxWidth: "1400px",
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
  },

  workflowTitle: {
    marginTop: 0,
    color: "#1f2937",
  },

  workflow: {
    display: "flex",
    alignItems: "stretch",
    overflowX: "auto",
    paddingBottom: "10px",
  },

  workflowStep: {
    minWidth: "140px",
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "5px",
    background: "#f9fafb",
  },

  workflowStepActive: {
    minWidth: "140px",
    padding: "12px",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "5px",
    background: "#eff6ff",
  },

  workflowCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#6b7280",
  },

  workflowCircleActive: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#fff",
  },

  workflowArrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 10px",
    color: "#9ca3af",
    fontSize: "20px",
    minWidth: "25px",
  },

  workflowNote: {
    marginBottom: 0,
    marginTop: "20px",
    padding: "15px",
    background: "#eff6ff",
    borderRadius: "7px",
    color: "#374151",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  errorBox: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    position: "relative",
    padding: "15px 45px 15px 18px",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#991b1b",
  },

  successBox: {
    maxWidth: "1400px",
    margin: "0 auto 20px",
    padding: "15px 18px",
    background: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: "8px",
    color: "#166534",
    display: "flex",
    gap: "10px",
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
    maxWidth: "600px",
    margin: "120px auto",
    padding: "50px",
    background: "#fff",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },
};

export default ReviewMaterial;