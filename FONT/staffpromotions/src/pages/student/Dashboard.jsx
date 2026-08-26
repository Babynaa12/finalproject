import React from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaHistory,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ================= HEADER ================= */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Student Dashboard
            </h1>

            <p style={styles.subtitle}>
              Welcome to the Student Teaching Evaluation Portal.
              Manage and complete your lecturer evaluations from here.
            </p>
          </div>

          <div style={styles.headerBadge}>
            <FaChartLine />
            <span>Evaluation Portal</span>
          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div style={styles.statsGrid}>

          {/* Pending */}
          <div style={styles.statCard}>
            <div style={styles.iconBoxBlue}>
              <FaClipboardList size={22} />
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Pending Evaluations
              </span>

              <h2 style={styles.statNumber}>
                2
              </h2>

              <span style={styles.statDescription}>
                Evaluations waiting for your response
              </span>
            </div>
          </div>

          {/* Completed */}
          <div style={styles.statCard}>
            <div style={styles.iconBoxGreen}>
              <FaCheckCircle size={22} />
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Completed Evaluations
              </span>

              <h2 style={styles.statNumber}>
                5
              </h2>

              <span style={styles.statDescription}>
                Evaluations successfully submitted
              </span>
            </div>
          </div>

          {/* History */}
          <div style={styles.statCard}>
            <div style={styles.iconBoxPurple}>
              <FaHistory size={22} />
            </div>

            <div style={styles.statContent}>
              <span style={styles.statLabel}>
                Evaluation History
              </span>

              <h2 style={styles.statNumber}>
                5
              </h2>

              <span style={styles.statDescription}>
                Total evaluations submitted
              </span>
            </div>
          </div>

        </div>

        {/* ================= QUICK ACTION ================= */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Quick Actions
              </h2>

              <p style={styles.sectionSubtitle}>
                Access the main student evaluation functions.
              </p>
            </div>
          </div>

          <div style={styles.actionGrid}>

            <div style={styles.actionCard}>
              <div style={styles.actionIconBlue}>
                <FaClipboardList />
              </div>

              <div style={styles.actionContent}>
                <h3 style={styles.actionTitle}>
                  Teaching Evaluations
                </h3>

                <p style={styles.actionText}>
                  Evaluate the teaching performance of your lecturers.
                </p>

                <button
                  style={styles.actionButton}
                  onClick={() => {
                    window.location.href =
                      "/student/teaching-evaluations";
                  }}
                >
                  Evaluate Lecturer
                  <FaArrowRight size={13} />
                </button>
              </div>
            </div>

            <div style={styles.actionCard}>
              <div style={styles.actionIconGreen}>
                <FaHistory />
              </div>

              <div style={styles.actionContent}>
                <h3 style={styles.actionTitle}>
                  Evaluation History
                </h3>

                <p style={styles.actionText}>
                  View the teaching evaluations you have already submitted.
                </p>

                <button
                  style={styles.actionButton}
                  onClick={() => {
                    window.location.href =
                      "/student/teaching-evaluations";
                  }}
                >
                  View History
                  <FaArrowRight size={13} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ================= INFORMATION ================= */}
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>
            <FaCheckCircle />
          </div>

          <div>
            <h3 style={styles.infoTitle}>
              Confidential Evaluation
            </h3>

            <p style={styles.infoText}>
              Your teaching evaluation responses should be completed
              honestly and objectively. The information submitted through
              this portal is intended for academic quality improvement
              and teaching performance assessment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   INTERNAL CSS
============================================================ */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "35px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#172033",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "15px",
    lineHeight: "1.6",
    maxWidth: "700px",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 15px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow:
      "0 2px 6px rgba(15, 23, 42, 0.04)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow:
      "0 3px 10px rgba(15, 23, 42, 0.05)",
  },

  iconBoxBlue: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxGreen: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "10px",
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxPurple: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "10px",
    background: "#f5f3ff",
    color: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
  },

  statNumber: {
    margin: "4px 0",
    color: "#172033",
    fontSize: "28px",
    fontWeight: "700",
  },

  statDescription: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow:
      "0 3px 10px rgba(15, 23, 42, 0.04)",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "20px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },

  actionCard: {
    display: "flex",
    gap: "16px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fafcff",
  },

  actionIconBlue: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconGreen: {
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "9px",
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
    color: "#172033",
  },

  actionText: {
    margin: "0 0 15px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "9px 13px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  infoCard: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "20px",
  },

  infoIcon: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    margin: "0 0 5px",
    color: "#1e3a8a",
    fontSize: "15px",
  },

  infoText: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};

export default Dashboard;