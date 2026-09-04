
import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function Dashboard() {
  // ============================================================
  // CURRENT LOGGED-IN USER
  // ============================================================

  const user = JSON.parse(localStorage.getItem("user"));

  // ============================================================
  // STATES
  // ============================================================

  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH DATA FROM BACKEND
  // ============================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // ========================================================
      // 1. PROMOTION APPLICATIONS
      // ========================================================

      const applicationResponse = await api.get(
        "/api/applications/",
        config
      );

      console.log(
        "MY PROMOTION APPLICATIONS:",
        applicationResponse.data
      );

      const backendApplications = Array.isArray(
        applicationResponse.data
      )
        ? applicationResponse.data
        : [];

      /*
       * IMPORTANT:
       *
       * The backend already filters STAFF applications using:
       *
       * PromotionApplication.objects.filter(
       *     employee=user
       * )
       *
       * Therefore we use the backend response directly.
       */

      setApplications(backendApplications);

      // ========================================================
      // 2. NOTIFICATIONS
      // ========================================================

      try {
        const notificationResponse = await api.get(
          "/api/notifications/",
          config
        );

        console.log(
          "MY NOTIFICATIONS:",
          notificationResponse.data
        );

        const backendNotifications = Array.isArray(
          notificationResponse.data
        )
          ? notificationResponse.data
          : [];

        /*
         * Backend should ideally already filter notifications
         * for the logged-in employee.
         *
         * We still perform a safety filter here.
         */

        const myNotifications =
          backendNotifications.filter(
            (notification) =>
              String(
                notification.employee ??
                  notification.user ??
                  ""
              ) === String(user?.id)
          );

        setNotifications(myNotifications);

      } catch (notificationError) {
        console.warn(
          "Notification endpoint error:",
          notificationError
        );

        setNotifications([]);
      }

    } catch (err) {
      console.error(
        "Dashboard error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.error ||
        "Unable to load dashboard information."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APPLICATION STATUS
  // ============================================================

  /*
   * IMPORTANT:
   *
   * Your Django model uses:
   *
   * DRAFT
   * SUBMITTED
   * HOD_REVIEW
   * DEAN_REVIEW
   * UNDER_REVIEW
   * COMMITTEE_REVIEW
   * APPROVED
   * REJECTED
   * APPEALED
   *
   * Therefore we use application.status.
   */

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      [
        "DRAFT",
        "SUBMITTED",
        "HOD_REVIEW",
        "DEAN_REVIEW",
        "UNDER_REVIEW",
        "COMMITTEE_REVIEW",
        "APPEALED",
      ].includes(
        String(application.status || "").toUpperCase()
      )
  ).length;

  const approvedApplications = applications.filter(
    (application) =>
      String(application.status || "").toUpperCase() ===
      "APPROVED"
  ).length;

  const rejectedApplications = applications.filter(
    (application) =>
      String(application.status || "").toUpperCase() ===
      "REJECTED"
  ).length;

  // ============================================================
  // UNREAD NOTIFICATIONS
  // ============================================================

  const unreadNotifications = notifications.filter(
    (notification) =>
      notification.is_read === false
  ).length;

  // ============================================================
  // RECENT APPLICATIONS
  // ============================================================

  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at ||
        a.submitted_at ||
        0
      );

      const dateB = new Date(
        b.created_at ||
        b.submitted_at ||
        0
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  // ============================================================
  // STATUS DISPLAY
  // ============================================================

  const getStatusLabel = (status) => {
    const value = String(status || "").toUpperCase();

    const labels = {
      DRAFT: "Draft",
      SUBMITTED: "Submitted",
      HOD_REVIEW: "HOD Review",
      DEAN_REVIEW: "Dean Review",
      UNDER_REVIEW: "Academic Review",
      COMMITTEE_REVIEW: "Committee Review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      APPEALED: "Appealed",
    };

    return labels[value] || value || "Unknown";
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "APPROVED") {
      return "status-approved";
    }

    if (value === "REJECTED") {
      return "status-rejected";
    }

    if (
      [
        "DRAFT",
        "SUBMITTED",
        "HOD_REVIEW",
        "DEAN_REVIEW",
        "UNDER_REVIEW",
        "COMMITTEE_REVIEW",
        "APPEALED",
      ].includes(value)
    ) {
      return "status-pending";
    }

    return "status-default";
  };

  // ============================================================
  // STAFF NAME
  // ============================================================

  const staffName =
    user?.full_name ||
    user?.name ||
    `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim() ||
    user?.username ||
    "Staff";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-container">

      {/* ======================================================
          WELCOME
      ====================================================== */}

      <div className="dashboard-header">

        <h2>
          Welcome, {staffName}
        </h2>

        <p>
          Track your promotion application,
          review progress and approval status.
        </p>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="dashboard-loading">
          Loading dashboard...
        </div>

      ) : (

        <>

          {/* ==================================================
              DASHBOARD CARDS
          ================================================== */}

          <div className="cards">

            {/* TOTAL APPLICATIONS */}

            <div className="card">

              <h5>
                Total Applications
              </h5>

              <h2>
                {totalApplications}
              </h2>

              <p>
                Your promotion applications
              </p>

            </div>

            {/* PENDING */}

            <div className="card">

              <h5>
                Pending
              </h5>

              <h2>
                {pendingApplications}
              </h2>

              <p>
                Applications in progress
              </p>

            </div>

            {/* APPROVED */}

            <div className="card">

              <h5>
                Approved
              </h5>

              <h2>
                {approvedApplications}
              </h2>

              <p>
                Successfully approved
              </p>

            </div>

            {/* REJECTED */}

            <div className="card">

              <h5>
                Rejected
              </h5>

              <h2>
                {rejectedApplications}
              </h2>

              <p>
                Applications rejected
              </p>

            </div>

            {/* NOTIFICATIONS */}

            {/* <div className="card">

              <h5>
                Notifications
              </h5>

              <h2>
                {unreadNotifications}
              </h2>

              <p>
                Unread notifications
              </p>

            </div> */}

          </div>


          {/* ==================================================
              RECENT APPLICATIONS
          ================================================== */}

          <div className="table-container">

            <div className="section-header">

              <h4>
                Recent Promotion Applications
              </h4>

            </div>

            <table>

              <thead>

                <tr>

                  <th>
                    Application ID
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Current Position
                  </th>

                  <th>
                    Target Position
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentApplications.length > 0 ? (

                  recentApplications.map(
                    (application) => (

                      <tr
                        key={application.id}
                      >

                        <td>
                          #{application.id}
                        </td>

                        <td>
                          {application.created_at ||
                          application.submitted_at
                            ? new Date(
                                application.created_at ||
                                application.submitted_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {
                            application.current_title_name ||
                            application.current_title?.title_name ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            application.targeted_title_name ||
                            application.targeted_title?.title_name ||
                            "-"
                          }
                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "25px",
                      }}
                    >
                      No promotion applications yet.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ==================================================
              PROMOTION PROGRESS
          ================================================== */}

          {applications.length > 0 && (

            <div className="table-container">

              <h4>
                Promotion Progress
              </h4>

              {applications
                .slice(0, 3)
                .map((application) => (

                  <div
                    key={application.id}
                    style={{
                      padding: "15px",
                      marginBottom: "12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "8px",
                      }}
                    >

                      <strong>
                        Application #{application.id}
                      </strong>

                      <span
                        className={`status-badge ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {getStatusLabel(
                          application.status
                        )}
                      </span>

                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >

                      {
                        application.current_title_name ||
                        "-"
                      }

                      {" → "}

                      {
                        application.targeted_title_name ||
                        "-"
                      }

                    </div>

                  </div>

                ))}

            </div>

          )}


          {/* ==================================================
              RECENT NOTIFICATIONS
          ================================================== */}

          {notifications.length > 0 && (

            <div className="table-container">

              <div className="section-header">

                <h4>
                  Recent Notifications
                </h4>

              </div>

              {notifications
                .slice(0, 5)
                .map((notification) => (

                  <div
                    key={notification.id}
                    style={{
                      padding: "14px",
                      marginBottom: "10px",
                      background:
                        notification.is_read === false
                          ? "#eff6ff"
                          : "#f9fafb",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >

                    <strong>
                      {notification.title ||
                        "Promotion Update"}
                    </strong>

                    <p
                      style={{
                        margin: "6px 0",
                        color: "#4b5563",
                      }}
                    >
                      {notification.message ||
                        "You have a promotion status update."}
                    </p>

                    {notification.created_at && (

                      <small
                        style={{
                          color: "#6b7280",
                        }}
                      >
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </small>

                    )}

                  </div>

                ))}

            </div>

          )}

        </>

      )}

    </div>
  );
}

export default Dashboard;

