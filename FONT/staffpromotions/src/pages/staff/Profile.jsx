import { useEffect, useState } from "react";
import api from "../../services/api";

function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    nationality: "",
    department: "",
    job_title: "",
    employment_status: "",
    address: "",
    profile_photo: "",
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // ========================================================
  // LOAD PROFILE
  // ========================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await api.get("/api/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        date_of_birth: data.date_of_birth || "",
        nationality: data.nationality || "",
        department:
          data.department_name ||
          data.department?.department_name ||
          "",
        job_title:
          data.job_title_name ||
          data.job_title?.title_name ||
          "",
        employment_status: data.employment_status || "",
        address: data.address || "",
        profile_photo: data.profile_photo || "",
      });

    } catch (err) {
      console.error(
        "Profile loading error:",
        err.response?.data || err
      );

      // Fallback to localStorage
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        date_of_birth: user.date_of_birth || "",
        nationality: user.nationality || "",
        department:
          user.department_name ||
          user.department?.department_name ||
          "",
        job_title:
          user.job_title_name ||
          user.job_title?.title_name ||
          "",
        employment_status: user.employment_status || "",
        address: user.address || "",
        profile_photo: user.profile_photo || "",
      });

    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // HANDLE CHANGE
  // ========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================================
  // HANDLE PHOTO
  // ========================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must not exceed 5 MB.");
      return;
    }

    setSelectedPhoto(file);

    setProfile((prev) => ({
      ...prev,
      profile_photo: URL.createObjectURL(file),
    }));
  };

  // ========================================================
  // SAVE PROFILE
  // ========================================================

  const saveProfile = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const data = new FormData();

      data.append("first_name", profile.first_name);
      data.append("last_name", profile.last_name);
      data.append("email", profile.email);
      data.append("phone_number", profile.phone_number);
      data.append("date_of_birth", profile.date_of_birth);
      data.append("nationality", profile.nationality);
      data.append("address", profile.address);

      if (selectedPhoto) {
        data.append("profile_photo", selectedPhoto);
      }

      const res = await api.patch(
        "/api/profile/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updated = res.data;

      setProfile((prev) => ({
        ...prev,
        first_name:
          updated.first_name ?? prev.first_name,
        last_name:
          updated.last_name ?? prev.last_name,
        email:
          updated.email ?? prev.email,
        phone_number:
          updated.phone_number ?? prev.phone_number,
        date_of_birth:
          updated.date_of_birth ?? prev.date_of_birth,
        nationality:
          updated.nationality ?? prev.nationality,
        address:
          updated.address ?? prev.address,
        profile_photo:
          updated.profile_photo ?? prev.profile_photo,
      }));

      // Update localStorage user
      const oldUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const newUser = {
        ...oldUser,
        first_name:
          updated.first_name ?? profile.first_name,
        last_name:
          updated.last_name ?? profile.last_name,
        email:
          updated.email ?? profile.email,
        phone_number:
          updated.phone_number ?? profile.phone_number,
        date_of_birth:
          updated.date_of_birth ?? profile.date_of_birth,
        nationality:
          updated.nationality ?? profile.nationality,
        address:
          updated.address ?? profile.address,
        profile_photo:
          updated.profile_photo ?? profile.profile_photo,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(newUser)
      );

      setSelectedPhoto(null);
      setEditMode(false);

      alert("Profile updated successfully.");

    } catch (err) {
      console.error(
        "Profile update error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
        "Failed to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // CANCEL EDIT
  // ========================================================

  const cancelEdit = () => {
    setSelectedPhoto(null);
    fetchProfile();
    setEditMode(false);
  };

  // ========================================================
  // FULL NAME
  // ========================================================

  const fullName =
    `${profile.first_name} ${profile.last_name}`.trim();

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading profile...
      </div>
    );
  }

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div style={styles.container}>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div style={styles.header}>
        <h2 style={styles.title}>
          My Profile
        </h2>

        <p style={styles.subtitle}>
          View and manage your personal and employment
          information.
        </p>
      </div>

      {/* ====================================================
          PROFILE PHOTO
      ==================================================== */}

      <div style={styles.photoSection}>

        {profile.profile_photo ? (
          <img
            src={profile.profile_photo}
            alt="Profile"
            style={styles.profilePhoto}
          />
        ) : (
          <div style={styles.photoPlaceholder}>
            {profile.first_name?.charAt(0)}
            {profile.last_name?.charAt(0)}
          </div>
        )}

        {editMode && (
          <div>
            <label style={styles.photoButton}>
              Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>

            <small style={styles.photoHelp}>
              JPG, PNG or other image. Maximum 5 MB.
            </small>
          </div>
        )}

        {!editMode && (
          <div>
            <h3 style={styles.profileName}>
              {fullName || "Employee"}
            </h3>

            <p style={styles.profilePosition}>
              {profile.job_title || "Position not available"}
            </p>
          </div>
        )}

      </div>

      {/* ====================================================
          PERSONAL INFORMATION
      ==================================================== */}

      <div style={styles.section}>

        <h3 style={styles.sectionTitle}>
          Personal Information
        </h3>

        <div style={styles.grid}>

          {/* FIRST NAME */}

          <div>
            <label style={styles.label}>
              First Name
            </label>

            {editMode ? (
              <input
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.first_name || "-"}
              </div>
            )}
          </div>

          {/* LAST NAME */}

          <div>
            <label style={styles.label}>
              Last Name
            </label>

            {editMode ? (
              <input
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.last_name || "-"}
              </div>
            )}
          </div>

          {/* EMAIL */}

          <div>
            <label style={styles.label}>
              Email
            </label>

            {editMode ? (
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.email || "-"}
              </div>
            )}
          </div>

          {/* PHONE */}

          <div>
            <label style={styles.label}>
              Phone Number
            </label>

            {editMode ? (
              <input
                name="phone_number"
                value={profile.phone_number}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.phone_number || "-"}
              </div>
            )}
          </div>

          {/* DATE OF BIRTH */}

          <div>
            <label style={styles.label}>
              Date of Birth
            </label>

            {editMode ? (
              <input
                type="date"
                name="date_of_birth"
                value={profile.date_of_birth || ""}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.date_of_birth || "-"}
              </div>
            )}
          </div>

          {/* NATIONALITY */}

          <div>
            <label style={styles.label}>
              Nationality
            </label>

            {editMode ? (
              <input
                name="nationality"
                value={profile.nationality}
                onChange={handleChange}
                style={styles.input}
              />
            ) : (
              <div style={styles.value}>
                {profile.nationality || "-"}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ====================================================
          EMPLOYMENT INFORMATION
      ==================================================== */}

      <div style={styles.section}>

        <h3 style={styles.sectionTitle}>
          Employment Information
        </h3>

        <div style={styles.grid}>

          {/* DEPARTMENT */}

          <div>
            <label style={styles.label}>
              Department
            </label>

            <div style={styles.lockedValue}>
              {profile.department || "Not assigned"}
            </div>

            <small style={styles.lockedHelp}>
              Department is managed by the administrator.
            </small>
          </div>

          {/* JOB TITLE */}

          <div>
            <label style={styles.label}>
              Current Position
            </label>

            <div style={styles.lockedValue}>
              {profile.job_title || "Not assigned"}
            </div>

            <small style={styles.lockedHelp}>
              Position is managed by the administrator.
            </small>
          </div>

          {/* EMPLOYMENT STATUS */}

          <div>
            <label style={styles.label}>
              Employment Status
            </label>

            <div style={styles.lockedValue}>
              {profile.employment_status || "Not specified"}
            </div>
          </div>

        </div>

      </div>

      {/* ====================================================
          ADDRESS
      ==================================================== */}

      <div style={styles.section}>

        <h3 style={styles.sectionTitle}>
          Address
        </h3>

        {editMode ? (
          <textarea
            name="address"
            value={profile.address}
            onChange={handleChange}
            rows="4"
            placeholder="Enter your address"
            style={styles.textarea}
          />
        ) : (
          <div style={styles.addressValue}>
            {profile.address || "No address provided"}
          </div>
        )}

      </div>

      {/* ====================================================
          ACTION BUTTONS
      ==================================================== */}

      <div style={styles.actions}>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            style={styles.editButton}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={cancelEdit}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={saveProfile}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </>
        )}

      </div>

    </div>
  );
}

