import { useState } from "react";

function Profile() {
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@gmail.com",
    department: "ICT",
    position: "Officer"
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "30px auto",
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}
    >

      <h3 style={{ textAlign: "center", color: "#1e90ff" }}>
        My Profile
      </h3>

      {/* VIEW MODE */}
      {!editMode && (
        <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Department:</b> {profile.department}</p>
          <p><b>Position:</b> {profile.position}</p>

          <button
            onClick={() => setEditMode(true)}
            style={buttonStyle}
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* EDIT MODE */}
      {editMode && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>

          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Name"
          />

          <input
            name="email"
            value={profile.email}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Email"
          />

          <input
            name="department"
            value={profile.department}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Department"
          />

          <input
            name="position"
            value={profile.position}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Position"
          />

          <button
            onClick={() => setEditMode(false)}
            style={buttonStyle}
          >
            Save Changes
          </button>

        </div>
      )}

    </div>
  );
}

/* STYLES */
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none"
};

const buttonStyle = {
  marginTop: "10px",
  padding: "12px",
  background: "#1e90ff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Profile;