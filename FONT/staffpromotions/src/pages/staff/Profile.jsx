import { useEffect, useState } from "react";
import api from "../../services/api";

function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [departments, setDepartments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: "",
    position: user?.role || ""
  });

  // ======================
  // LOAD DEPARTMENTS
  // ======================
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/api/departments/");
        setDepartments(res.data);

        // OPTIONAL: assign first department (or match backend relation if exists)
        if (res.data.length > 0) {
          setProfile((prev) => ({
            ...prev,
            department: res.data[0].department_name
          }));
        }

      } catch (err) {
        console.log("Department error:", err);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "#1e90ff", textAlign: "center" }}>
        My Profile
      </h2>

      {/* VIEW MODE */}
      {!editMode && (
        <div style={styles.card}>
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Department:</b> {profile.department}</p>
          <p><b>Position:</b> {profile.position}</p>

          <button onClick={() => setEditMode(true)} style={styles.button}>
            Edit Profile
          </button>
        </div>
      )}

      {/* EDIT MODE */}
      {editMode && (
        <div style={styles.card}>
          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            style={styles.input}
            placeholder="Name"
          />

          <input
            name="email"
            value={profile.email}
            onChange={handleChange}
            style={styles.input}
            placeholder="Email"
          />

          {/* DEPARTMENT (READ ONLY OR SELECT) */}
          <select
            name="department"
            value={profile.department}
            onChange={handleChange}
            style={styles.input}
          >
            {departments.map((dep) => (
              <option key={dep.id} value={dep.department_name}>
                {dep.department_name}
              </option>
            ))}
          </select>

          {/* POSITION LOCKED (NO EDIT) */}
          <input
            value={profile.position}
            disabled
            style={{ ...styles.input, background: "#f3f4f6" }}
          />

          <button onClick={() => setEditMode(false)} style={styles.button}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;

// ======================
// STYLES
// ======================
const styles = {
  container: {
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    background: "#1e90ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};