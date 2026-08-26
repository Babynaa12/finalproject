import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

/*
|--------------------------------------------------------------------------
| Academic Material Review - Form C
|--------------------------------------------------------------------------
|
| Reviewer workflow:
|
| Assigned Review
|       ↓
| Application
|       ↓
| Applicant
|       ↓
| Promotion Materials
|       ↓
| Review every material
|       ↓
| Submit AcademicMaterialReview
|       ↓
| All materials reviewed?
|       ↓
| ReviewerAssignment = COMPLETED
|
|--------------------------------------------------------------------------
*/

function ReviewMaterial({ assignmentId: assignmentIdProp }) {
  // =====================================================================
  // AUTH
  // =====================================================================

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // =====================================================================
  // STATE
  // =====================================================================

  const [assignment, setAssignment] = useState(null);
  const [application, setApplication] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // =====================================================================
  // REVIEW FORM
  // =====================================================================

  const initialReview = {
    authenticity: "",
    originality: "",
    coverage_of_subject: "",
    contribution_to_knowledge: "",
    relevance_to_discipline: "",
    presentation_quality: "",
    technical_recommendation: "",

    grade: "",
    points: "",

    overall_quality: "",
    strengths: "",
    shortcomings: "",

    reviewer_name: "",
    reviewer_academic_rank: "",
    reviewer_affiliation: "",
    reviewer_signature_date: "",
  };

  const [reviewForm, setReviewForm] = useState(initialReview);

  // =====================================================================
  // HELPERS
  // =====================================================================

  const getName = (person) => {
    if (!person) return "N/A";

    if (typeof person === "string") return person;

    return (
      person.full_name ||
      person.name ||
      person.employee_name ||
      person.username ||
      `${person.first_name || ""} ${
        person.last_name || ""
      }`.trim() ||
      "N/A"
    );
  };

  const getDepartmentName = (department) => {
    if (!department) return "N/A";

    if (typeof department === "string") {
      return department;
    }

    return (
      department.name ||
      department.department_name ||
      department.title ||
      department.code ||
      "N/A"
    );
  };

  const getRank = (employee) => {
    if (!employee) return "N/A";

    return (
      employee.academic_rank ||
      employee.rank ||
      employee.position ||
      employee.current_rank ||
      employee.designation ||
      "N/A"
    );
  };

  const getApplicationId = (app) => {
    if (!app) return "N/A";

    return (
      app.application_number ||
      app.application_id ||
      app.reference_number ||
      app.reference ||
      app.id ||
      "N/A"
    );
  };

  const normalizeArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }

    if (data?.materials && Array.isArray(data.materials)) {
      return data.materials;
    }

    if (data?.reviews && Array.isArray(data.reviews)) {
      return data.reviews;
    }

    if (data?.assignments && Array.isArray(data.assignments)) {
      return data.assignments;
    }

    return [];
  };

  // =====================================================================
  // GET ASSIGNMENT ID
  // =====================================================================

  const getAssignmentId = () => {
    if (assignmentIdProp) {
      return assignmentIdProp;
    }

    const storedAssignmentId =
      localStorage.getItem("reviewer_assignment_id");

    if (storedAssignmentId) {
      return storedAssignmentId;
    }

    const params = new URLSearchParams(window.location.search);

    return (
      params.get("assignment") ||
      params.get("assignmentId") ||
      params.get("id")
    );
  };

  // =====================================================================
  // LOAD ASSIGNMENT
  // =====================================================================

  const loadAssignment = async () => {
    const assignmentId = getAssignmentId();

    if (!assignmentId) {
      throw new Error(
        "No reviewer assignment was selected."
      );
    }

    try {
      const response = await axios.get(
        `${API_URL}/reviewer-assignments/${assignmentId}/`,
        { headers }
      );

      console.log(
        "Reviewer assignment:",
        response.data
      );

      setAssignment(response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Failed to load reviewer assignment:",
        error.response?.data || error
      );

      throw new Error(
        "Unable to retrieve the assigned review."
      );
    }
  };

  // =====================================================================
  // LOAD REVIEWS
  // =====================================================================

  const loadReviews = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/academic-material-reviews/`,
        { headers }
      );

      const data = normalizeArray(response.data);

      console.log(
        "Academic material reviews:",
        data
      );

      setReviews(data);

      return data;
    } catch (error) {
      console.error(
        "Failed to load academic material reviews:",
        error.response?.data || error
      );

      setReviews([]);

      return [];
    }
  };

  // =====================================================================
  // FIND APPLICATION FROM ASSIGNMENT
  // =====================================================================

  const extractApplication = (assignmentData) => {
    if (!assignmentData) {
      return null;
    }

    if (assignmentData.application) {
      if (
        typeof assignmentData.application === "object"
      ) {
        return assignmentData.application;
      }
    }

    return null;
  };

  // =====================================================================
  // LOAD MATERIALS
  // =====================================================================

  const loadMaterials = async (applicationData) => {
    if (!applicationData) {
      setMaterials([]);
      return [];
    }

    /*
     * Different serializer implementations may expose materials as:
     *
     * application.materials
     * application.promotion_materials
     * application.application_materials
     */

    let embeddedMaterials =
      applicationData.materials ||
      applicationData.promotion_materials ||
      applicationData.application_materials;

    if (Array.isArray(embeddedMaterials)) {
      setMaterials(embeddedMaterials);
      return embeddedMaterials;
    }

    /*
     * If materials are not nested inside application,
     * try the promotion-materials endpoint.
     */

    try {
      const applicationId = applicationData.id;

      if (!applicationId) {
        setMaterials([]);
        return [];
      }

      const response = await axios.get(
        `${API_URL}/promotion-materials/`,
        {
          headers,
          params: {
            application: applicationId,
          },
        }
      );

      const data = normalizeArray(response.data);

      console.log(
        "Promotion materials:",
        data
      );

      setMaterials(data);

      return data;
    } catch (error) {
      console.error(
        "Failed to load promotion materials:",
        error.response?.data || error
      );

      /*
       * Some systems use:
       *
       * /api/promotion-materials/?promotion_application=<id>
       *
       * Try that as a fallback.
       */

      try {
        const applicationId = applicationData.id;

        const response = await axios.get(
          `${API_URL}/promotion-materials/`,
          {
            headers,
            params: {
              promotion_application: applicationId,
            },
          }
        );

        const data = normalizeArray(response.data);

        setMaterials(data);

        return data;
      } catch (secondError) {
        console.error(
          "Second material request failed:",
          secondError.response?.data || secondError
        );

        setMaterials([]);

        return [];
      }
    }
  };

  // =====================================================================
  // INITIALIZE
  // =====================================================================

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setError(
          "Your login session has expired. Please login again."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const assignmentData =
          await loadAssignment();

        const applicationData =
          extractApplication(
            assignmentData
          );

        setApplication(applicationData);

        await loadMaterials(applicationData);

        await loadReviews();
      } catch (error) {
        console.error(
          "Review page initialization failed:",
          error
        );

        setError(
          error.message ||
            "Unable to load the assigned review."
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token]);

  // =====================================================================
  // REVIEW MATCHING
  // =====================================================================

  const getReviewForMaterial = (materialId) => {
    if (!materialId) {
      return null;
    }

    return (
      reviews.find(
        (review) =>
          Number(review.material) ===
            Number(materialId) ||
          Number(review.material?.id) ===
            Number(materialId)
      ) || null
    );
  };

  // =====================================================================
  // PROGRESS
  // =====================================================================

  const reviewedCount = materials.filter(
    (material) =>
      getReviewForMaterial(material.id)
  ).length;

  const totalMaterials = materials.length;

  const progressPercentage =
    totalMaterials > 0
      ? Math.round(
          (reviewedCount / totalMaterials) * 100
        )
      : 0;

  const allMaterialsReviewed =
    totalMaterials > 0 &&
    reviewedCount === totalMaterials;

  // =====================================================================
  // MATERIAL TITLE
  // =====================================================================

  const getMaterialTitle = (material) => {
    return (
      material.title ||
      material.material_title ||
      material.name ||
      material.document_title ||
      `Promotion Material #${material.id}`
    );
  };

  // =====================================================================
  // MATERIAL TYPE
  // =====================================================================

  const getMaterialType = (material) => {
    return (
      material.material_type ||
      material.type ||
      material.category ||
      "Academic Material"
    );
  };

  // =====================================================================
  // MATERIAL FILE
  // =====================================================================

  const getMaterialFile = (material) => {
    return (
      material.pdf_file ||
      material.file ||
      material.document ||
      material.file_url ||
      material.pdf ||
      null
    );
  };

  // =====================================================================
  // OPEN REVIEW
  // =====================================================================

  const openReview = (material) => {
    setError("");
    setSuccess("");

    const existingReview =
      getReviewForMaterial(material.id);

    setSelectedMaterial(material);

    if (existingReview) {
      setReviewForm({
        authenticity:
          existingReview.authenticity || "",

        originality:
          existingReview.originality || "",

        coverage_of_subject:
          existingReview.coverage_of_subject || "",

        contribution_to_knowledge:
          existingReview.contribution_to_knowledge ||
          "",

        relevance_to_discipline:
          existingReview.relevance_to_discipline ||
          "",

        presentation_quality:
          existingReview.presentation_quality || "",

        technical_recommendation:
          existingReview.technical_recommendation ||
          "",

        grade:
          existingReview.grade || "",

        points:
          existingReview.points ?? "",

        overall_quality:
          existingReview.overall_quality || "",

        strengths:
          existingReview.strengths || "",

        shortcomings:
          existingReview.shortcomings || "",

        reviewer_name:
          existingReview.reviewer_name ||
          getName(assignment?.reviewer),

        reviewer_academic_rank:
          existingReview.reviewer_academic_rank ||
          getRank(assignment?.reviewer),

        reviewer_affiliation:
          existingReview.reviewer_affiliation ||
          "",

        reviewer_signature_date:
          existingReview.reviewer_signature_date ||
          "",
      });
    } else {
      setReviewForm({
        ...initialReview,

        reviewer_name:
          getName(assignment?.reviewer),

        reviewer_academic_rank:
          getRank(assignment?.reviewer),
      });
    }

    setShowReviewForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================================
  // CLOSE REVIEW
  // =====================================================================

  const closeReview = () => {
    setShowReviewForm(false);
    setSelectedMaterial(null);
    setError("");
  };

  // =====================================================================
  // FORM CHANGE
  // =====================================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setReviewForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================================
  // SUBMIT REVIEW
  // =====================================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!selectedMaterial) {
      setError(
        "Please select an academic material to review."
      );

      return;
    }

    if (!assignment) {
      setError(
        "Reviewer assignment could not be identified."
      );

      return;
    }

    if (!assignment.reviewer) {
      setError(
        "Reviewer information is missing from this assignment."
      );

      return;
    }

    if (!reviewForm.grade) {
      setError(
        "Please select an academic grade."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const existingReview =
        getReviewForMaterial(
          selectedMaterial.id
        );

      /*
       * IMPORTANT:
       *
       * The backend AcademicMaterialReview model
       * requires:
       *
       * material
       * reviewer
       *
       * All other fields are entered by the reviewer.
       */

      const payload = {
        material: Number(
          selectedMaterial.id
        ),

        reviewer: Number(
          typeof assignment.reviewer ===
            "object"
            ? assignment.reviewer.id
            : assignment.reviewer
        ),

        authenticity:
          reviewForm.authenticity,

        originality:
          reviewForm.originality,

        coverage_of_subject:
          reviewForm.coverage_of_subject,

        contribution_to_knowledge:
          reviewForm.contribution_to_knowledge,

        relevance_to_discipline:
          reviewForm.relevance_to_discipline,

        presentation_quality:
          reviewForm.presentation_quality,

        technical_recommendation:
          reviewForm.technical_recommendation,

        grade:
          reviewForm.grade,

        points:
          reviewForm.points
            ? Number(reviewForm.points)
            : 0,

        overall_quality:
          reviewForm.overall_quality,

        strengths:
          reviewForm.strengths,

        shortcomings:
          reviewForm.shortcomings,

        reviewer_name:
          reviewForm.reviewer_name,

        reviewer_academic_rank:
          reviewForm.reviewer_academic_rank,

        reviewer_affiliation:
          reviewForm.reviewer_affiliation,

        reviewer_signature_date:
          reviewForm.reviewer_signature_date ||
          null,
      };

      console.log(
        "Academic material review payload:",
        payload
      );

      let response;

      /*
       * Existing review = UPDATE
       * New review = CREATE
       */

      if (existingReview?.id) {
        response = await axios.put(
          `${API_URL}/academic-material-reviews/${existingReview.id}/`,
          payload,
          { headers }
        );
      } else {
        response = await axios.post(
          `${API_URL}/academic-material-reviews/`,
          payload,
          { headers }
        );
      }

      console.log(
        "Academic review saved:",
        response.data
      );

      setSuccess(
        "Academic material review submitted successfully."
      );

      await loadReviews();

      /*
       * Check whether all materials are now reviewed.
       */

      const refreshedReviews =
        await axios.get(
          `${API_URL}/academic-material-reviews/`,
          { headers }
        );

      const refreshedReviewData =
        normalizeArray(
          refreshedReviews.data
        );

      setReviews(
        refreshedReviewData
      );

      const newReviewedCount =
        materials.filter((material) =>
          refreshedReviewData.some(
            (review) =>
              Number(review.material) ===
              Number(material.id)
          )
        ).length;

      /*
       * If every material is reviewed,
       * mark reviewer assignment completed.
       */

      if (
        materials.length > 0 &&
        newReviewedCount ===
          materials.length
      ) {
        await completeAssignment();
      }

      setShowReviewForm(false);
      setSelectedMaterial(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Academic review submission failed:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      if (error.response?.data) {
        const backendData =
          error.response.data;

        if (
          typeof backendData ===
          "object"
        ) {
          const messages =
            Object.entries(
              backendData
            )
              .map(
                ([field, message]) =>
                  `${field}: ${
                    Array.isArray(message)
                      ? message.join(", ")
                      : message
                  }`
              )
              .join(" | ");

          setError(messages);
        } else {
          setError(
            String(backendData)
          );
        }
      } else {
        setError(
          "Failed to submit academic material review."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================================
  // COMPLETE ASSIGNMENT
  // =====================================================================

  const completeAssignment = async () => {
    if (!assignment?.id) {
      return;
    }

    try {
      /*
       * Your ReviewerAssignment model has:
       *
       * completed
       * completed_at
       *
       * completed_at is read-only in serializer.
       *
       * Therefore only send completed=true.
       */

      const response =
        await axios.patch(
          `${API_URL}/reviewer-assignments/${assignment.id}/`,
          {
            completed: true,
          },
          { headers }
        );

      console.log(
        "Reviewer assignment completed:",
        response.data
      );

      setAssignment(
        response.data
      );

      setSuccess(
        "All promotion materials have been reviewed. Your reviewer assignment is now COMPLETED."
      );
    } catch (error) {
      console.error(
        "Failed to complete reviewer assignment:",
        error.response?.data || error
      );

      /*
       * Do not fail the submitted material review
       * if assignment completion fails.
       */

      setSuccess(
        "All materials have been reviewed. The review was saved successfully."
      );
    }
  };

  // =====================================================================
  // STATUS
  // =====================================================================

  const assignmentCompleted =
    Boolean(assignment?.completed) ||
    allMaterialsReviewed;

  // =====================================================================
  // LOADING
  // =====================================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            ⟳
          </div>

          <h2>
            Loading Assigned Review
          </h2>

          <p>
            Please wait while we retrieve
            the promotion application and
            academic materials.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================================
  // NO ASSIGNMENT
  // =====================================================================

  if (!assignment) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <h2>
              Assigned Review Not Found
            </h2>

            <p>
              {error ||
                "No reviewer assignment could be found."}
            </p>

            <button
              onClick={() =>
                window.history.back()
              }
              style={styles.secondaryButton}
            >
              ← Assigned Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // PAGE
  // =====================================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div style={styles.topBar}>
          <button
            onClick={() =>
              window.history.back()
            }
            style={styles.backButton}
          >
            ← Assigned Reviews
          </button>

          <span
            style={
              assignmentCompleted
                ? styles.completedBadge
                : styles.pendingBadge
            }
          >
            {assignmentCompleted
              ? "COMPLETED"
              : "REVIEW IN PROGRESS"}
          </span>
        </div>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Academic Material Review
            </h1>

            <p style={styles.subtitle}>
              Form C — Academic assessment of
              submitted promotion materials.
            </p>
          </div>
        </div>

        {/* ============================================================
            ALERTS
        ============================================================ */}

        {error && (
          <div style={styles.error}>
            <strong>Error</strong>

            <div
              style={{
                marginTop: "6px",
              }}
            >
              {error}
            </div>
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* ============================================================
            APPLICANT INFORMATION
        ============================================================ */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Applicant Information
              </h2>

              <p style={styles.cardSubtitle}>
                This information comes from
                the assigned promotion
                application.
              </p>
            </div>

            <span style={styles.applicationBadge}>
              {getApplicationId(
                application
              )}
            </span>
          </div>

          <div style={styles.infoGrid}>

            <InfoItem
              label="Application ID"
              value={getApplicationId(
                application
              )}
            />

            <InfoItem
              label="Applicant"
              value={getName(
                application?.employee
              )}
            />

            <InfoItem
              label="Department"
              value={getDepartmentName(
                application?.employee
                  ?.department ||
                  application?.department
              )}
            />

            <InfoItem
              label="Current Rank"
              value={
                application?.current_rank ||
                application?.employee
                  ?.academic_rank ||
                application?.employee
                  ?.rank ||
                "N/A"
              }
            />

            <InfoItem
              label="Promotion To"
              value={
                application?.promotion_to ||
                application?.promoted_to ||
                application?.target_rank ||
                application?.applied_rank ||
                "N/A"
              }
            />

            <InfoItem
              label="Reviewer"
              value={getName(
                assignment.reviewer
              )}
            />

            <InfoItem
              label="Reviewer Status"
              value={
                assignmentCompleted
                  ? "COMPLETED"
                  : "PENDING"
              }
            />

            <InfoItem
              label="Materials Reviewed"
              value={`${reviewedCount} / ${totalMaterials}`}
            />

          </div>
        </div>

        {/* ============================================================
            REVIEW PROGRESS
        ============================================================ */}

        <div style={styles.card}>

          <div style={styles.progressHeader}>

            <div>
              <h2 style={styles.cardTitle}>
                Review Progress
              </h2>

              <p style={styles.cardSubtitle}>
                Review every promotion material
                before the reviewer status
                becomes COMPLETED.
              </p>
            </div>

            <strong style={styles.progressNumber}>
              {reviewedCount} /{" "}
              {totalMaterials}
            </strong>
          </div>

          <div style={styles.progressBackground}>
            <div
              style={{
                ...styles.progressBar,
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <div style={styles.progressFooter}>
            <span>
              {progressPercentage}% reviewed
            </span>

            <span>
              {assignmentCompleted
                ? "Review completed"
                : "Review in progress"}
            </span>
          </div>
        </div>

        {/* ============================================================
            REVIEW FORM
        ============================================================ */}

        {showReviewForm &&
          selectedMaterial && (
            <div style={styles.card}>

              <div style={styles.reviewFormHeader}>

                <div>
                  <span
                    style={styles.materialLabel}
                  >
                    REVIEWING MATERIAL
                  </span>

                  <h2
                    style={{
                      margin:
                        "5px 0 0",
                    }}
                  >
                    {getMaterialTitle(
                      selectedMaterial
                    )}
                  </h2>

                  <p
                    style={
                      styles.cardSubtitle
                    }
                  >
                    {getMaterialType(
                      selectedMaterial
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeReview}
                  style={
                    styles.secondaryButton
                  }
                >
                  Cancel
                </button>
              </div>

              {/* MATERIAL INFORMATION */}

              <div
                style={
                  styles.materialInformation
                }
              >
                <strong>
                  Material:
                </strong>

                <span>
                  {getMaterialTitle(
                    selectedMaterial
                  )}
                </span>

                {getMaterialFile(
                  selectedMaterial
                ) && (
                  <a
                    href={getMaterialFile(
                      selectedMaterial
                    )}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.fileLink}
                  >
                    View / Download Material
                  </a>
                )}
              </div>

              <form
                onSubmit={
                  handleSubmitReview
                }
              >

                {/* ==================================================
                    ACADEMIC ASSESSMENT
                ================================================== */}

                <div style={styles.section}>

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    1. Academic Assessment
                  </h3>

                  <ReviewTextarea
                    name="authenticity"
                    label="Authenticity"
                    value={
                      reviewForm.authenticity
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Assess whether the material appears authentic and genuinely produced by the applicant."
                    required
                  />

                  <ReviewTextarea
                    name="originality"
                    label="Originality"
                    value={
                      reviewForm.originality
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Assess the originality and uniqueness of the material."
                    required
                  />

                  <ReviewTextarea
                    name="coverage_of_subject"
                    label="Coverage of Subject"
                    value={
                      reviewForm.coverage_of_subject
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Comment on the depth and breadth of subject coverage."
                    required
                  />

                  <ReviewTextarea
                    name="contribution_to_knowledge"
                    label="Contribution to Knowledge"
                    value={
                      reviewForm.contribution_to_knowledge
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Explain the material's contribution to knowledge."
                    required
                  />

                  <ReviewTextarea
                    name="relevance_to_discipline"
                    label="Relevance to Discipline"
                    value={
                      reviewForm.relevance_to_discipline
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Assess relevance to the applicant's academic discipline."
                    required
                  />

                  <ReviewTextarea
                    name="presentation_quality"
                    label="Presentation Quality"
                    value={
                      reviewForm.presentation_quality
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Assess organization, clarity, academic presentation and quality."
                    required
                  />

                  <ReviewTextarea
                    name="technical_recommendation"
                    label="Technical Recommendation"
                    value={
                      reviewForm.technical_recommendation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Provide your technical recommendation regarding this material."
                    required
                  />

                </div>

                {/* ==================================================
                    GRADE
                ================================================== */}

                <div style={styles.section}>

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    2. Academic Grade
                  </h3>

                  <div style={styles.twoColumn}>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Academic Grade *
                      </label>

                      <select
                        name="grade"
                        value={
                          reviewForm.grade
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                        required
                      >
                        <option value="">
                          Select Grade
                        </option>

                        <option value="A">
                          A - Excellent
                        </option>

                        <option value="B">
                          B - Very Good
                        </option>

                        <option value="C">
                          C - Good
                        </option>

                        <option value="D">
                          D - Poor
                        </option>
                      </select>
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Points
                      </label>

                      <input
                        type="number"
                        name="points"
                        value={
                          reviewForm.points
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                        min="0"
                        step="0.01"
                        placeholder="Enter points"
                      />

                      <small
                        style={
                          styles.help
                        }
                      >
                        Enter the points according
                        to your institution's
                        approved assessment scale.
                      </small>
                    </div>

                  </div>

                </div>

                {/* ==================================================
                    OVERALL QUALITY
                ================================================== */}

                <div style={styles.section}>

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    3. Overall Assessment
                  </h3>

                  <ReviewTextarea
                    name="overall_quality"
                    label="Overall Quality"
                    value={
                      reviewForm.overall_quality
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Give your overall assessment of the material."
                    required
                  />

                  <ReviewTextarea
                    name="strengths"
                    label="Strengths"
                    value={
                      reviewForm.strengths
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Identify the major strengths of the material."
                  />

                  <ReviewTextarea
                    name="shortcomings"
                    label="Shortcomings"
                    value={
                      reviewForm.shortcomings
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Identify weaknesses or areas requiring improvement."
                  />

                </div>

                {/* ==================================================
                    REVIEWER INFORMATION
                ================================================== */}

                <div style={styles.section}>

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    4. Reviewer Information
                  </h3>

                  <div style={styles.twoColumn}>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Reviewer Name
                      </label>

                      <input
                        name="reviewer_name"
                        value={
                          reviewForm.reviewer_name
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Academic Rank
                      </label>

                      <input
                        name="reviewer_academic_rank"
                        value={
                          reviewForm.reviewer_academic_rank
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Affiliation
                      </label>

                      <input
                        name="reviewer_affiliation"
                        value={
                          reviewForm.reviewer_affiliation
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                        placeholder="University / Institution"
                      />
                    </div>

                    <div
                      style={
                        styles.formGroup
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Signature Date
                      </label>

                      <input
                        type="date"
                        name="reviewer_signature_date"
                        value={
                          reviewForm.reviewer_signature_date
                        }
                        onChange={
                          handleChange
                        }
                        style={
                          styles.input
                        }
                      />
                    </div>

                  </div>
                </div>

                {/* ==================================================
                    SUBMIT
                ================================================== */}

                <div
                  style={
                    styles.submitArea
                  }
                >

                  <button
                    type="button"
                    onClick={closeReview}
                    style={
                      styles.secondaryButton
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={
                      submitting
                        ? styles.disabledButton
                        : styles.primaryButton
                    }
                  >
                    {submitting
                      ? "Saving Review..."
                      : getReviewForMaterial(
                            selectedMaterial.id
                          )
                        ? "Update Review"
                        : "Submit Academic Review"}
                  </button>

                </div>

              </form>
            </div>
          )}

        {/* ============================================================
            MATERIALS
        ============================================================ */}

        {!showReviewForm && (
          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>
                <h2 style={styles.cardTitle}>
                  Promotion Materials
                </h2>

                <p
                  style={
                    styles.cardSubtitle
                  }
                >
                  Review each submitted material
                  individually.
                </p>
              </div>

              <span
                style={
                  styles.materialCount
                }
              >
                {reviewedCount} /{" "}
                {totalMaterials} reviewed
              </span>

            </div>

            {materials.length === 0 ? (
              <div style={styles.empty}>

                <div
                  style={
                    styles.emptyIcon
                  }
                >
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

              </div>
            ) : (
              <div
                style={
                  styles.materialList
                }
              >

                {materials.map(
                  (material, index) => {
                    const review =
                      getReviewForMaterial(
                        material.id
                      );

                    const isReviewed =
                      Boolean(review);

                    return (
                      <div
                        key={
                          material.id ||
                          index
                        }
                        style={
                          styles.materialCard
                        }
                      >

                        <div
                          style={
                            styles.materialNumber
                          }
                        >
                          {index + 1}
                        </div>

                        <div
                          style={
                            styles.materialContent
                          }
                        >

                          <div
                            style={
                              styles.materialTop
                            }
                          >

                            <div>
                              <h3
                                style={
                                  styles.materialTitle
                                }
                              >
                                {getMaterialTitle(
                                  material
                                )}
                              </h3>

                              <p
                                style={
                                  styles.materialType
                                }
                              >
                                {getMaterialType(
                                  material
                                )}
                              </p>
                            </div>

                            <span
                              style={
                                isReviewed
                                  ? styles.reviewedBadge
                                  : styles.notReviewedBadge
                              }
                            >
                              {isReviewed
                                ? "REVIEWED"
                                : "PENDING"}
                            </span>

                          </div>

                          {material.description && (
                            <p
                              style={
                                styles.materialDescription
                              }
                            >
                              {
                                material.description
                              }
                            </p>
                          )}

                          {isReviewed && (
                            <div
                              style={
                                styles.reviewSummary
                              }
                            >
                              <span>
                                Grade:{" "}
                                <strong>
                                  {
                                    review.grade
                                  }
                                </strong>
                              </span>

                              <span>
                                Points:{" "}
                                <strong>
                                  {
                                    review.points ??
                                    0
                                  }
                                </strong>
                              </span>
                            </div>
                          )}

                          <div
                            style={
                              styles.materialActions
                            }
                          >

                            {getMaterialFile(
                              material
                            ) && (
                              <a
                                href={getMaterialFile(
                                  material
                                )}
                                target="_blank"
                                rel="noreferrer"
                                style={
                                  styles.viewButton
                                }
                              >
                                View Material
                              </a>
                            )}

                            {!assignmentCompleted && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(
                                    material
                                  )
                                }
                                style={
                                  isReviewed
                                    ? styles.editButton
                                    : styles.primaryButton
                                }
                              >
                                {isReviewed
                                  ? "Edit Review"
                                  : "Review Material"}
                              </button>
                            )}

                            {assignmentCompleted &&
                              isReviewed && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      material
                                    )
                                  }
                                  style={
                                    styles.viewReviewButton
                                  }
                                >
                                  View Review
                                </button>
                              )}

                          </div>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}
          </div>
        )}

        {/* ============================================================
            GUIDANCE
        ============================================================ */}

        {!showReviewForm && (
          <div style={styles.guidance}>

            <h3
              style={
                styles.guidanceTitle
              }
            >
              Reviewer Guidance
            </h3>

            <ul>
              <li>
                Review every submitted
                academic material carefully.
              </li>

              <li>
                Assess authenticity and
                originality.
              </li>

              <li>
                Consider the material's
                contribution to knowledge.
              </li>

              <li>
                Consider its relevance to
                the applicant's discipline.
              </li>

              <li>
                Provide objective and
                evidence-based comments.
              </li>

              <li>
                Select the appropriate
                academic grade.
              </li>

              <li>
                Reviewer status becomes
                COMPLETED only after all
                materials are reviewed.
              </li>
            </ul>

          </div>
        )}

      </div>
    </div>
  );
}

// ========================================================================
// INFO ITEM
// ========================================================================

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value || "N/A"}
      </strong>
    </div>
  );
}

// ========================================================================
// REVIEW TEXTAREA
// ========================================================================

function ReviewTextarea({
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
        {required && (
          <span style={styles.required}>
            {" "}*
          </span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={5}
        style={styles.textarea}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

// ========================================================================
// STYLES
// ========================================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "30px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  loadingCard: {
    maxWidth: "650px",
    margin: "100px auto",
    background: "#ffffff",
    padding: "45px",
    borderRadius: "14px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  spinner: {
    fontSize: "35px",
    color: "#2563eb",
    marginBottom: "15px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    padding: 0,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "26px",
    marginBottom: "24px",
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "22px",
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
  },

  cardSubtitle: {
    color: "#64748b",
    margin: "7px 0 0",
    fontSize: "14px",
  },

  applicationBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "8px 13px",
    fontWeight: "700",
    fontSize: "13px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
  },

  infoItem: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "15px",
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "6px",
  },

  infoValue: {
    color: "#1f2937",
    fontSize: "14px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  progressNumber: {
    fontSize: "24px",
    color: "#2563eb",
  },

  progressBackground: {
    width: "100%",
    height: "10px",
    background: "#e5e7eb",
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
    marginTop: "9px",
    fontSize: "13px",
    color: "#64748b",
  },

  materialCount: {
    background: "#f1f5f9",
    color: "#334155",
    padding: "8px 13px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  materialList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  materialCard: {
    display: "flex",
    gap: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "11px",
    padding: "18px",
    background: "#ffffff",
  },

  materialNumber: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  materialContent: {
    flex: 1,
    minWidth: 0,
  },

  materialTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
  },

  materialTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "17px",
  },

  materialType: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  materialDescription: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  reviewedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  notReviewedBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  reviewSummary: {
    display: "flex",
    gap: "20px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    padding: "10px 13px",
    borderRadius: "7px",
    marginTop: "14px",
    color: "#475569",
    fontSize: "13px",
  },

  materialActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  editButton: {
    background: "#f59e0b",
    color: "#ffffff",
    border: "none",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  viewReviewButton: {
    background: "#475569",
    color: "#ffffff",
    border: "none",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  viewButton: {
    display: "inline-flex",
    alignItems: "center",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "9px 15px",
    borderRadius: "7px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "13px",
  },

  secondaryButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  disabledButton: {
    background: "#93c5fd",
    color: "#ffffff",
    border: "none",
    padding: "10px 17px",
    borderRadius: "7px",
    cursor: "not-allowed",
    fontWeight: "600",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "15px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  success: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "15px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  errorCard: {
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "35px",
    textAlign: "center",
    marginTop: "70px",
  },

  completedBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "7px 13px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "12px",
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "7px 13px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "12px",
  },

  guidance: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "30px",
  },

  guidanceTitle: {
    marginTop: 0,
    color: "#1e3a8a",
  },

  materialLabel: {
    fontSize: "11px",
    color: "#2563eb",
    fontWeight: "700",
    letterSpacing: "0.05em",
  },

  reviewFormHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "20px",
  },

  materialInformation: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "15px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  fileLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
    marginLeft: "auto",
  },

  section: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "25px",
    marginTop: "25px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1e3a8a",
    fontSize: "18px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },

  formGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "7px",
    fontSize: "14px",
  },

  required: {
    color: "#dc2626",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  help: {
    display: "block",
    color: "#64748b",
    marginTop: "6px",
    fontSize: "12px",
  },

  submitArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
    marginTop: "25px",
  },

  empty: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
};

export default ReviewMaterial;