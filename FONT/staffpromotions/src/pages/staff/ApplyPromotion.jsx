import { useEffect, useState } from "react";
import api from "../../services/api";

function ApplyPromotion() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [jobTitles, setJobTitles] = useState([]);

  const [form, setForm] = useState({
    employee: user.id,
    current_title: "",
    targeted_title: "",
    manager_status: "Pending",
    hr_status: "Pending",
    final_status: "Pending",
    manager_comments: "",
    hr_comments: "",
  });

  // FILE STATES
  const [cv, setCv] = useState(null);
  const [applicationForm, setApplicationForm] = useState(null);
  const [checkpointForm, setCheckpointForm] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/api/jobtitles/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobTitles(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitApplication = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();

      // TEXT FIELDS
      data.append("employee", form.employee);
      data.append("current_title", form.current_title);
      data.append("targeted_title", form.targeted_title);
      data.append("manager_status", form.manager_status);
      data.append("hr_status", form.hr_status);
      data.append("final_status", form.final_status);
      data.append("manager_comments", form.manager_comments);
      data.append("hr_comments", form.hr_comments);

      // FILES
      data.append("cv", cv);
      data.append("application_form", applicationForm);
      data.append("checkpoint_form", checkpointForm);

      await api.post("/api/applications/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Promotion application submitted successfully ✔");

      setForm({
        employee: user.id,
        current_title: "",
        targeted_title: "",
        manager_status: "Pending",
        hr_status: "Pending",
        final_status: "Pending",
        manager_comments: "",
        hr_comments: "",
      });

      setCv(null);
      setApplicationForm(null);
      setCheckpointForm(null);

    } catch (err) {
      console.log(err.response?.data);
      setError("Failed to submit application.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Promotion Application</h2>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={submitApplication}>

        {/* CURRENT TITLE */}
        <label>Current Position</label>
        <select
          name="current_title"
          value={form.current_title}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Current Position</option>
          {jobTitles.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title_name}
            </option>
          ))}
        </select>

        {/* TARGET TITLE */}
        <label>Target Position</label>
        <select
          name="targeted_title"
          value={form.targeted_title}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Target Position</option>
          {jobTitles.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title_name}
            </option>
          ))}
        </select>

        {/* FILES */}
        <label>CV (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCv(e.target.files[0])}
          style={styles.input}
        />

        <label>Application Form (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setApplicationForm(e.target.files[0])}
          style={styles.input}
        />

        <label>Checkpoint Form (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCheckpointForm(e.target.files[0])}
          style={styles.input}
        />

        {/* SUBMIT */}
        <button type="submit" style={styles.button}>
          Submit Application
        </button>
      </form>
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: "#2563eb",
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  success: {
    color: "green",
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
};

export default ApplyPromotion;