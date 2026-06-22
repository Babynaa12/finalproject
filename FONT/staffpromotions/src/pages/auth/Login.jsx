import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isEmail = identifier.includes("@");

      // ✅ send ONLY one identifier
      const payload = {
        password,
        ...(isEmail
          ? { email: identifier }
          : { username: identifier }),
      };

      const res = await api.post("/api/auth/login/", payload);

      const user = res.data.user;
      const token = res.data.access;

      // SAVE AUTH DATA
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role?.toLowerCase();

      // =========================
      // ROLE BASED REDIRECT
      // =========================
      if (role === "staff") {
        navigate("/staff/dashboard");
      } 
      else if (role === "manager") {
        navigate("/manager/dashboard");
      } 
      else if (role === "hr") {
        navigate("/hr/dashboard");
      } 
      else {
        setError("Unauthorized role. Contact system administrator.");
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Staff Promotion System</h1>
        <h3 style={styles.title}>Welcome Back</h3>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

// =========================
// STYLES
// =========================
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#2563eb,#60a5fa)",
  },

  card: {
    background: "#fff",
    width: "420px",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },

  logo: {
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "10px",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
};