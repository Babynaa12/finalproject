import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>
          Staff Promotion Management System
        </h1>

        <h3 style={styles.title}>
          Welcome Back
        </h3>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            style={styles.input}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            style={styles.button}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#2563eb,#60a5fa)",
  },

  card: {
    background: "#fff",
    width: "420px",
    padding: "40px",
    borderRadius: "20px",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.1)",
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
};

export default Login;