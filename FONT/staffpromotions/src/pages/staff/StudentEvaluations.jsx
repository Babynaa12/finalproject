import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

function PeerReviews() {
  // ============================================================
  // STATE
  // ============================================================

  const [evaluations, setEvaluations] = useState([]);
  const [staff, setStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [error, setError] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

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
  // HELPER - GET NAME
  // ============================================================

  const getName = (person) => {
    if (!person) {
      return "Unknown";
    }

    if (typeof person === "string") {
      return person;
    }

    return (
      person.full_name ||
      person.name ||
      person.employee_name ||
      person.username ||
      `${person.first_name || ""} ${
        person.last_name || ""
      }`.trim() ||
      "Unknown"
    );
  };

  // ============================================================
  // HELPER - GET ID
  // ============================================================

  const getPersonId = (person) => {
    if (!person) {
      return null;
    }

    if (typeof person === "number") {
      return person;
    }

    if (typeof person === "string") {
      const number = Number(person);
      return Number.isNaN(number) ? null : number;
    }

    return (
      person.id ||
      person.employee_id ||
      person.user_id ||
      person.employee?.id ||
      person.user?.id ||
      null
    );
  };

  // ============================================================
  // GET LOGGED-IN STAFF
  // ============================================================

  const loadStaffProfile = async () => {
    try {
      setLoadingProfile(true);

      // --------------------------------------------------------
      // First try localStorage
      // --------------------------------------------------------

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          console.log(
            "Stored logged-in staff:",
            parsedUser
          );

          if (
            parsedUser?.id ||
            parsedUser?.employee_id ||
            parsedUser?.user_id
          ) {
            setStaff(parsedUser);

            return parsedUser;
          }
        } catch (storageError) {
          console.warn(
            "Unable to parse stored user."
          );
        }
      }

      // --------------------------------------------------------
      // Try profile endpoint
      // --------------------------------------------------------

      try {
        const response = await axios.get(
          `${API_URL}/profile/`,
          {
            headers,
          }
        );

        console.log(
          "Staff profile:",
          response.data
        );

        setStaff(response.data);

        return response.data;
      } catch (profileError) {
        console.warn(
          "Profile endpoint failed."
        );
      }

      // --------------------------------------------------------
      // Try users/me
      // --------------------------------------------------------

      const response = await axios.get(
        `${API_URL}/users/me/`,
        {
          headers,
        }
      );

      console.log(
        "Logged-in staff from users/me:",
        response.data
      );

      setStaff(response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Failed to retrieve staff profile:",
        error
      );

      throw error;
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================================
  // LOAD EVALUATIONS
  // ============================================================

  const loadEvaluations = async (staffData) => {
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
        "Student evaluations response:",
        response.data
      );

      let data = response.data;

      // DRF pagination
      if (data?.results) {
        data = data.results;
      }

      // Alternative API response
      if (data?.evaluations) {
        data = data.evaluations;
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      // ========================================================
      // LOGGED-IN STAFF ID
      // ========================================================

      const staffId = getPersonId(staffData);

      console.log(
        "Logged-in staff ID:",
        staffId
      );

      // ========================================================
      // FILTER ONLY EVALUATIONS FOR THIS STAFF MEMBER
      // ========================================================

      const staffEvaluations = data.filter(
        (evaluation) => {
          const instructorId =
            getPersonId(
              evaluation.instructor
            );

          return (
            staffId &&
            instructorId &&
            Number(instructorId) ===
              Number(staffId)
          );
        }
      );

      console.log(
        "Evaluations belonging to logged-in staff:",
        staffEvaluations
      );

      setEvaluations(
        staffEvaluations
      );
    } catch (error) {
      console.error(
        "Failed to load teaching evaluations:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      if (
        error.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        setError(
          "You are not authorized to view teaching evaluations."
        );
      } else {
        setError(
          "Failed to retrieve teaching evaluations."
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
    const initialize = async () => {
      if (!token) {
        setError(
          "You are not logged in. Please login first."
        );

        setLoading(false);
        return;
      }

      try {
        const profile =
          await loadStaffProfile();

        await loadEvaluations(profile);
      } catch (error) {
        console.error(
          "Initialization error:",
          error
        );

        setError(
          "Unable to retrieve your staff information."
        );

        setLoading(false);
      }
    };

    initialize();
  }, []);

  // ============================================================
  // DEPARTMENT NAME
  // ============================================================

  const getDepartmentName = (
    department
  ) => {
    if (!department) {
      return "N/A";
    }

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

  // ============================================================
  // COURSE NAME
  // ============================================================

  const getCourseName = (
    evaluation
  ) => {
    return (
      evaluation.course_name ||
      evaluation.course ||
      "N/A"
    );
  };

  // ============================================================
  // COURSE CODE
  // ============================================================

  const getCourseCode = (
    evaluation
  ) => {
    return (
      evaluation.course_code ||
      evaluation.code ||
      "N/A"
    );
  };

  // ============================================================
  // FILTER OPTIONS
  // ============================================================

  const courseOptions = useMemo(() => {
    const values = evaluations
      .map((evaluation) =>
        getCourseCode(evaluation)
      )
      .filter(
        (value) =>
          value &&
          value !== "N/A"
      );

    return [
      ...new Set(values),
    ];
  }, [evaluations]);

  const academicYearOptions =
    useMemo(() => {
      const values = evaluations
        .map(
          (evaluation) =>
            evaluation.academic_year
        )
        .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [evaluations]);

  // ============================================================
  // FILTERED EVALUATIONS
  // ============================================================

  const filteredEvaluations =
    useMemo(() => {
      return evaluations.filter(
        (evaluation) => {
          const courseName =
            getCourseName(
              evaluation
            ).toLowerCase();

          const courseCode =
            getCourseCode(
              evaluation
            ).toLowerCase();

          const searchValue =
            search.toLowerCase();

          const matchesSearch =
            !searchValue ||
            courseName.includes(
              searchValue
            ) ||
            courseCode.includes(
              searchValue
            );

          const matchesCourse =
            !courseFilter ||
            getCourseCode(
              evaluation
            ) === courseFilter;

          const matchesYear =
            !yearFilter ||
            evaluation.academic_year ===
              yearFilter;

          return (
            matchesSearch &&
            matchesCourse &&
            matchesYear
          );
        }
      );
    }, [
      evaluations,
      search,
      courseFilter,
      yearFilter,
    ]);

  // ============================================================
  // CALCULATE OVERALL RATING
  // ============================================================

  const calculateOverallRating =
    (evaluation) => {
      const fields = [
        "learning_outcome_1",
        "learning_outcome_2",
        "learning_outcome_3",
        "learning_outcome_4",
        "learning_outcome_5",
        "learning_outcome_6",
        "instructor_consultation_rating",
        "organized_lectures_rating",
        "synthesized_material_rating",
        "english_expression_rating",
        "encouraged_questions_rating",
        "consultation_availability_rating",
        "feedback_rating",
      ];

      const ratings = fields
        .map((field) =>
          Number(
            evaluation[field]
          )
        )
        .filter(
          (value) =>
            !Number.isNaN(value) &&
            value > 0
        );

      if (ratings.length === 0) {
        return null;
      }

      const total = ratings.reduce(
        (sum, value) =>
          sum + value,
        0
      );

      return (
        total / ratings.length
      ).toFixed(2);
    };

  // ============================================================
  // RATING LABEL
  // ============================================================

  const getRatingLabel = (
    value
  ) => {
    const rating = Number(value);

    if (!rating) {
      return "Not rated";
    }

    if (rating === 5) {
      return "Excellent";
    }

    if (rating === 4) {
      return "Very Good";
    }

    if (rating === 3) {
      return "Good";
    }

    if (rating === 2) {
      return "Satisfactory";
    }

    if (rating === 1) {
      return "Poor";
    }

    return String(value);
  };

  // ============================================================
  // RATING BADGE
  // ============================================================

  const RatingBadge = ({
    value,
  }) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return (
        <span
          style={styles.notRated}
        >
          Not rated
        </span>
      );
    }

    return (
      <span
        style={styles.ratingBadge}
      >
        {value} -{" "}
        {getRatingLabel(value)}
      </span>
    );
  };

  // ============================================================
  // VIEW EVALUATION
  // ============================================================

  const openEvaluation = (
    evaluation
  ) => {
    setSelectedEvaluation(
      evaluation
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // CLOSE EVALUATION
  // ============================================================

  const closeEvaluation = () => {
    setSelectedEvaluation(null);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading ||
    loadingProfile
  ) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            ⟳
          </div>

          <h2>
            Loading Teaching Evaluations
          </h2>

          <p>
            Retrieving evaluations submitted
            by students...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // SELECTED EVALUATION VIEW
  // ============================================================

  if (selectedEvaluation) {
    const evaluation =
      selectedEvaluation;

    const overallRating =
      calculateOverallRating(
        evaluation
      );

    return (
      <div style={styles.page}>
        <div style={styles.container}>

          {/* HEADER */}

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Teaching Evaluation
              </h1>

              <p
                style={
                  styles.subtitle
                }
              >
                Detailed student evaluation
                of your teaching performance.
              </p>
            </div>

            <button
              onClick={
                closeEvaluation
              }
              style={
                styles.secondaryButton
              }
            >
              ← Back to Evaluations
            </button>
          </div>

          {/* CONFIDENTIAL NOTICE */}

          <div
            style={
              styles.confidentialBox
            }
          >
            <strong>
              Confidential Evaluation
            </strong>

            <p>
              This evaluation contains
              feedback submitted by a
              student. Student identity is
              intentionally not displayed.
            </p>
          </div>

          {/* COURSE INFORMATION */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Course Information
            </h2>

            <div style={styles.infoGrid}>

              <InfoItem
                label="Lecturer"
                value={getName(
                  evaluation.instructor
                )}
              />

              <InfoItem
                label="Department"
                value={getDepartmentName(
                  evaluation.department
                )}
              />

              <InfoItem
                label="Course"
                value={getCourseName(
                  evaluation
                )}
              />

              <InfoItem
                label="Course Code"
                value={getCourseCode(
                  evaluation
                )}
              />

              <InfoItem
                label="Semester"
                value={
                  evaluation.semester ||
                  "N/A"
                }
              />

              <InfoItem
                label="Academic Year"
                value={
                  evaluation.academic_year ||
                  "N/A"
                }
              />

              <InfoItem
                label="Degree Programme"
                value={
                  evaluation.degree_programme ||
                  "N/A"
                }
              />

              <InfoItem
                label="Faculty / Institute"
                value={
                  evaluation.faculty_institute_centre ||
                  "N/A"
                }
              />

            </div>
          </div>

          {/* OVERALL RATING */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Overall Teaching Rating
            </h2>

            <div
              style={
                styles.overallRatingBox
              }
            >
              <div
                style={
                  styles.overallNumber
                }
              >
                {overallRating ||
                  "N/A"}
              </div>

              <div>
                <strong>
                  Average Rating
                </strong>

                <p>
                  Based on available
                  numerical ratings in this
                  evaluation.
                </p>
              </div>
            </div>
          </div>

          {/* LEARNING OUTCOMES */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Learning Outcomes
            </h2>

            <div
              style={
                styles.ratingGrid
              }
            >

              <RatingRow
                label="Learning Outcome 1"
                value={
                  evaluation.learning_outcome_1
                }
              />

              <RatingRow
                label="Learning Outcome 2"
                value={
                  evaluation.learning_outcome_2
                }
              />

              <RatingRow
                label="Learning Outcome 3"
                value={
                  evaluation.learning_outcome_3
                }
              />

              <RatingRow
                label="Learning Outcome 4"
                value={
                  evaluation.learning_outcome_4
                }
              />

              <RatingRow
                label="Learning Outcome 5"
                value={
                  evaluation.learning_outcome_5
                }
              />

              <RatingRow
                label="Learning Outcome 6"
                value={
                  evaluation.learning_outcome_6
                }
              />

            </div>

            <CommentBox
              title="Three Important Things Learned"
              value={
                evaluation.three_important_things_learned
              }
            />
          </div>

          {/* TEACHING METHODS */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Teaching and Learning Methods
            </h2>

            <div
              style={
                styles.methodGrid
              }
            >

              <BooleanItem
                label="Teaching Notes"
                value={
                  evaluation.provided_teaching_notes
                }
              />

              <BooleanItem
                label="Handouts"
                value={
                  evaluation.provided_handouts
                }
              />

              <BooleanItem
                label="Articles"
                value={
                  evaluation.provided_articles
                }
              />

              <BooleanItem
                label="Reference Materials"
                value={
                  evaluation.provided_reference_materials
                }
              />

              <BooleanItem
                label="Library References"
                value={
                  evaluation.provided_library_references
                }
              />

              <BooleanItem
                label="Assignments"
                value={
                  evaluation.gave_assignments
                }
              />

              <BooleanItem
                label="Practicals"
                value={
                  evaluation.provided_practicals
                }
              />

              <BooleanItem
                label="Seminars"
                value={
                  evaluation.assigned_seminars
                }
              />

              <BooleanItem
                label="Tests"
                value={
                  evaluation.gave_tests
                }
              />

            </div>

            <CommentBox
              title="Other Learning Method"
              value={
                evaluation.other_learning_method
              }
            />

            <CommentBox
              title="Best Learning Options"
              value={
                evaluation.best_learning_options
              }
            />
          </div>

          {/* INSTRUCTOR PERFORMANCE */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Instructor Performance
            </h2>

            <div
              style={
                styles.ratingGrid
              }
            >

              <RatingRow
                label="Instructor Consultation"
                value={
                  evaluation.instructor_consultation_rating
                }
              />

              <RatingRow
                label="Organization of Lectures"
                value={
                  evaluation.organized_lectures_rating
                }
              />

              <RatingRow
                label="Synthesis of Materials"
                value={
                  evaluation.synthesized_material_rating
                }
              />

              <RatingRow
                label="English Expression"
                value={
                  evaluation.english_expression_rating
                }
              />

              <RatingRow
                label="Encouraged Questions"
                value={
                  evaluation.encouraged_questions_rating
                }
              />

              <RatingRow
                label="Consultation Availability"
                value={
                  evaluation.consultation_availability_rating
                }
              />

              <RatingRow
                label="Feedback"
                value={
                  evaluation.feedback_rating
                }
              />

            </div>

            <div
              style={
                styles.teamworkBox
              }
            >
              <strong>
                Encouraged Teamwork
              </strong>

              <span>
                {evaluation.encouraged_teamwork ||
                  "N/A"}
              </span>
            </div>

            <CommentBox
              title="Teamwork Explanation"
              value={
                evaluation.teamwork_explanation
              }
            />
          </div>

          {/* STUDENT COMMENTS */}

          <div style={styles.card}>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Student Feedback
            </h2>

            <CommentBox
              title="Teaching Comments"
              value={
                evaluation.teaching_comments
              }
            />

            <CommentBox
              title="Continuous Assessment Comments"
              value={
                evaluation.continuous_assessment_comments
              }
            />

            <CommentBox
              title="Practical Comments"
              value={
                evaluation.practical_comments
              }
            />

            <CommentBox
              title="Seminar Comments"
              value={
                evaluation.seminar_comments
              }
            />

            <CommentBox
              title="Other Comments"
              value={
                evaluation.other_comments
              }
            />
          </div>

          {/* FOOTER */}

          {/* <div
            style={
              styles.footerNotice
            }
          >
            <strong>
              Read-only evaluation
            </strong>

            <p>
              Teaching evaluations are
              displayed for review only.
              They cannot be modified or
              deleted from this page.
            </p>
          </div> */}

        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN LIST
  // ============================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Teaching Evaluations
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              View confidential teaching
              evaluations submitted by
              students.
            </p>
          </div>

          <div
            style={
              styles.headerCount
            }
          >
            <span>
              Total Evaluations
            </span>

            <strong>
              {evaluations.length}
            </strong>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            <strong>
              Error
            </strong>

            <div>
              {error}
            </div>
          </div>
        )}

        {/* STAFF INFORMATION */}

        {staff && (
          <div
            style={
              styles.staffCard
            }
          >
            <div>
              <span
                style={
                  styles.smallLabel
                }
              >
                STAFF MEMBER
              </span>

              <strong
                style={
                  styles.staffName
                }
              >
                {getName(staff)}
              </strong>
            </div>

            <div>
              <span
                style={
                  styles.smallLabel
                }
              >
                ROLE
              </span>

              <strong>
                {staff.role ||
                  staff.position ||
                  staff.employee_role ||
                  "Staff"}
              </strong>
            </div>
          </div>
        )}

        {/* CONFIDENTIAL NOTICE */}

        <div
          style={
            styles.confidentialBox
          }
        >
          <strong>
            🔒 Confidential Student Feedback
          </strong>

          <p>
            These evaluations are feedback
            about your teaching performance.
            Student identities are not shown.
          </p>
        </div>

        {/* FILTERS */}

        <div style={styles.filterCard}>

          <div
            style={
              styles.filterGroup
            }
          >
            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Search course or code..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={
                styles.filterInput
              }
            />
          </div>

          <div
            style={
              styles.filterGroup
            }
          >
            <label>
              Course
            </label>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(
                  e.target.value
                )
              }
              style={
                styles.filterInput
              }
            >
              <option value="">
                All Courses
              </option>

              {courseOptions.map(
                (course) => (
                  <option
                    key={course}
                    value={course}
                  >
                    {course}
                  </option>
                )
              )}
            </select>
          </div>

          <div
            style={
              styles.filterGroup
            }
          >
            <label>
              Academic Year
            </label>

            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(
                  e.target.value
                )
              }
              style={
                styles.filterInput
              }
            >
              <option value="">
                All Years
              </option>

              {academicYearOptions.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCourseFilter("");
              setYearFilter("");
            }}
            style={
              styles.clearButton
            }
          >
            Clear
          </button>

        </div>

        {/* RESULTS */}

        <div style={styles.card}>

          <div
            style={
              styles.resultsHeader
            }
          >
            <div>
              <h2
                style={
                  styles.tableTitle
                }
              >
                My Teaching Evaluations
              </h2>

              <p
                style={
                  styles.resultsText
                }
              >
                {filteredEvaluations.length}{" "}
                evaluation
                {filteredEvaluations.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {filteredEvaluations.length ===
          0 ? (
            <div
              style={
                styles.empty
              }
            >
              <div
                style={
                  styles.emptyIcon
                }
              >
                📋
              </div>

              <h3>
                No Teaching Evaluations
              </h3>

              <p>
                There are currently no
                student teaching evaluations
                associated with your account.
              </p>
            </div>
          ) : (
            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Course
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Department
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Semester
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Academic Year
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Rating
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredEvaluations.map(
                    (evaluation) => {
                      const overall =
                        calculateOverallRating(
                          evaluation
                        );

                      return (
                        <tr
                          key={
                            evaluation.id
                          }
                        >

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              {getCourseName(
                                evaluation
                              )}
                            </strong>

                            <div
                              style={
                                styles.courseCode
                              }
                            >
                              {getCourseCode(
                                evaluation
                              )}
                            </div>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {getDepartmentName(
                              evaluation.department
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {evaluation.semester ||
                              "N/A"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {evaluation.academic_year ||
                              "N/A"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {overall ? (
                              <span
                                style={
                                  styles.ratingBadge
                                }
                              >
                                ⭐{" "}
                                {overall}/5
                              </span>
                            ) : (
                              <span
                                style={
                                  styles.notRated
                                }
                              >
                                N/A
                              </span>
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={
                                styles.completed
                              }
                            >
                              Completed
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <button
                              onClick={() =>
                                openEvaluation(
                                  evaluation
                                )
                              }
                              style={
                                styles.viewButton
                              }
                            >
                              View Evaluation
                            </button>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
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
      <span
        style={
          styles.infoLabel
        }
      >
        {label}
      </span>

      <strong>
        {value || "N/A"}
      </strong>
    </div>
  );
}

// ============================================================
// RATING ROW
// ============================================================

function RatingRow({
  label,
  value,
}) {
  const rating = Number(value);

  return (
    <div style={styles.ratingRow}>
      <span>
        {label}
      </span>

      {value !== null &&
      value !== undefined &&
      value !== "" ? (
        <span
          style={
            styles.ratingBadge
          }
        >
          {rating}/5
        </span>
      ) : (
        <span
          style={
            styles.notRated
          }
        >
          Not rated
        </span>
      )}
    </div>
  );
}

// ============================================================
// COMMENT BOX
// ============================================================

function CommentBox({
  title,
  value,
}) {
  return (
    <div
      style={
        styles.commentBox
      }
    >
      <strong>
        {title}
      </strong>

      <p>
        {value &&
        String(value).trim()
          ? value
          : "No comment provided."}
      </p>
    </div>
  );
}

// ============================================================
// BOOLEAN ITEM
// ============================================================

function BooleanItem({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.booleanItem
      }
    >
      <span>
        {label}
      </span>

      <strong
        style={
          value
            ? styles.yes
            : styles.no
        }
      >
        {value ? "Yes" : "No"}
      </strong>
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
    maxWidth: "1250px",
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
    fontSize: "29px",
    color: "#111827",
  },

  subtitle: {
    color: "#64748b",
    marginTop: "8px",
    marginBottom: 0,
  },

  loadingCard: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "#ffffff",
    padding: "45px",
    borderRadius: "14px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  spinner: {
    fontSize: "35px",
    marginBottom: "15px",
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

  staffCard: {
    display: "flex",
    gap: "60px",
    flexWrap: "wrap",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "18px 22px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  smallLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "5px",
  },

  staffName: {
    color: "#1e3a8a",
    fontSize: "17px",
  },

  headerCount: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "12px 18px",
    borderRadius: "9px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
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

  secondaryButton: {
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  viewButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "8px 13px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "15px 18px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  confidentialBox: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
    padding: "16px 20px",
    borderRadius: "9px",
    marginBottom: "20px",
  },

  filterCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "25px",
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr 1fr auto",
    gap: "15px",
    alignItems: "end",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  filterInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
  },

  clearButton: {
    background: "#f1f5f9",
    color: "#374151",
    border: "1px solid #cbd5e1",
    padding: "10px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  tableTitle: {
    margin: 0,
    color: "#111827",
  },

  resultsText: {
    color: "#64748b",
    margin: "6px 0 0",
    fontSize: "14px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },

  th: {
    textAlign: "left",
    padding: "13px",
    background: "#f1f5f9",
    color: "#374151",
    borderBottom:
      "1px solid #d1d5db",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 13px",
    borderBottom:
      "1px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  courseCode: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "4px",
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  ratingBadge: {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
  },

  notRated: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  empty: {
    textAlign: "center",
    padding: "65px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1e3a8a",
    fontSize: "19px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "15px",
  },

  infoItem: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: "700",
    marginBottom: "6px",
  },

  overallRatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "20px",
  },

  overallNumber: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#1d4ed8",
  },

  ratingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "10px",
  },

  ratingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "13px",
  },

  methodGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },

  booleanItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
  },

  yes: {
    color: "#15803d",
  },

  no: {
    color: "#94a3b8",
  },

  commentBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "15px",
  },

  teamworkBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "14px",
    marginTop: "20px",
  },

  footerNotice: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "18px",
    color: "#475569",
  },
};

export default PeerReviews;