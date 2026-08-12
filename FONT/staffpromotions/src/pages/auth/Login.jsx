import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // ==========================================================
      // LOGIN REQUEST
      // Backend expects ONLY:
      //
      // {
      //   email: "...",
      //   password: "..."
      // }
      // ==========================================================

      const payload = {
        email: email.trim(),
        password: password,
      };

      console.log("LOGIN REQUEST:", {
        email: email.trim(),
      });

      const res = await api.post(
        "/api/auth/login/",
        payload
      );

      console.log("LOGIN RESPONSE:", res.data);

      // ==========================================================
      // GET RESPONSE
      // ==========================================================

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      const user = res.data.user;

      // ==========================================================
      // VALIDATE RESPONSE
      // ==========================================================

      if (!accessToken) {
        setError(
          "Access token was not returned by the server."
        );
        return;
      }

      if (!user) {
        setError(
          "User information was not returned by the server."
        );
        return;
      }

      // ==========================================================
      // SAVE ACCESS TOKEN
      // ==========================================================

      localStorage.setItem(
        "token",
        accessToken
      );

      localStorage.setItem(
        "access_token",
        accessToken
      );

      // ==========================================================
      // SAVE REFRESH TOKEN
      // ==========================================================

      if (refreshToken) {
        localStorage.setItem(
          "refresh_token",
          refreshToken
        );
      }

      // ==========================================================
      // SAVE USER
      // ==========================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ==========================================================
      // GET ROLE
      // ==========================================================

      const role = String(user.role || "")
        .trim()
        .toUpperCase();

      console.log("LOGGED IN USER:", user);
      console.log("USER ROLE:", role);

      // ==========================================================
      // SAVE ROLE
      // ==========================================================

      localStorage.setItem(
        "role",
        role
      );

      // ==========================================================
      // ROLE-BASED REDIRECT
      // ==========================================================

      switch (role) {

        // --------------------------------------------------------
        // ACADEMIC STAFF
        // --------------------------------------------------------

        case "STAFF":
          navigate("/staff/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // STUDENT
        // --------------------------------------------------------

        case "STUDENT":
          navigate("/student/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // HEAD OF DEPARTMENT
        // --------------------------------------------------------

        case "HOD":
          navigate("/hod/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // DEAN
        // --------------------------------------------------------

        case "DEAN":
          navigate("/dean/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // REVIEWER
        // --------------------------------------------------------

        case "REVIEWER":
          navigate("/reviewer/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // PROMOTION COMMITTEE
        // --------------------------------------------------------

        case "COMMITTEE":
          navigate("/committee/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // APPEAL COMMITTEE
        // --------------------------------------------------------

        case "APPEAL_COMMITTEE":
          navigate("/appeal-committee/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // ADMINISTRATOR
        // --------------------------------------------------------

        case "ADMIN":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;

        // --------------------------------------------------------
        // UNKNOWN ROLE
        // --------------------------------------------------------

        default:

          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");

          setError(
            "Unauthorized role. Please contact the system administrator."
          );

          break;
      }

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err.response?.data || err
      );

      // ==========================================================
      // BACKEND ERROR
      // ==========================================================

      if (err.response) {

        const data = err.response.data;

        // --------------------------------------------------------
        // 400 BAD REQUEST
        // --------------------------------------------------------

        if (err.response.status === 400) {

          if (data?.email) {
            setError(
              Array.isArray(data.email)
                ? data.email[0]
                : data.email
            );
          } else {
            setError(
              data?.error ||
              data?.detail ||
              "Email and password are required."
            );
          }
        }

        // --------------------------------------------------------
        // 401 UNAUTHORIZED
        // --------------------------------------------------------

        else if (err.response.status === 401) {

          setError(
            data?.error ||
            data?.detail ||
            "Invalid email or password."
          );
        }

        // --------------------------------------------------------
        // 403 FORBIDDEN
        // --------------------------------------------------------

        else if (err.response.status === 403) {

          setError(
            data?.error ||
            data?.detail ||
            "Your account is inactive. Please contact the administrator."
          );
        }

        // --------------------------------------------------------
        // OTHER ERROR
        // --------------------------------------------------------

        else {

          setError(
            data?.error ||
            data?.detail ||
            "Login failed. Please try again."
          );
        }

      } else {

        setError(
          "Unable to connect to the server. Please check that Django is running."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  // ============================================================
  // LOGIN PAGE
  // ============================================================

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        {/* SYSTEM TITLE */}

        <h1 style={styles.logo}>
          Staff Promotion System
        </h1>

        <p style={styles.subtitle}>
          Academic Staff Promotion Management System
        </p>

        <h3 style={styles.title}>
          Welcome Back
        </h3>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label style={styles.label}>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
            autoComplete="email"
            disabled={loading}
          />

          {/* PASSWORD */}

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
            autoComplete="current-password"
            disabled={loading}
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading
                ? styles.buttonDisabled
                : {}),
            }}
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* FOOTER */}

        <p style={styles.footer}>
          Staff Promotion Management System
        </p>

      </div>

    </div>
  );
}

export default Login;


// ============================================================
// STYLES
// ============================================================

const styles = {

  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg, #2563eb, #60a5fa)",
  },

  card: {
    background: "#ffffff",
    width: "420px",
    maxWidth: "100%",
    padding: "40px",
    borderRadius: "20px",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.15)",
  },

  logo: {
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "8px",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "25px",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#1f2937",
    fontSize: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#374151",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginBottom: "18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.2s",
  },

  buttonDisabled: {
    background: "#93c5fd",
    cursor: "not-allowed",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px",
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "25px",
  },
};