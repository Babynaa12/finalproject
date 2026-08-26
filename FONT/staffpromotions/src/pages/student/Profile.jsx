import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ============================================================
  // LOAD PROFILE FROM BACKEND
  // ============================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      let profile = null;

      // Try /profile/
      try {
        const response = await axios.get(
          `${API_URL}/profile/`,
          { headers }
        );

        profile = response.data;
      } catch (profileError) {
        console.warn(
          "Profile endpoint failed:",
          profileError.response?.data
        );
      }

      // Try /users/me/
      if (!profile) {
        try {
          const response = await axios.get(
            `${API_URL}/users/me/`,
            { headers }
          );

          profile = response.data;
        } catch (meError) {
          console.warn(
            "Users/me endpoint failed:",
            meError.response?.data
          );
        }
      }

      // Local storage fallback
      if (!profile) {
        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          profile = JSON.parse(storedUser);
        }
      }

      if (!profile) {
        throw new Error(
          "Unable to retrieve student profile."
        );
      }

      console.log(
        "Student profile:",
        profile
      );

      setUser(profile);

      // Update local storage
      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to retrieve your profile information."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getName = () => {
    if (!user) return "N/A";

    return (
      user.full_name ||
      user.name ||
      user.employee_name ||
      user.student_name ||
      `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim() ||
      user.username ||
      "N/A"
    );
  };

  const getInitials = () => {
    const name = getName();

    if (!name || name === "N/A") {
      return "ST";
    }

    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return name
      .substring(0, 2)
      .toUpperCase();
  };

  const getStudentId = () => {
    if (!user) return "N/A";

    return (
      user.student_id ||
      user.registration_number ||
      user.registration_no ||
      user.employee_id ||
      user.id ||
      "N/A"
    );
  };

  const getDepartment = () => {
    if (!user) return "N/A";

    if (
      user.department &&
      typeof user.department === "object"
    ) {
      return (
        user.department.name ||
        user.department.department_name ||
        user.department.title ||
        "N/A"
      );
    }

    return (
      user.department_name ||
      user.department ||
      user.dept_name ||
      "N/A"
    );
  };

  const getFaculty = () => {
    if (!user) return "N/A";

    if (
      user.faculty &&
      typeof user.faculty === "object"
    ) {
      return (
        user.faculty.name ||
        user.faculty.faculty_name ||
        "N/A"
      );
    }

    return (
      user.faculty_name ||
      user.faculty ||
      user.institute ||
      user.faculty_institute_centre ||
      "N/A"
    );
  };

  const getProgramme = () => {
    if (!user) return "N/A";

    return (
      user.degree_programme ||
      user.programme ||
      user.program ||
      user.study_programme ||
      "N/A"
    );
  };

  const getRole = () => {
    if (!user) return "STUDENT";

    return (
      user.role ||
      user.user_role ||
      user.user_type ||
      "STUDENT"
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <>
        <style>{css}</style>

        <div className="profile-page">
          <div className="profile-loading">
            <div className="loader"></div>

            <h2>Loading Profile</h2>

            <p>
              Please wait while we retrieve
              your information...
            </p>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <>
      <style>{css}</style>

      <div className="profile-page">

        <div className="profile-container">

          {/* ==================================================
              TOP HEADER
          ================================================== */}

          <div className="profile-top">

            <div>
              <div className="breadcrumb">
                Student Portal
                <span>/</span>
                My Profile
              </div>

              <h1>
                My Profile
              </h1>

              <p>
                Manage and view your personal
                and academic information.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={loadProfile}
            >
              <span>↻</span>
              Refresh Profile
            </button>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="alert-error">
              <div className="alert-icon">
                !
              </div>

              <div>
                <strong>
                  Unable to load profile
                </strong>

                <p>
                  {error}
                </p>
              </div>
            </div>
          )}

          {user && (
            <>
              {/* ==================================================
                  PROFILE HERO
              ================================================== */}

              <div className="profile-hero">

                <div className="hero-left">

                  <div className="avatar">
                    {getInitials()}
                  </div>

                  <div className="hero-info">

                    <h2>
                      {getName()}
                    </h2>

                    <p>
                      {user.email ||
                        "Student Account"}
                    </p>

                    <div className="hero-tags">

                      <span className="role-tag">
                        {getRole()}
                      </span>

                      <span className="active-tag">
                        <span className="active-dot"></span>
                        Active Account
                      </span>

                    </div>

                  </div>

                </div>

                <div className="hero-id">

                  <span>
                    STUDENT ID
                  </span>

                  <strong>
                    {getStudentId()}
                  </strong>

                </div>

              </div>

              {/* ==================================================
                  PERSONAL INFORMATION
              ================================================== */}

              <div className="profile-card">

                <div className="card-heading">

                  <div className="heading-icon blue">
                    👤
                  </div>

                  <div>
                    <h2>
                      Personal Information
                    </h2>

                    <p>
                      Your basic personal
                      account information
                    </p>
                  </div>

                </div>

                <div className="information-grid">

                  <Info
                    label="Full Name"
                    value={getName()}
                  />

                  <Info
                    label="Student ID"
                    value={getStudentId()}
                  />

                  <Info
                    label="Email Address"
                    value={
                      user.email ||
                      "N/A"
                    }
                  />

                  <Info
                    label="Username"
                    value={
                      user.username ||
                      "N/A"
                    }
                  />

                </div>

              </div>

              {/* ==================================================
                  ACADEMIC INFORMATION
              ================================================== */}

              <div className="profile-card">

                <div className="card-heading">

                  <div className="heading-icon purple">
                    🎓
                  </div>

                  <div>
                    <h2>
                      Academic Information
                    </h2>

                    <p>
                      Your university academic
                      information
                    </p>
                  </div>

                </div>

                <div className="information-grid">

                  <Info
                    label="Department"
                    value={getDepartment()}
                  />

                  <Info
                    label="Faculty / Institute"
                    value={getFaculty()}
                  />

                  <Info
                    label="Degree Programme"
                    value={getProgramme()}
                  />

                  <div className="info-item">

                    <span>
                      ROLE
                    </span>

                    <div>
                      <span className="student-badge">
                        {getRole()}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* ==================================================
                  SYSTEM INFORMATION
              ================================================== */}

              <div className="profile-card">

                <div className="card-heading">

                  <div className="heading-icon green">
                    ✓
                  </div>

                  <div>
                    <h2>
                      Account Status
                    </h2>

                    <p>
                      Your current system
                      account status
                    </p>
                  </div>

                </div>

                <div className="account-status">

                  <div className="status-left">

                    <div className="status-circle">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Account Active
                      </strong>

                      <p>
                        Your student account
                        is active and ready
                        to use.
                      </p>
                    </div>

                  </div>

                  <span className="active-label">
                    ACTIVE
                  </span>

                </div>

              </div>

              {/* ==================================================
                  EVALUATION INFORMATION
              ================================================== */}

              <div className="profile-card evaluation-card">

                <div className="evaluation-content">

                  <div className="evaluation-icon">
                    📝
                  </div>

                  <div>

                    <h2>
                      Teaching Evaluation
                    </h2>

                    <p>
                      Your student profile
                      information is automatically
                      used when completing lecturer
                      teaching evaluations.
                    </p>

                    <div className="evaluation-points">

                      <span>
                        ✓ Student identified automatically
                      </span>

                      <span>
                        ✓ Department retrieved from backend
                      </span>

                      <span>
                        ✓ Academic information connected
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </>
          )}

        </div>

      </div>
    </>
  );
}

// ============================================================
// INFORMATION COMPONENT
// ============================================================

function Info({
  label,
  value,
}) {
  return (
    <div className="info-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "N/A"}
      </strong>

    </div>
  );
}

// ============================================================
// INTERNAL CSS
// ============================================================

const css = `

* {
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;
  background: #f4f7fb;
  padding: 35px 30px;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #172033;
}

.profile-container {
  max-width: 1180px;
  margin: 0 auto;
}

/* ============================================================
   TOP HEADER
============================================================ */

.profile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 25px;
  margin-bottom: 28px;
}

