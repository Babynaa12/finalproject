import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const getToken = () =>
  localStorage.getItem("access_token") || localStorage.getItem("token");

function RoleNotifications({ role = "HOD" }) {
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    applicationId: "",
    title: "",
    message: "",
    notificationType: "GENERAL",
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const roleLabel = {
    HOD: "Head of Department",
    DEAN: "Dean",
    REVIEWER: "Reviewer",
  }[role] || "User";

  const fetchApplications = async () => {
    try {
      const token = getToken();
      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      const response = await api.get("/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];

      const filtered = data.filter((notification) => {
        if (!currentUser?.id) return true;

        return (
          notification.employee === currentUser.id ||
          notification.user === currentUser.id ||
          notification.recipient === currentUser.id ||
          String(notification.employee) === String(currentUser.id)
        );
      });

      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setNotifications(filtered);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = getToken();

      await api.patch(
        `/api/notifications/${notificationId}/`,
        { is_read: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async (event) => {
    event.preventDefault();

    if (!form.applicationId || !form.message.trim()) {
      setError("Please select an accessible application and enter a message.");
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      const token = getToken();

      await api.post(
        `/api/applications/${form.applicationId}/notify/`,
        {
          title: form.title || `${roleLabel} notification`,
          message: form.message,
          notification_type: form.notificationType,
          status: "ACTIVE",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Notification sent to the applicant successfully.");
      setForm({
        applicationId: "",
        title: "",
        message: "",
        notificationType: "GENERAL",
      });

      fetchNotifications();
    } catch (err) {
      console.error("Failed to send notification:", err);
      setError(
        err.response?.data?.error ||
          "Unable to send this notification to the application."
      );
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => item.is_read !== true && item.read !== true
  ).length;

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>{roleLabel} Notifications</h1>
          <p style={styles.subtitle}>
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <div style={styles.grid}>
        <form onSubmit={handleSendNotification} style={styles.card}>
          <h2 style={styles.cardTitle}>Send Notification</h2>

          <label style={styles.label}>Application</label>
          <select
            name="applicationId"
            value={form.applicationId}
            onChange={handleInputChange}
            style={styles.input}
            required
          >
            <option value="">Select an accessible application</option>
            {applications.map((application) => {
              const applicantName =
                application.employee_name ||
                application.full_name ||
                application.employee?.full_name ||
                application.employee?.username ||
                "Unknown applicant";

              return (
                <option key={application.id} value={application.id}>
                  {applicantName} (Application #{application.id})
                </option>
              );
            })}
          </select>

          <label style={styles.label}>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            placeholder="Application status update"
            style={styles.input}
          />

          <label style={styles.label}>Notification Type</label>
          <select
            name="notificationType"
            value={form.notificationType}
            onChange={handleInputChange}
            style={styles.input}
          >
            <option value="GENERAL">General</option>
            <option value="HOD_REVIEW">HOD Review</option>
            <option value="DEAN_REVIEW">Dean Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="APPEAL">Appeal</option>
          </select>

          <label style={styles.label}>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleInputChange}
            placeholder="Write the update the applicant should receive..."
            style={{ ...styles.input, minHeight: 110, resize: "vertical" }}
            required
          />

          <button type="submit" style={styles.primaryButton} disabled={sending}>
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Notifications</h2>

          {notifications.length === 0 ? (
            <p style={styles.emptyText}>No notifications yet.</p>
          ) : (
            <div style={styles.list}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    ...(notification.is_read || notification.read
                      ? styles.readItem
                      : styles.unreadItem),
                  }}
                >
                  <div style={styles.notificationHeader}>
                    <strong>{notification.title || "Promotion Update"}</strong>
                    {!notification.is_read && !notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        style={styles.smallButton}
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <p style={styles.notificationMessage}>
                    {notification.message || "No message available."}
                  </p>

                  <div style={styles.metaRow}>
                    <span>{notification.notification_type || "GENERAL"}</span>
                    <span>
                      {notification.created_at
                        ? new Date(notification.created_at).toLocaleString()
                        : "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    width: "100%",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: "#1f2937",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 22,
    color: "#111827",
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    marginBottom: 16,
    fontSize: 14,
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: 10,
    marginBottom: 16,
  },
  successBox: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px 14px",
    borderRadius: 10,
    marginBottom: 16,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  notificationItem: {
    padding: 14,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  unreadItem: {
    background: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  readItem: {
    background: "#f9fafb",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  notificationMessage: {
    margin: "0 0 10px",
    color: "#374151",
    lineHeight: 1.5,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 12,
    color: "#6b7280",
  },
  smallButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    color: "#1f2937",
  },
  emptyText: {
    color: "#6b7280",
  },
};

export default RoleNotifications;
