import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function Dashboard() {
  // ============================================================
  // CURRENT USER
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
  // FETCH DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // --------------------------------------------------------
      // APPLICATIONS
      // --------------------------------------------------------

      const applicationResponse = await api.get(
        "/api/applications/",
        config
      );

      const allApplications = Array.isArray(
        applicationResponse.data
      )
        ? applicationResponse.data
        : [];

      // --------------------------------------------------------
      // ONLY CURRENT STAFF APPLICATIONS
      // --------------------------------------------------------

      const myApplications = allApplications.filter(
        (app) =>
          String(app.employee) === String(user?.id)
      );

      setApplications(myApplications);

      // --------------------------------------------------------
      // NOTIFICATIONS
      // --------------------------------------------------------

      try {
        const notificationResponse = await api.get(
          "/api/notifications/",
          config
        );

        const allNotifications = Array.isArray(
          notificationResponse.data
        )
          ? notificationResponse.data
          : [];

        const myNotifications = allNotifications.filter(
          (notification) =>
            String(
              notification.employee ||
                notification.user
            ) === String(user?.id)
        );

        setNotifications(myNotifications);

      } catch (notificationError) {
        console.log(
          "Notification endpoint not available:",
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
        "Unable to load dashboard information."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // APPLICATION COUNTS
  // ============================================================

  const total = applications.length;

  const pending = applications.filter(
    (application) =>
      String(application.final_status || "")
        .toLowerCase() === "pending"
  ).length;

  const approved = applications.filter(
    (application) =>
      String(application.final_status || "")
        .toLowerCase() === "approved"
  ).length;

  const rejected = applications.filter(
    (application) =>
      String(application.final_status || "")
        .toLowerCase() === "rejected"
  ).length;

  // ============================================================
  // UNREAD NOTIFICATIONS
  // ============================================================

  const unreadNotifications = notifications.filter(
    (notification) =>
      notification.is_read === false ||
      notification.is_read === undefined
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
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase();

    if (value === "approved") {
      return "status-approved";
    }

    if (value === "rejected") {
      return "status-rejected";
    }

    if (
      value === "pending" ||
      value === "under review" ||
      value === "submitted"
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
              STATISTICS
          ================================================== */}

          <div className="cards">

            {/* TOTAL */}

            <div className="card">

              <h5>
                Total Applications
              </h5>

              <h2>
                {total}
              </h2>

              <p>
                Applications submitted
              </p>

            </div>

            {/* PENDING */}

            <div className="card">

              <h5>
                Pending
              </h5>

              <h2>
                {pending}
              </h2>

              <p>
                Waiting for approval
              </p>

            </div>

            {/* APPROVED */}

            <div className="card">

              <h5>
                Approved
              </h5>

              <h2>
                {approved}
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
                {rejected}
              </h2>

              <p>
                Applications rejected
              </p>

            </div>

            {/* NOTIFICATIONS */}

            <div className="card">

              <h5>
                Notifications
              </h5>

              <h2>
                {unreadNotifications}
              </h2>

              <p>
                Unread notifications
              </p>

            </div>

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
                              application.final_status
                            )}`}
                          >
                            {
                              application.final_status ||
                              "Pending"
                            }
                          </span>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="4"
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
                          application.final_status
                        )}`}
                      >
                        {
                          application.final_status ||
                          "Pending"
                        }
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
                        notification.description ||
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