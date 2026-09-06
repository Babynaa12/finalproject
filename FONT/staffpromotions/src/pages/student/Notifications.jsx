import { useEffect, useState } from "react";
import api from "../../services/api";

function Notifications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/api/notifications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // --------------------------------------------------------
      // Get only notifications belonging to current employee
      // --------------------------------------------------------

      let data = response.data;

      if (Array.isArray(data)) {
        data = data.filter((notification) => {
          return (
            notification.employee === user?.id ||
            notification.user === user?.id ||
            notification.recipient === user?.id
          );
        });
      }

      // Newest first
      data.sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.timestamp || a.date
        );

        const dateB = new Date(
          b.created_at || b.timestamp || b.date
        );

        return dateB - dateA;
      });

      setNotifications(data);
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err.response?.data || err
      );

      setError(
        "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // MARK AS READ
  // ============================================================

  const markAsRead = async (notification) => {
    if (
      notification.is_read === true ||
      notification.read === true
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/notifications/${notification.id}/`,
        {
          is_read: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err.response?.data || err
      );
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllAsRead = async () => {
    const unread = notifications.filter(
      (notification) =>
        notification.is_read !== true &&
        notification.read !== true
    );

    if (unread.length === 0) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        unread.map((notification) =>
          api.patch(
            `/api/notifications/${notification.id}/`,
            {
              is_read: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
          read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications:",
        err.response?.data || err
      );
    }
  };

  // ============================================================
  // GET MESSAGE
  // ============================================================

  const getMessage = (notification) => {
    return (
      notification.message ||
      notification.description ||
      notification.notification ||
      "You have a new promotion notification."
    );
  };

  // ============================================================
  // GET TITLE
  // ============================================================

  const getTitle = (notification) => {
    return (
      notification.title ||
      notification.notification_type_display ||
      notification.type ||
      "Promotion Notification"
    );
  };

  // ============================================================
  // GET DATE
  // ============================================================

  const getDate = (notification) => {
    const date =
      notification.created_at ||
      notification.timestamp ||
      notification.date;

    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  // ============================================================
  // CHECK READ STATUS
  // ============================================================

  const isRead = (notification) => {
    return (
      notification.is_read === true ||
      notification.read === true
    );
  };

  // ============================================================
  // COUNTS
  // ============================================================

  const unreadCount = notifications.filter(
    (notification) => !isRead(notification)
  ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>
          <h2 style={styles.title}>
            Notifications
          </h2>

          <p style={styles.subtitle}>
            Check updates about your promotion application,
            reviews and approval status.
          </p>
        </div>

        {unreadCount > 0 && (
          <div style={styles.unreadBadge}>
            {unreadCount} Unread
          </div>
        )}

      </div>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      {notifications.length > 0 && unreadCount > 0 && (
        <div style={styles.actionContainer}>

          <button
            onClick={markAllAsRead}
            style={styles.readAllButton}
          >
            Mark All as Read
          </button>

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
          LOADING
      ====================================================== */}

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (

        /* ====================================================
           EMPTY
        ==================================================== */

        <div style={styles.empty}>

          <div style={styles.emptyIcon}>
            🔔
          </div>

          <h3>
            No Notifications
          </h3>

          <p>
            You currently have no promotion notifications.
          </p>

        </div>

      ) : (

        /* ====================================================
           NOTIFICATION LIST
        ==================================================== */

        <div style={styles.notificationList}>

          {notifications.map((notification) => {

            const read = isRead(notification);

            return (
              <div
                key={notification.id}
                style={{
                  ...styles.notification,
                  ...(read
                    ? styles.readNotification
                    : styles.unreadNotification),
                }}
                onClick={() =>
                  markAsRead(notification)
                }
              >

                {/* LEFT ICON */}

                <div
                  style={{
                    ...styles.icon,
                    ...(read
                      ? styles.readIcon
                      : styles.unreadIcon),
                  }}
                >
                  {read ? "✓" : "🔔"}
                </div>

                {/* CONTENT */}

                <div style={styles.content}>

                  <div style={styles.notificationHeader}>

                    <h4 style={styles.notificationTitle}>
                      {getTitle(notification)}
                    </h4>

                    {!read && (
                      <span style={styles.newBadge}>
                        NEW
                      </span>
                    )}

                  </div>

                  <p style={styles.message}>
                    {getMessage(notification)}
                  </p>

                  <small style={styles.date}>
                    {getDate(notification)}
                  </small>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "30px auto",
    padding: "25px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "20px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    color: "#1f2937",
    fontSize: "25px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  unreadBadge: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  actionContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "15px",
  },

  readAllButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  notification: {
    display: "flex",
    gap: "15px",
    padding: "18px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "0.2s",
  },

  unreadNotification: {
    background: "#eff6ff",
    borderLeft: "5px solid #2563eb",
  },

  readNotification: {
    background: "#ffffff",
    borderLeft: "5px solid #d1d5db",
  },

  icon: {
    minWidth: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  unreadIcon: {
    background: "#dbeafe",
  },

  readIcon: {
    background: "#f3f4f6",
    color: "#6b7280",
  },

  content: {
    flex: 1,
  },

  notificationHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  notificationTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "16px",
  },

  newBadge: {
    background: "#dc2626",
    color: "#ffffff",
    padding: "3px 7px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "bold",
  },

  message: {
    margin: "8px 0",
    color: "#4b5563",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  date: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  loading: {
    textAlign: "center",
    padding: "50px",
    color: "#6b7280",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },

  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};

export default Notifications;