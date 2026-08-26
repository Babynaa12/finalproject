
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

function TeachingEvaluations() {
  // ============================================================
  // STATE
  // ============================================================

  const [evaluations, setEvaluations] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ============================================================
  // FORM
  // ============================================================

  const initialForm = {
    instructor: "",
    department: "",
    degree_programme: "",
    faculty_institute_centre: "",
    semester: "",
    course_code: "",
    course_name: "",
    academic_year: "",

    course_outline_provided: "",
    learning_outcomes_provided: "",

    learning_outcome_1: "",
    learning_outcome_2: "",
    learning_outcome_3: "",
    learning_outcome_4: "",
    learning_outcome_5: "",
    learning_outcome_6: "",

    three_important_things_learned: "",

    provided_teaching_notes: false,
    provided_handouts: false,
    provided_articles: false,
    provided_reference_materials: false,
    provided_library_references: false,
    gave_assignments: false,
    provided_practicals: false,
    assigned_seminars: false,
    gave_tests: false,

    other_learning_method: "",
    best_learning_options: "",

    instructor_consultation_rating: "",

    encouraged_teamwork: "",
    teamwork_explanation: "",

    organized_lectures_rating: "",
    synthesized_material_rating: "",
    english_expression_rating: "",
    encouraged_questions_rating: "",
    consultation_availability_rating: "",
    feedback_rating: "",

    teaching_comments: "",
    continuous_assessment_comments: "",
    practical_comments: "",
    seminar_comments: "",
    other_comments: "",
  };

  const [form, setForm] = useState(initialForm);

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ============================================================
  // HELPER: GET NAME
  // ============================================================

  const getEmployeeName = (employee) => {
    if (!employee) {
      return "Unknown";
    }

    if (typeof employee === "string") {
      return employee;
    }

    return (
      employee.full_name ||
      employee.name ||
      employee.employee_name ||
      employee.username ||
      `${employee.first_name || ""} ${
        employee.last_name || ""
      }`.trim() ||
      "Unknown"
    );
  };

  // ============================================================
  // GET LOGGED-IN STUDENT
  // ============================================================

  const getLoggedInStudent = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          console.log("Stored logged-in user:", parsedUser);

          if (
            parsedUser?.id ||
            parsedUser?.employee_id ||
            parsedUser?.user_id
          ) {
            setStudent(parsedUser);
            return parsedUser;
          }
        } catch (error) {
          console.warn("Could not parse stored user.");
        }
      }

      // Try profile endpoint
      try {
        const response = await axios.get(
          `${API_URL}/profile/`,
          { headers }
        );

        console.log(
          "Logged-in student profile:",
          response.data
        );

        setStudent(response.data);

        return response.data;
      } catch (profileError) {
        console.warn(
          "Profile endpoint failed. Trying users/me..."
        );
      }

      // Try users/me endpoint
      const response = await axios.get(
        `${API_URL}/users/me/`,
        { headers }
      );

      console.log(
        "Logged-in student from users/me:",
        response.data
      );

      setStudent(response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Failed to retrieve logged-in student:",
        error
      );

      throw error;
    }
  };

  // ============================================================
  // GET STUDENT ID
  // ============================================================

  const getStudentId = () => {
    if (!student) {
      return null;
    }

    return (
      student.employee_id ||
      student.employee?.id ||
      student.id ||
      student.user_id ||
      student.user?.id ||
      null
    );
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // ============================================================

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);

      console.log(
        "Loading departments from backend..."
      );

      const response = await axios.get(
        `${API_URL}/departments/`,
        {
          headers,
        }
      );

      console.log(
        "Departments API response:",
        response.data
      );

      let data = response.data;

      // DRF pagination
      if (data?.results) {
        data = data.results;
      }

      // Some APIs return { departments: [...] }
      if (data?.departments) {
        data = data.departments;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      setDepartments(data);

      console.log(
        "Retrieved departments:",
        data
      );

      if (data.length === 0) {
        setError(
          "No departments were found in the backend."
        );
      }
    } catch (error) {
      console.error(
        "Failed to load departments:",
        error
      );

      console.error(
        "Department backend response:",
        error.response?.data
      );

      setDepartments([]);

      if (error.response?.status === 404) {
        setError(
          "Department API was not found. Make sure /api/departments/ exists in Django."
        );
      } else if (error.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to retrieve departments from the backend."
        );
      }
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ============================================================
  // GET DEPARTMENT NAME
  // ============================================================

  const getDepartmentName = (department) => {
    if (!department) {
      return "Unknown";
    }

    if (typeof department === "string") {
      return department;
    }

    return (
      department.name ||
      department.department_name ||
      department.title ||
      department.code ||
      `Department ${department.id}`
    );
  };

  // ============================================================
  // GET INSTRUCTORS
  // ============================================================

  const loadInstructors = async () => {
    try {
      setLoadingInstructors(true);

      const response = await axios.get(
        `${API_URL}/employees/`,
        {
          headers,
        }
      );

      console.log(
        "Employees API response:",
        response.data
      );

      let data = response.data;

      if (data?.results) {
        data = data.results;
      }

      if (data?.employees) {
        data = data.employees;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      const lecturerData = data.filter((item) => {
        const role = String(
          item.role ||
          item.user_role ||
          item.position ||
          item.employee_type ||
          item.employee_role ||
          ""
        ).toUpperCase();

        return (
          role.includes("LECTURER") ||
          role.includes("INSTRUCTOR") ||
          role.includes("TEACHER") ||
          role.includes("ACADEMIC") ||
          !role
        );
      });

      const finalInstructors =
        lecturerData.length > 0
          ? lecturerData
          : data;

      setInstructors(finalInstructors);

      console.log(
        "Retrieved instructors:",
        finalInstructors
      );
    } catch (error) {
      console.error(
        "Failed to load instructors:",
        error
      );

      setInstructors([]);

      setError(
        "Unable to retrieve lecturers from the backend."
      );
    } finally {
      setLoadingInstructors(false);
    }
  };

  // ============================================================
  // LOAD EXISTING EVALUATIONS
  // ============================================================

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/student-evaluations/`,
        {
          headers,
        }
      );

      console.log(
        "Evaluations API response:",
        response.data
      );

      let data = response.data;

      if (data?.results) {
        data = data.results;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      setEvaluations(data);
    } catch (error) {
      console.error(
        "Failed to load evaluations:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Failed to retrieve your teaching evaluations."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const initializePage = async () => {
      if (!token) {
        setError(
          "You are not logged in. Please login first."
        );

        setLoading(false);

        return;
      }

      try {
        await getLoggedInStudent();

        await Promise.all([
          loadEvaluations(),
          loadInstructors(),
          loadDepartments(),
        ]);
      } catch (error) {
        console.error(
          "Page initialization error:",
          error
        );

        setError(
          "Unable to retrieve your student information."
        );

        setLoading(false);
      }
    };

    initializePage();
  }, []);

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

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // STUDENT
    // ----------------------------------------------------------

    const studentId = getStudentId();

    if (!studentId) {
      setError(
        "Your student account could not be identified. Please login again."
      );

      return;
    }

    // ----------------------------------------------------------
    // INSTRUCTOR
    // ----------------------------------------------------------

    if (!form.instructor) {
      setError(
        "Please select the lecturer you want to evaluate."
      );

      return;
    }

    // ----------------------------------------------------------
    // DEPARTMENT
    // ----------------------------------------------------------

    if (!form.department) {
      setError(
        "Please select your department."
      );

      return;
    }

    // ----------------------------------------------------------
    // COURSE
    // ----------------------------------------------------------

    if (!form.course_code.trim()) {
      setError(
        "Please enter the course code."
      );

      return;
    }

    if (!form.course_name.trim()) {
      setError(
        "Please enter the course name."
      );

      return;
    }

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload = {
      student: Number(studentId),

      instructor: Number(form.instructor),

      // IMPORTANT:
      // Department is a ForeignKey.
      // Therefore submit the department ID.
      department: Number(form.department),

      degree_programme:
        form.degree_programme || null,

      faculty_institute_centre:
        form.faculty_institute_centre || null,

      semester:
        form.semester || null,

      course_code:
        form.course_code.trim(),

      course_name:
        form.course_name.trim(),

      academic_year:
        form.academic_year || null,

      course_outline_provided:
        form.course_outline_provided || null,

      learning_outcomes_provided:
        form.learning_outcomes_provided || null,

      learning_outcome_1:
        form.learning_outcome_1
          ? Number(form.learning_outcome_1)
          : null,

      learning_outcome_2:
        form.learning_outcome_2
          ? Number(form.learning_outcome_2)
          : null,

      learning_outcome_3:
        form.learning_outcome_3
          ? Number(form.learning_outcome_3)
          : null,

      learning_outcome_4:
        form.learning_outcome_4
          ? Number(form.learning_outcome_4)
          : null,

      learning_outcome_5:
        form.learning_outcome_5
          ? Number(form.learning_outcome_5)
          : null,

      learning_outcome_6:
        form.learning_outcome_6
          ? Number(form.learning_outcome_6)
          : null,

      three_important_things_learned:
        form.three_important_things_learned,

      provided_teaching_notes:
        form.provided_teaching_notes,

      provided_handouts:
        form.provided_handouts,

      provided_articles:
        form.provided_articles,

      provided_reference_materials:
        form.provided_reference_materials,

      provided_library_references:
        form.provided_library_references,

      gave_assignments:
        form.gave_assignments,

      provided_practicals:
        form.provided_practicals,

      assigned_seminars:
        form.assigned_seminars,

      gave_tests:
        form.gave_tests,

      other_learning_method:
        form.other_learning_method,

      best_learning_options:
        form.best_learning_options,

      instructor_consultation_rating:
        form.instructor_consultation_rating
          ? Number(
              form.instructor_consultation_rating
            )
          : null,

      encouraged_teamwork:
        form.encouraged_teamwork || null,

      teamwork_explanation:
        form.teamwork_explanation,

      organized_lectures_rating:
        form.organized_lectures_rating
          ? Number(
              form.organized_lectures_rating
            )
          : null,

      synthesized_material_rating:
        form.synthesized_material_rating
          ? Number(
              form.synthesized_material_rating
            )
          : null,

      english_expression_rating:
        form.english_expression_rating
          ? Number(
              form.english_expression_rating
            )
          : null,

      encouraged_questions_rating:
        form.encouraged_questions_rating
          ? Number(
              form.encouraged_questions_rating
            )
          : null,

      consultation_availability_rating:
        form.consultation_availability_rating
          ? Number(
              form.consultation_availability_rating
            )
          : null,

      feedback_rating:
        form.feedback_rating
          ? Number(
              form.feedback_rating
            )
          : null,

      teaching_comments:
        form.teaching_comments,

      continuous_assessment_comments:
        form.continuous_assessment_comments,

      practical_comments:
        form.practical_comments,

      seminar_comments:
        form.seminar_comments,

      other_comments:
        form.other_comments,
    };

    console.log(
      "Submitting teaching evaluation:",
      payload
    );

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/student-evaluations/`,
        payload,
        {
          headers,
        }
      );

      console.log(
        "Evaluation submitted:",
        response.data
      );

      setSuccess(
        "Teaching evaluation submitted successfully."
      );

      setShowForm(false);

      setForm(initialForm);

      await loadEvaluations();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Teaching evaluation submission error:",
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
          typeof backendData === "object"
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
          "Failed to submit teaching evaluation."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RATING SELECT
  // ============================================================

  const RatingSelect = ({
    name,
    label,
  }) => (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label}
      </label>

      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        style={styles.input}
      >
        <option value="">
          Select rating
        </option>

        <option value="5">
          5 - Excellent
        </option>

        <option value="4">
          4 - Very Good
        </option>

        <option value="3">
          3 - Good
        </option>

        <option value="2">
          2 - Satisfactory
        </option>

        <option value="1">
          1 - Poor
        </option>
      </select>
    </div>
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <h2>
            Loading Teaching Evaluations
          </h2>

          <p>
            Please wait while we retrieve
            your teaching evaluations...
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
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Student Teaching Evaluation
            </h1>

            <p style={styles.subtitle}>
              Confidential evaluation of
              teaching performance.
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
              style={styles.primaryButton}
            >
              + Evaluate Lecturer
            </button>
          )}
        </div>

        {/* ALERT */}

        {error && (
          <div style={styles.error}>
            <strong>Error</strong>
            <div style={{ marginTop: "5px" }}>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* STUDENT INFORMATION */}

        {student && (
          <div style={styles.studentCard}>

            <div>
              <span style={styles.smallLabel}>
                STUDENT NAME
              </span>

              <strong style={styles.studentName}>
                {getEmployeeName(student)}
              </strong>
            </div>

            <div>
              <span style={styles.smallLabel}>
                STUDENT ID
              </span>

              <strong>
                {getStudentId()}
              </strong>
            </div>

          </div>
        )}

        {/* ======================================================
            EVALUATION FORM
        ====================================================== */}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={styles.card}
          >

            {/* FORM HEADER */}

            <div style={styles.formHeader}>
              <div>
                <h2 style={{ margin: 0 }}>
                  Confidential Teaching
                  Evaluation
                </h2>

                <p style={styles.formDescription}>
                  Please provide an honest
                  evaluation of the lecturer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>

            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                1. Student Information
              </h3>

              <div style={styles.grid}>

                <div style={styles.infoField}>
                  <label>
                    Student Name
                  </label>

                  <strong>
                    {getEmployeeName(student)}
                  </strong>
                </div>

                <div style={styles.infoField}>
                  <label>
                    Student ID
                  </label>

                  <strong>
                    {getStudentId()}
                  </strong>
                </div>

              </div>
            </div>

            {/* ==================================================
                COURSE INFORMATION
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                2. Course Information
              </h3>

              <div style={styles.grid}>

                {/* LECTURER */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Lecturer / Instructor *
                  </label>

                  <select
                    name="instructor"
                    value={form.instructor}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      Select Lecturer
                    </option>

                    {instructors.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {getEmployeeName(item)}
                        </option>
                      )
                    )}
                  </select>

                  {loadingInstructors && (
                    <small style={styles.help}>
                      Loading lecturers...
                    </small>
                  )}

                </div>

                {/* DEPARTMENT FROM BACKEND */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Department *
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select Department"}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {getDepartmentName(
                            department
                          )}
                        </option>
                      )
                    )}
                  </select>

                  {loadingDepartments && (
                    <small style={styles.help}>
                      Retrieving departments
                      from backend...
                    </small>
                  )}

                  {!loadingDepartments &&
                    departments.length === 0 && (
                      <small style={styles.warning}>
                        No departments available.
                      </small>
                    )}

                </div>

                {/* DEGREE */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Degree Programme
                  </label>

                  <input
                    name="degree_programme"
                    value={
                      form.degree_programme
                    }
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g. BSc IT"
                  />

                </div>

                {/* FACULTY */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Faculty / Institute / Centre
                  </label>

                  <input
                    name="faculty_institute_centre"
                    value={
                      form.faculty_institute_centre
                    }
                    onChange={handleChange}
                    style={styles.input}
                  />

                </div>

                {/* SEMESTER */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Semester
                  </label>

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="">
                      Select Semester
                    </option>

                    <option value="Semester 1">
                      Semester 1
                    </option>

                    <option value="Semester 2">
                      Semester 2
                    </option>

                  </select>

                </div>

                {/* ACADEMIC YEAR */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Academic Year
                  </label>

                  <input
                    name="academic_year"
                    value={
                      form.academic_year
                    }
                    onChange={handleChange}
                    placeholder="2025/2026"
                    style={styles.input}
                  />

                </div>

                {/* COURSE CODE */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Course Code *
                  </label>

                  <input
                    name="course_code"
                    value={
                      form.course_code
                    }
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. BIT 301"
                  />

                </div>

                {/* COURSE NAME */}

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Course Name *
                  </label>

                  <input
                    name="course_name"
                    value={
                      form.course_name
                    }
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="e.g. Database Systems"
                  />

                </div>

              </div>
            </div>

            {/* ==================================================
                COURSE OUTLINE
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                3. Course Information Provided
              </h3>

              <div style={styles.grid}>

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Course Outline Provided?
                  </label>

                  <select
                    name="course_outline_provided"
                    value={
                      form.course_outline_provided
                    }
                    onChange={handleChange}
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

                <div style={styles.formGroup}>

                  <label style={styles.label}>
                    Learning Outcomes Provided?
                  </label>

                  <select
                    name="learning_outcomes_provided"
                    value={
                      form.learning_outcomes_provided
                    }
                    onChange={handleChange}
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

            {/* ==================================================
                LEARNING OUTCOMES
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                4. Learning Outcomes
              </h3>

              <div style={styles.grid}>

                <RatingSelect
                  name="learning_outcome_1"
                  label="Learning Outcome 1"
                />

                <RatingSelect
                  name="learning_outcome_2"
                  label="Learning Outcome 2"
                />

                <RatingSelect
                  name="learning_outcome_3"
                  label="Learning Outcome 3"
                />

                <RatingSelect
                  name="learning_outcome_4"
                  label="Learning Outcome 4"
                />

                <RatingSelect
                  name="learning_outcome_5"
                  label="Learning Outcome 5"
                />

                <RatingSelect
                  name="learning_outcome_6"
                  label="Learning Outcome 6"
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Three Important Things
                  You Learned
                </label>

                <textarea
                  name="three_important_things_learned"
                  value={
                    form.three_important_things_learned
                  }
                  onChange={handleChange}
                  rows="5"
                  style={styles.textarea}
                />

              </div>

            </div>

            {/* ==================================================
                TEACHING METHODS
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                5. Teaching and Learning Methods
              </h3>

              <div style={styles.checkboxGrid}>

                {[
                  [
                    "provided_teaching_notes",
                    "Teaching Notes",
                  ],
                  [
                    "provided_handouts",
                    "Handouts",
                  ],
                  [
                    "provided_articles",
                    "Articles",
                  ],
                  [
                    "provided_reference_materials",
                    "Reference Materials",
                  ],
                  [
                    "provided_library_references",
                    "Library References",
                  ],
                  [
                    "gave_assignments",
                    "Assignments",
                  ],
                  [
                    "provided_practicals",
                    "Practicals",
                  ],
                  [
                    "assigned_seminars",
                    "Seminars",
                  ],
                  [
                    "gave_tests",
                    "Tests",
                  ],
                ].map(
                  ([name, label]) => (
                    <label
                      key={name}
                      style={
                        styles.checkboxLabel
                      }
                    >
                      <input
                        type="checkbox"
                        name={name}
                        checked={
                          form[name]
                        }
                        onChange={
                          handleChange
                        }
                      />

                      {label}
                    </label>
                  )
                )}

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Other Learning Method
                </label>

                <textarea
                  name="other_learning_method"
                  value={
                    form.other_learning_method
                  }
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Best Learning Options
                </label>

                <textarea
                  name="best_learning_options"
                  value={
                    form.best_learning_options
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

            </div>

            {/* ==================================================
                INSTRUCTOR PERFORMANCE
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                6. Instructor Performance
              </h3>

              <div style={styles.grid}>

                <RatingSelect
                  name="instructor_consultation_rating"
                  label="Instructor Consultation"
                />

                <RatingSelect
                  name="organized_lectures_rating"
                  label="Organization of Lectures"
                />

                <RatingSelect
                  name="synthesized_material_rating"
                  label="Synthesis of Materials"
                />

                <RatingSelect
                  name="english_expression_rating"
                  label="English Expression"
                />

                <RatingSelect
                  name="encouraged_questions_rating"
                  label="Encouraged Questions"
                />

                <RatingSelect
                  name="consultation_availability_rating"
                  label="Consultation Availability"
                />

                <RatingSelect
                  name="feedback_rating"
                  label="Feedback"
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Did the instructor encourage
                  teamwork?
                </label>

                <select
                  name="encouraged_teamwork"
                  value={
                    form.encouraged_teamwork
                  }
                  onChange={handleChange}
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

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Explain Teamwork
                </label>

                <textarea
                  name="teamwork_explanation"
                  value={
                    form.teamwork_explanation
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

            </div>

            {/* ==================================================
                COMMENTS
            ================================================== */}

            <div style={styles.section}>

              <h3 style={styles.sectionTitle}>
                7. Student Comments
              </h3>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Teaching Comments
                </label>

                <textarea
                  name="teaching_comments"
                  value={
                    form.teaching_comments
                  }
                  onChange={handleChange}
                  rows="5"
                  style={styles.textarea}
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Continuous Assessment
                  Comments
                </label>

                <textarea
                  name="continuous_assessment_comments"
                  value={
                    form.continuous_assessment_comments
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Practical Comments
                </label>

                <textarea
                  name="practical_comments"
                  value={
                    form.practical_comments
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Seminar Comments
                </label>

                <textarea
                  name="seminar_comments"
                  value={
                    form.seminar_comments
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Other Comments
                </label>

                <textarea
                  name="other_comments"
                  value={
                    form.other_comments
                  }
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                />

              </div>

            </div>

            {/* ==================================================
                SUBMIT
            ================================================== */}

            <div style={styles.submitArea}>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                style={styles.cancelButton}
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
                  ? "Submitting..."
                  : "Submit Evaluation"}
              </button>

            </div>

          </form>
        )}

        {/* ======================================================
            EXISTING EVALUATIONS
        ====================================================== */}

        {!showForm && (
          <div style={styles.card}>

            <h2 style={styles.tableTitle}>
              My Teaching Evaluations
            </h2>

            {evaluations.length === 0 ? (
              <div style={styles.empty}>

                <h3>
                  No evaluations found
                </h3>

                <p>
                  You have not evaluated any
                  lecturer yet.
                </p>

                <button
                  onClick={() =>
                    setShowForm(true)
                  }
                  style={
                    styles.primaryButton
                  }
                >
                  Evaluate a Lecturer
                </button>

              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >

                <table
                  style={styles.table}
                >

                  <thead>
                    <tr>

                      <th style={styles.th}>
                        Lecturer
                      </th>

                      <th style={styles.th}>
                        Department
                      </th>

                      <th style={styles.th}>
                        Course
                      </th>

                      <th style={styles.th}>
                        Code
                      </th>

                      <th style={styles.th}>
                        Semester
                      </th>

                      <th style={styles.th}>
                        Academic Year
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {evaluations.map(
                      (evaluation) => (
                        <tr
                          key={
                            evaluation.id
                          }
                        >

                          <td style={styles.td}>

                            {typeof evaluation.instructor ===
                            "object"
                              ? getEmployeeName(
                                  evaluation.instructor
                                )
                              : evaluation.instructor_name ||
                                "N/A"}

                          </td>

                          <td style={styles.td}>

                            {typeof evaluation.department ===
                            "object"
                              ? getDepartmentName(
                                  evaluation.department
                                )
                              : evaluation.department_name ||
                                "N/A"}

                          </td>

                          <td style={styles.td}>
                            {
                              evaluation.course_name
                            }
                          </td>

                          <td style={styles.td}>
                            {
                              evaluation.course_code
                            }
                          </td>

                          <td style={styles.td}>
                            {
                              evaluation.semester ||
                              "N/A"
                            }
                          </td>

                          <td style={styles.td}>
                            {
                              evaluation.academic_year ||
                              "N/A"
                            }
                          </td>

                          <td style={styles.td}>

                            <span
                              style={
                                styles.completed
                              }
                            >
                              Completed
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

      </div>
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
    padding: "30px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
  },

  loading: {
    maxWidth: "700px",
    margin: "100px auto",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  studentCard: {
    display: "flex",
    gap: "50px",
    flexWrap: "wrap",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "18px 22px",
    borderRadius: "10px",
    marginBottom: "25px",
  },

  smallLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "5px",
  },

  studentName: {
    display: "block",
    color: "#1e3a8a",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  disabledButton: {
    background: "#93c5fd",
    color: "#ffffff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "not-allowed",
    fontWeight: "600",
  },

  cancelButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
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

  warning: {
    display: "block",
    color: "#b45309",
    marginTop: "6px",
  },

  help: {
    display: "block",
    color: "#64748b",
    marginTop: "6px",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  formDescription: {
    color: "#6b7280",
    marginBottom: 0,
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
    fontSize: "19px",
  },

  grid: {
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

  infoField: {
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },

  checkboxGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    cursor: "pointer",
  },

  submitArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
    marginTop: "20px",
  },

  tableTitle: {
    marginTop: 0,
    color: "#111827",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },

  th: {
    textAlign: "left",
    padding: "13px",
    background: "#f1f5f9",
    color: "#374151",
    borderBottom: "1px solid #d1d5db",
    fontSize: "13px",
  },

  td: {
    padding: "13px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#6b7280",
  },
};

export default TeachingEvaluations;
