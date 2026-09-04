import { useEffect, useState } from "react";
import api from "../../services/api";

function ApplyPromotion() {
  // ============================================================
  // LOGGED-IN EMPLOYEE
  // ============================================================

  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const user = getLoggedInUser();

  const employeeId =
    user?.id ||
    user?.employee_id ||
    user?.employee?.id ||
    "";

  const fullName =
    user?.full_name ||
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  // ============================================================
  // JOB TITLES
  // ============================================================

  const [jobTitles, setJobTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(true);

  // ============================================================
  // FORM
  // ============================================================

  const getInitialForm = () => ({
    current_title: user?.job_title ? String(user.job_title) : "",
    targeted_title: "",

    full_name: fullName,

    date_of_birth: "",
    nationality: "",
    date_of_appointment_at_suza: "",
    position_at_first_appointment: user?.first_appointment_position
      ? String(user.first_appointment_position)
      : "",
    employment_status: user?.employment_status || "",
    present_position: user?.job_title
      ? String(user.job_title)
      : "",
    date_of_current_position:
      user?.current_position_appointment_date || "",

    applied_same_rank_before: "",
    previous_application_date: "",
    intends_new_publications: "",

    applicant_declaration: false,
    applicant_signature_date: "",
  });

  const [form, setForm] = useState(getInitialForm);

  // ============================================================
  // MAIN DOCUMENTS
  // ============================================================

  const [cv, setCv] = useState(null);
  const [additionalDocuments, setAdditionalDocuments] =
    useState(null);

  // ============================================================
  // PROMOTION MATERIALS
  // ============================================================

  const initialMaterials = [
    {
      material_type: "JOURNAL_ARTICLE",
      label: "Journal Articles",
      points: "",
      document: null,
    },
    {
      material_type: "BOOK_CHAPTER",
      label: "Chapters in a Book",
      points: "",
      document: null,
    },
    {
      material_type: "SCHOLARLY_BOOK",
      label: "Scholarly Books",
      points: "",
      document: null,
    },
    {
      material_type: "INTERNATIONAL_PROCEEDINGS",
      label:
        "Scholarly Papers in Proceedings of Professional International Symposia or Conferences",
      points: "",
      document: null,
    },
    {
      material_type: "CASE_REPORT",
      label: "Case Reports or Short Communications",
      points: "",
      document: null,
    },
    {
      material_type: "PATENT",
      label: "Patents",
      points: "",
      document: null,
    },
    {
      material_type: "CONSULTANCY_REPORT",
      label: "Consultancy Reports",
      points: "",
      document: null,
    },
    {
      material_type: "CONFERENCE_PAPER",
      label: "Conference Papers",
      points: "",
      document: null,
    },
    {
      material_type: "EXTENSION_MATERIAL",
      label: "Extension Materials",
      points: "",
      document: null,
    },
    {
      material_type: "LOWER_LEVEL_BOOK",
      label: "Lower-level Books",
      points: "",
      document: null,
    },
    {
      material_type: "DICTIONARY",
      label: "Subject and General Dictionaries",
      points: "",
      document: null,
    },
    {
      material_type: "DICTIONARY_LETTER",
      label: "Letters in Dictionaries",
      points: "",
      document: null,
    },
    {
      material_type: "BOOK_REVIEW",
      label: "Book Reviews",
      points: "",
      document: null,
    },
    {
      material_type: "JOURNAL_REVIEW",
      label: "Journal Articles Review",
      points: "",
      document: null,
    },
  ];

  const [materials, setMaterials] =
    useState(initialMaterials);

  // ============================================================
  // UI
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FETCH JOB TITLES
  // ============================================================

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      setLoadingTitles(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/api/jobtitles/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobTitles(response.data || []);
    } catch (err) {
      console.error(
        "Failed to load job titles:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load job titles."
      );
    } finally {
      setLoadingTitles(false);
    }
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  // ============================================================
  // MATERIAL POINTS
  // ============================================================

  const handleMaterialPoints = (index, value) => {
    if (
      value !== "" &&
      Number(value) < 0
    ) {
      return;
    }

    setMaterials((prev) =>
      prev.map((material, i) =>
        i === index
          ? {
              ...material,
              points: value,
            }
          : material
      )
    );

    setError("");
  };

  // ============================================================
  // MATERIAL DOCUMENT
  // ============================================================

  const handleMaterialDocument = (
    index,
    file
  ) => {
    if (!file) {
      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      setError(
        "Only PDF files are allowed."
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Each PDF file must not exceed 10 MB."
      );
      return;
    }

    setMaterials((prev) =>
      prev.map((material, i) =>
        i === index
          ? {
              ...material,
              document: file,
            }
          : material
      )
    );

    setError("");
  };

  // ============================================================
  // TOTAL MATERIAL POINTS
  // DISPLAY ONLY
  // Backend should be responsible for final calculation.
  // ============================================================

  const totalMaterialPoints =
    materials.reduce(
      (total, material) => {
        const points = parseFloat(
          material.points
        );

        return (
          total +
          (Number.isNaN(points)
            ? 0
            : points)
        );
      },
      0
    );

  // ============================================================
  // MAIN FILE VALIDATION
  // ============================================================

  const handleFileChange =
    (setter) =>
    (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        setter(null);
        return;
      }

      if (
        file.type !==
        "application/pdf"
      ) {
        setError(
          "Only PDF files are allowed."
        );

        e.target.value = "";
        setter(null);

        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "File size must not exceed 10 MB."
        );

        e.target.value = "";
        setter(null);

        return;
      }

      setter(file);
      setError("");
    };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!employeeId) {
      setError(
        "Employee information was not found. Please logout and login again."
      );

      return false;
    }

    if (!form.current_title) {
      setError(
        "Please select your current position."
      );

      return false;
    }

    if (!form.targeted_title) {
      setError(
        "Please select the position you are applying for."
      );

      return false;
    }

    if (
      String(form.current_title) ===
      String(form.targeted_title)
    ) {
      setError(
        "Current position and target position cannot be the same."
      );

      return false;
    }

    if (!cv) {
      setError(
        "Please upload your Curriculum Vitae (CV)."
      );

      return false;
    }

    if (
      !form.applicant_declaration
    ) {
      setError(
        "You must accept the applicant declaration before submitting."
      );

      return false;
    }

    if (
      form.applicant_signature_date === ""
    ) {
      setError(
        "Please provide the declaration signature date."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      current_title: user?.job_title
        ? String(user.job_title)
        : "",

      targeted_title: "",

      full_name: fullName,

      date_of_birth: "",
      nationality: "",
      date_of_appointment_at_suza: "",
      position_at_first_appointment:
        user?.first_appointment_position
          ? String(
              user.first_appointment_position
            )
          : "",

      employment_status:
        user?.employment_status || "",

      present_position:
        user?.job_title
          ? String(user.job_title)
          : "",

      date_of_current_position:
        user?.current_position_appointment_date ||
        "",

      applied_same_rank_before: "",
      previous_application_date: "",
      intends_new_publications: "",

      applicant_declaration: false,
      applicant_signature_date: "",
    });

    setCv(null);
    setAdditionalDocuments(null);

    setMaterials(
      initialMaterials.map(
        (material) => ({
          ...material,
          points: "",
          document: null,
        })
      )
    );

    document
      .querySelectorAll(
        'input[type="file"]'
      )
      .forEach((input) => {
        input.value = "";
      });
  };

  // ============================================================
  // SUBMIT APPLICATION
  // ============================================================

  const submitApplication = async (
    e
  ) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const data =
        new FormData();

      // ========================================================
      // IMPORTANT:
      // Only this employee is submitting this application.
      // No academic evaluation or previous application data
      // is sent from this page.
      // ========================================================

      data.append(
        "employee",
        String(employeeId)
      );

      // ========================================================
      // POSITION
      // ========================================================

      data.append(
        "current_title",
        String(form.current_title)
      );

      data.append(
        "targeted_title",
        String(form.targeted_title)
      );

      // ========================================================
      // PERSONAL PARTICULARS
      // ========================================================

      data.append(
        "full_name",
        form.full_name || fullName
      );

      if (form.date_of_birth) {
        data.append(
          "date_of_birth",
          form.date_of_birth
        );
      }

      if (form.nationality) {
        data.append(
          "nationality",
          form.nationality
        );
      }

      if (
        form.date_of_appointment_at_suza
      ) {
        data.append(
          "date_of_appointment_at_suza",
          form.date_of_appointment_at_suza
        );
      }

      if (
        form.position_at_first_appointment
      ) {
        data.append(
          "position_at_first_appointment",
          String(
            form.position_at_first_appointment
          )
        );
      }

      if (form.employment_status) {
        data.append(
          "employment_status",
          form.employment_status
        );
      }

      if (form.present_position) {
        data.append(
          "present_position",
          String(
            form.present_position
          )
        );
      }

      if (
        form.date_of_current_position
      ) {
        data.append(
          "date_of_current_position",
          form.date_of_current_position
        );
      }

      if (
        form.applied_same_rank_before
      ) {
        data.append(
          "applied_same_rank_before",
          form.applied_same_rank_before
        );
      }

      if (
        form.previous_application_date
      ) {
        data.append(
          "previous_application_date",
          form.previous_application_date
        );
      }

      if (
        form.intends_new_publications
      ) {
        data.append(
          "intends_new_publications",
          form.intends_new_publications
        );
      }

      // ========================================================
      // CV
      // ========================================================

      data.append("cv", cv);

      // ========================================================
      // ADDITIONAL DOCUMENT
      // ========================================================

      if (additionalDocuments) {
        data.append(
          "additional_documents",
          additionalDocuments
        );
      }

      // ========================================================
      // PROMOTION MATERIALS
      //
      // IMPORTANT:
      // We send a JSON description of the selected materials.
      // Files are sent separately.
      //
      // This avoids:
      // promotion_materials[0][material_type]
      // promotion_materials[0][points]
      // promotion_materials[0][document]
      //
      // which DRF multipart parsing does not handle reliably.
      // ========================================================

      const selectedMaterials =
        materials
          .map(
            (material, index) => ({
              ...material,
              originalIndex: index,
            })
          )
          .filter(
            (material) =>
              material.points !== "" ||
              material.document !== null
          );

      const materialData =
        selectedMaterials.map(
          (material) => ({
            material_type:
              material.material_type,

            points:
              material.points === ""
                ? "0"
                : material.points,

            file_index:
              material.document
                ? material.originalIndex
                : null,
          })
        );

      // ----------------------------------------------------------------
      // Send material payload in both compatible formats:
      // 1) JSON string: backend may parse as a list of materials
      // 2) indexed field names: easier for DRF serializers / reviewers
      // ----------------------------------------------------------------
      data.append(
        "promotion_materials",
        JSON.stringify(materialData)
      );

      materialData.forEach(
        (item, index) => {
          data.append(
            `promotion_materials[${index}][material_type]`,
            item.material_type
          );
          data.append(
            `promotion_materials[${index}][points]`,
            String(item.points)
          );
          if (item.file_index !== null) {
            data.append(
              `promotion_materials[${index}][file_index]`,
              String(item.file_index)
            );
          }
        }
      );

      // ========================================================
      // SEND MATERIAL FILES SEPARATELY
      //
      // Example:
      // material_document_0
      // material_document_1
      // ========================================================

      selectedMaterials.forEach(
        (material) => {
          if (material.document) {
            data.append(
              `material_document_${material.originalIndex}`,
              material.document
            );
          }
        }
      );

      // ========================================================
      // DO NOT SEND PREVIOUS ACADEMIC REVIEWS
      // DO NOT SEND STUDENT EVALUATIONS
      // DO NOT SEND REVIEW RECORDS
      //
      // The application endpoint should only create:
      // 1. PromotionApplication
      // 2. PromotionMaterial records
      // ========================================================

      data.append(
        "applicant_declaration",
        form.applicant_declaration
          ? "true"
          : "false"
      );

      data.append(
        "applicant_signature_date",
        form.applicant_signature_date
      );

      // ========================================================
      // DEBUG
      // ========================================================

      console.log(
        "Submitting promotion application for employee:",
        employeeId
      );

      console.log(
        "Selected promotion materials:",
        materialData
      );

      // ========================================================
      // POST
      // ========================================================

      const response =
        await api.post(
          "/api/applications/",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      console.log(
        "Application created:",
        response.data
      );

      // ========================================================
      // SUCCESS
      // ========================================================

      setSuccess(
        "Promotion application submitted successfully. Please wait for the next stage of review."
      );

      // ========================================================
      // RESET
      // ========================================================

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(
        "Promotion submission error:",
        err.response?.data || err
      );

      const backendError =
        err.response?.data;

      if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        const messages =
          Object.entries(
            backendError
          )
            .map(
              ([field, message]) => {
                if (
                  Array.isArray(
                    message
                  )
                ) {
                  return `${field}: ${message.join(
                    ", "
                  )}`;
                }

                if (
                  typeof message ===
                  "object"
                ) {
                  return `${field}: ${JSON.stringify(
                    message
                  )}`;
                }

                return `${field}: ${message}`;
              }
            )
            .join(" | ");

        setError(
          messages ||
            "Failed to submit promotion application."
        );
      } else if (
        backendError
      ) {
        setError(
          String(backendError)
        );
      } else {
        setError(
          err.message ||
            "Failed to submit promotion application. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>
        <h2 style={styles.title}>
          Promotion Application
        </h2>

        <p style={styles.subtitle}>
          Complete your personal particulars,
          promotion materials, supporting
          documents and declaration.
        </p>
      </div>

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div style={styles.success}>
          ✓ {success}
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ======================================================
          EMPLOYEE INFORMATION
      ====================================================== */}

      <div style={styles.employeeBox}>
        <div>
          <strong>
            Employee:
          </strong>{" "}
          {fullName || "Not available"}
        </div>

        <div>
          <strong>
            Employee ID:
          </strong>{" "}
          {employeeId || "Not available"}
        </div>
      </div>

      <form
        onSubmit={submitApplication}
      >

        {/* ====================================================
            SECTION 1
        ==================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            1. Present and Target Position
          </h3>

          <div style={styles.grid}>

            {/* CURRENT POSITION */}

            <div>
              <label style={styles.label}>
                Current Position *
              </label>

              <select
                name="current_title"
                value={
                  form.current_title
                }
                onChange={
                  handleChange
                }
                required
                disabled={
                  loadingTitles
                }
                style={styles.input}
              >
                <option value="">
                  {loadingTitles
                    ? "Loading positions..."
                    : "Select Current Position"}
                </option>

                {jobTitles.map(
                  (job) => (
                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {
                        job.title_name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* TARGET POSITION */}

            <div>
              <label style={styles.label}>
                Position Applied For *
              </label>

              <select
                name="targeted_title"
                value={
                  form.targeted_title
                }
                onChange={
                  handleChange
                }
                required
                disabled={
                  loadingTitles
                }
                style={styles.input}
              >
                <option value="">
                  Select Target Position
                </option>

                {jobTitles
                  .filter(
                    (job) =>
                      String(
                        job.id
                      ) !==
                      String(
                        form.current_title
                      )
                  )
                  .map(
                    (job) => (
                      <option
                        key={job.id}
                        value={job.id}
                      >
                        {
                          job.title_name
                        }
                      </option>
                    )
                  )}
              </select>
            </div>

          </div>
        </div>

        {/* ====================================================
            SECTION 2
        ==================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            2. Personal Particulars
          </h3>

          <div style={styles.grid}>

            {/* FULL NAME */}

            <div>
              <label style={styles.label}>
                Full Name
              </label>

              <input
                type="text"
                value={
                  form.full_name
                }
                readOnly
                style={{
                  ...styles.input,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            {/* DATE OF BIRTH */}

            <div>
              <label style={styles.label}>
                Date of Birth
              </label>

              <input
                type="date"
                name="date_of_birth"
                value={
                  form.date_of_birth
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              />
            </div>

            {/* NATIONALITY */}

            <div>
              <label style={styles.label}>
                Nationality
              </label>

              <input
                type="text"
                name="nationality"
                value={
                  form.nationality
                }
                onChange={
                  handleChange
                }
                placeholder="Enter nationality"
                style={styles.input}
              />
            </div>

            {/* APPOINTMENT */}

            <div>
              <label style={styles.label}>
                Date of Appointment at SUZA
              </label>

              <input
                type="date"
                name="date_of_appointment_at_suza"
                value={
                  form.date_of_appointment_at_suza
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              />
            </div>

            {/* EMPLOYMENT STATUS */}

            <div>
              <label style={styles.label}>
                Employment Status
              </label>

              <input
                type="text"
                name="employment_status"
                value={
                  form.employment_status
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Permanent"
                style={styles.input}
              />
            </div>

            {/* FIRST APPOINTMENT */}

            <div>
              <label style={styles.label}>
                Position at First Appointment
              </label>

              <select
                name="position_at_first_appointment"
                value={
                  form.position_at_first_appointment
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              >
                <option value="">
                  Select Position
                </option>

                {jobTitles.map(
                  (job) => (
                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {
                        job.title_name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* PRESENT POSITION */}

            <div>
              <label style={styles.label}>
                Present Position
              </label>

              <select
                name="present_position"
                value={
                  form.present_position
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              >
                <option value="">
                  Select Position
                </option>

                {jobTitles.map(
                  (job) => (
                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {
                        job.title_name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* CURRENT POSITION DATE */}

            <div>
              <label style={styles.label}>
                Date of Current Position
              </label>

              <input
                type="date"
                name="date_of_current_position"
                value={
                  form.date_of_current_position
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              />
            </div>

            {/* SAME RANK */}

            <div>
              <label style={styles.label}>
                Applied for Same Rank Before?
              </label>

              <select
                name="applied_same_rank_before"
                value={
                  form.applied_same_rank_before
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              >
                <option value="">
                  Select
                </option>

                <option value="YES">
                  Yes
                </option>

                <option value="NO">
                  No
                </option>
              </select>
            </div>

            {/* PREVIOUS APPLICATION */}

            <div>
              <label style={styles.label}>
                Previous Application Date
              </label>

              <input
                type="date"
                name="previous_application_date"
                value={
                  form.previous_application_date
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              />
            </div>

            {/* NEW PUBLICATIONS */}

            <div>
              <label style={styles.label}>
                Intend to Publish New Materials?
              </label>

              <select
                name="intends_new_publications"
                value={
                  form.intends_new_publications
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              >
                <option value="">
                  Select
                </option>

                <option value="YES">
                  Yes
                </option>

                <option value="NO">
                  No
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* ====================================================
            SECTION 3
        ==================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            3. Promotion Materials
          </h3>

          <p style={styles.help}>
            Enter the claimed points and upload
            supporting evidence for each material.
            The final score should be verified by
            the appropriate reviewer according to
            the promotion guidelines.
          </p>

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    S/No
                  </th>

                  <th style={styles.th}>
                    Promotion Material
                  </th>

                  <th style={styles.th}>
                    Claimed Points
                  </th>

                  <th style={styles.th}>
                    Supporting Document
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
                        material.material_type
                      }
                    >

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      <td style={styles.td}>
                        {
                          material.label
                        }
                      </td>

                      <td style={styles.td}>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            material.points
                          }
                          onChange={(e) =>
                            handleMaterialPoints(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="0"
                          style={
                            styles.pointsInput
                          }
                        />

                      </td>

                      <td style={styles.td}>

                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            handleMaterialDocument(
                              index,
                              e.target.files?.[0]
                            )
                          }
                          style={
                            styles.smallFileInput
                          }
                        />

                        {material.document && (
                          <small
                            style={
                              styles.fileName
                            }
                          >
                            ✓{" "}
                            {
                              material
                                .document
                                .name
                            }
                          </small>
                        )}

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
                    Total Claimed Points
                  </td>

                  <td
                    colSpan="2"
                    style={
                      styles.totalPoints
                    }
                  >
                    {totalMaterialPoints.toFixed(
                      2
                    )}
                  </td>

                </tr>

              </tfoot>

            </table>
          </div>
        </div>

        {/* ====================================================
            SECTION 4
        ==================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            4. Supporting Documents
          </h3>

          <p style={styles.help}>
            PDF files only. Maximum size:
            10 MB per document.
          </p>

          {/* CV */}

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              Curriculum Vitae (CV) *
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(
                setCv
              )}
              style={
                styles.fileInput
              }
              required
            />

            {cv && (
              <small
                style={
                  styles.fileName
                }
              >
                ✓ Selected:{" "}
                {cv.name}
              </small>
            )}

          </div>

          {/* ADDITIONAL */}

          <div style={styles.fileGroup}>

            <label style={styles.label}>
              Additional Documents
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(
                setAdditionalDocuments
              )}
              style={
                styles.fileInput
              }
            />

            {additionalDocuments && (
              <small
                style={
                  styles.fileName
                }
              >
                ✓ Selected:{" "}
                {
                  additionalDocuments.name
                }
              </small>
            )}

          </div>

        </div>

        {/* ====================================================
            SECTION 5
        ==================================================== */}

        <div style={styles.section}>

          <h3 style={styles.sectionTitle}>
            5. Applicant Declaration
          </h3>

          <label
            style={
              styles.checkboxContainer
            }
          >

            <input
              type="checkbox"
              name="applicant_declaration"
              checked={
                form.applicant_declaration
              }
              onChange={
                handleChange
              }
            />

            <span>
              I declare that the
              information and documents
              submitted in this promotion
              application are true and
              accurate to the best of my
              knowledge.
            </span>

          </label>

          <div
            style={{
              marginTop: "20px",
              maxWidth: "400px",
            }}
          >

            <label style={styles.label}>
              Signature Date *
            </label>

            <input
              type="date"
              name="applicant_signature_date"
              value={
                form.applicant_signature_date
              }
              onChange={
                handleChange
              }
              style={styles.input}
              required
            />

          </div>

        </div>

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading
              ? 0.7
              : 1,
          }}
          disabled={
            loading ||
            loadingTitles
          }
        >
          {loading
            ? "Submitting Promotion..."
            : "Submit Promotion Application"}
        </button>

      </form>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "30px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.08)",
  },

  header: {
    marginBottom: "25px",
    borderBottom:
      "1px solid #eee",
    paddingBottom: "20px",
  },

  title: {
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    margin: 0,
  },

  employeeBox: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "15px 18px",
    marginBottom: "25px",
    background: "#eff6ff",
    border:
      "1px solid #bfdbfe",
    borderRadius: "8px",
    color: "#1e3a8a",
  },

  section: {
    marginBottom: "30px",
    padding: "22px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "10px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1f2937",
    fontSize: "18px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "7px",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    background: "#fff",
  },

  fileInput: {
    width: "100%",
    padding: "10px",
    border:
      "1px dashed #9ca3af",
    borderRadius: "7px",
    boxSizing: "border-box",
    background: "#f9fafb",
  },

  smallFileInput: {
    width: "190px",
    fontSize: "12px",
  },

  fileGroup: {
    marginBottom: "20px",
  },

  fileName: {
    display: "block",
    marginTop: "6px",
    color: "#2563eb",
    fontSize: "12px",
  },

  help: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "18px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "800px",
  },

  th: {
    padding: "12px",
    border:
      "1px solid #d1d5db",
    background: "#f3f4f6",
    textAlign: "left",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    border:
      "1px solid #e5e7eb",
    verticalAlign: "middle",
  },

  pointsInput: {
    width: "100px",
    padding: "9px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
  },

  totalLabel: {
    padding: "14px",
    border:
      "1px solid #d1d5db",
    textAlign: "right",
    fontWeight: "bold",
    background: "#f9fafb",
  },

  totalPoints: {
    padding: "14px",
    border:
      "1px solid #d1d5db",
    fontWeight: "bold",
    color: "#2563eb",
    background: "#eff6ff",
  },

  success: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
  },

  error: {
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },

  checkboxContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    lineHeight: "1.5",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ApplyPromotion;