.breadcrumb {
  color: #7b8798;
  font-size: 13px;
  margin-bottom: 10px;
}

.breadcrumb span {
  margin: 0 8px;
  color: #b4bdca;
}

.profile-top h1 {
  margin: 0;
  font-size: 31px;
  font-weight: 750;
  color: #172033;
  letter-spacing: -0.5px;
}

.profile-top p {
  margin: 8px 0 0;
  color: #748094;
  font-size: 14px;
}

.refresh-btn {
  border: 1px solid #dbe2ea;
  background: white;
  color: #3157d5;
  padding: 11px 17px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn:hover {
  background: #3157d5;
  color: white;
  border-color: #3157d5;
  transform: translateY(-1px);
}

.refresh-btn span {
  font-size: 17px;
  margin-right: 7px;
}

/* ============================================================
   ERROR
============================================================ */

.alert-error {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 16px 18px;
  margin-bottom: 24px;
  border-radius: 9px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-icon {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.alert-error strong {
  font-size: 14px;
}

.alert-error p {
  margin: 4px 0 0;
  font-size: 13px;
}

/* ============================================================
   PROFILE HERO
============================================================ */

.profile-hero {
  min-height: 190px;
  background:
    linear-gradient(
      120deg,
      #1e3a8a 0%,
      #3157d5 55%,
      #496ee0 100%
    );
  border-radius: 14px;
  padding: 30px 34px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-bottom: 25px;
  box-shadow:
    0 10px 25px rgba(37, 76, 170, 0.15);
  position: relative;
  overflow: hidden;
}

.profile-hero::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -90px;
  top: -120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 22px;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: white;
  color: #3157d5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  font-weight: 800;
  border: 4px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hero-info h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 750;
}

.hero-info p {
  margin: 6px 0 13px;
  opacity: 0.85;
  font-size: 14px;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.role-tag {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.active-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.12);
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 11px;
}

.active-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
}

.hero-id {
  position: relative;
  z-index: 1;
  text-align: right;
}

.hero-id span {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-bottom: 7px;
}

.hero-id strong {
  font-size: 19px;
}

/* ============================================================
   CARD
============================================================ */

.profile-card {
  background: white;
  border: 1px solid #e4e9f0;
  border-radius: 13px;
  margin-bottom: 22px;
  padding: 27px;
  box-shadow:
    0 2px 8px rgba(20, 35, 60, 0.025);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 23px;
}

.card-heading h2 {
  margin: 0;
  color: #1c2739;
  font-size: 18px;
  font-weight: 720;
}

.card-heading p {
  margin: 4px 0 0;
  color: #8994a5;
  font-size: 12px;
}

.heading-icon {
  width: 39px;
  height: 39px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.heading-icon.blue {
  background: #edf3ff;
  color: #3157d5;
}

.heading-icon.purple {
  background: #f3efff;
  color: #7957d5;
}

.heading-icon.green {
  background: #ebfbf2;
  color: #159957;
}

/* ============================================================
   INFORMATION GRID
============================================================ */

.information-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.info-item {
  padding: 17px 18px;
  background: #fafbfd;
  border: 1px solid #e8edf3;
  border-radius: 9px;
  transition: all 0.2s ease;
}

.info-item:hover {
  border-color: #cbd7eb;
  background: #f8faff;
}

.info-item > span {
  display: block;
  color: #8a95a6;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 7px;
}

.info-item strong {
  display: block;
  color: #263247;
  font-size: 14px;
  font-weight: 650;
  word-break: break-word;
}

/* ============================================================
   ROLE BADGE
============================================================ */

.student-badge {
  display: inline-flex;
  align-items: center;
  background: #edf3ff;
  color: #3157d5;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

/* ============================================================
   ACCOUNT STATUS
============================================================ */

.account-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 17px 19px;
  border: 1px solid #d8f1e1;
  background: #f5fcf7;
  border-radius: 10px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.status-circle {
  width: 39px;
  height: 39px;
  border-radius: 50%;
  background: #dff7e8;
  color: #159957;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.status-left strong {
  display: block;
  font-size: 14px;
  color: #1c5135;
}

.status-left p {
  margin: 3px 0 0;
  color: #6d8576;
  font-size: 12px;
}

.active-label {
  background: #dcfce7;
  color: #15803d;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
}

/* ============================================================
   EVALUATION CARD
============================================================ */

.evaluation-card {
  background:
    linear-gradient(
      135deg,
      #f8faff,
      #f4f7ff
    );
  border-color: #dce5fb;
}

.evaluation-content {
  display: flex;
  align-items: flex-start;
  gap: 17px;
}

.evaluation-icon {
  min-width: 46px;
  height: 46px;
  border-radius: 10px;
  background: #e7efff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.evaluation-content h2 {
  margin: 0;
  font-size: 17px;
  color: #243b73;
}

.evaluation-content p {
  margin: 7px 0 13px;
  color: #68758c;
  font-size: 13px;
  line-height: 1.6;
  max-width: 850px;
}

.evaluation-points {
  display: flex;
  gap: 10px 20px;
  flex-wrap: wrap;
}

.evaluation-points span {
  color: #3157d5;
  font-size: 11px;
  font-weight: 650;
}

/* ============================================================
   LOADING
============================================================ */

.profile-loading {
  max-width: 480px;
  margin: 130px auto;
  background: white;
  padding: 45px 35px;
  text-align: center;
  border-radius: 13px;
  border: 1px solid #e4e9f0;
  box-shadow:
    0 8px 25px rgba(20,35,60,0.05);
}

.profile-loading h2 {
  margin: 20px 0 7px;
  color: #263247;
}

.profile-loading p {
  color: #8490a2;
  font-size: 13px;
}

.loader {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #e5eaf2;
  border-top-color: #3157d5;
  margin: auto;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 768px) {

  .profile-page {
    padding: 22px 15px;
  }

  .profile-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-top h1 {
    font-size: 25px;
  }

  .refresh-btn {
    width: 100%;
  }

  .profile-hero {
    padding: 25px;
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-id {
    text-align: left;
  }

  .information-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    padding: 20px;
  }

  .account-status {
    align-items: flex-start;
    flex-direction: column;
  }

  .evaluation-points {
    flex-direction: column;
    gap: 7px;
  }
}

@media (max-width: 480px) {

  .profile-page {
    padding: 15px 10px;
  }

  .profile-hero {
    padding: 20px;
  }

  .hero-left {
    align-items: flex-start;
  }

  .avatar {
    width: 65px;
    height: 65px;
    font-size: 20px;
  }

  .hero-info h2 {
    font-size: 20px;
  }

  .profile-card {
    padding: 17px;
  }
}

`;

export default Profile;