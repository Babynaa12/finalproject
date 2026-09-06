import React, { useEffect, useState } from "react";
import api from "../../services/api";

const MATERIAL_OPTIONS = [
  { value: "JOURNAL_ARTICLE", label: "Journal Articles" },
  { value: "BOOK_CHAPTER", label: "Chapters in a Book" },
  { value: "SCHOLARLY_BOOK", label: "Scholarly Books" },
  { value: "INTERNATIONAL_PROCEEDINGS", label: "Scholarly Papers in Proceedings of Professional International Symposia or Conferences" },
  { value: "CASE_REPORT", label: "Case Reports or Short Communications" },
  { value: "PATENT", label: "Patents" },
  { value: "CONSULTANCY_REPORT", label: "Consultancy Reports" },
  { value: "CONFERENCE_PAPER", label: "Conference Papers" },
  { value: "EXTENSION_MATERIAL", label: "Extension Materials" },
  { value: "LOWER_LEVEL_BOOK", label: "Lower-level Books" },
  { value: "DICTIONARY", label: "Subject and General Dictionaries" },
  { value: "DICTIONARY_LETTER", label: "Letters in Dictionaries" },
  { value: "BOOK_REVIEW", label: "Book Reviews" },
  { value: "JOURNAL_REVIEW", label: "Journal Articles Review" },
];

function PromotionMaterial() {
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [form, setForm] = useState({
    material_type: "JOURNAL_ARTICLE",
    points: "",
    document: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data || []);
      if ((response.data || []).length) {
        setSelectedApplicationId(String(response.data[0].id));
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError("Unable to load your applications.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedApplicationId) {
      setError("Please select an application first.");
      return;
    }

    if (!form.material_type) {
      setError("Please select a material type.");
      return;
    }

    const payload = new FormData();
    payload.append("application", String(selectedApplicationId));
    payload.append("material_type", form.material_type);
    payload.append("points", form.points || "0");

    if (form.document) {
      payload.append("document", form.document);
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      await api.post("/api/promotion-materials/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Promotion material uploaded successfully.");
      setForm((prev) => ({
        ...prev,
        points: "",
        document: null,
      }));
    } catch (err) {
      console.error("Material upload failed:", err.response?.data || err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to upload the promotion material."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: 24 }}>
      <h2>Promotion Materials</h2>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Application</label>
          <select
            value={selectedApplicationId}
            onChange={(e) => setSelectedApplicationId(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          >
            <option value="">Select application</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.employee_name || "Application"} #{application.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Material Type</label>
          <select
            value={form.material_type}
            onChange={(e) => setForm({ ...form, material_type: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          >
            {MATERIAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Claimed Points</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })}
            placeholder="0.00"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Supporting Document (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })}
            style={{ width: "100%" }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            background: submitting ? "#9ca3af" : "#2563eb",
            color: "#fff",
            padding: "12px 18px",
            border: "none",
            borderRadius: 8,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Uploading..." : "Upload Material"}
        </button>
      </form>
    </div>
  );
}

export default PromotionMaterial;