export default Profile;

// ========================================================
// STYLES
// ========================================================

const styles = {

  container: {
    maxWidth: "1000px",
    margin: "30px auto",
    padding: "30px",
    background: "#f8fafc",
    minHeight: "calc(100vh - 60px)",
  },

  loading: {
    textAlign: "center",
    padding: "60px",
    fontSize: "18px",
    color: "#64748b",
  },

  header: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  title: {
    color: "#1e90ff",
    textAlign: "center",
    margin: 0,
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginTop: "8px",
  },

  photoSection: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  profilePhoto: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #e5e7eb",
  },

  photoPlaceholder: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    background: "#1e90ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  profileName: {
    margin: "0 0 5px",
    color: "#1f2937",
  },

  profilePosition: {
    margin: 0,
    color: "#64748b",
  },

  photoButton: {
    display: "inline-block",
    padding: "9px 14px",
    background: "#1e90ff",
    color: "white",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  photoHelp: {
    display: "block",
    marginTop: "7px",
    color: "#64748b",
  },

  section: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  value: {
    padding: "11px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    color: "#374151",
    minHeight: "20px",
  },

  lockedValue: {
    padding: "11px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    color: "#374151",
    minHeight: "20px",
  },

  lockedHelp: {
    display: "block",
    marginTop: "5px",
    color: "#9ca3af",
    fontSize: "12px",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
  },

  addressValue: {
    padding: "15px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    minHeight: "50px",
    color: "#374151",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "20px",
  },

  editButton: {
    padding: "12px 25px",
    background: "#1e90ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  saveButton: {
    padding: "12px 25px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelButton: {
    padding: "12px 25px",
    background: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};