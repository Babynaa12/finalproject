import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaSearch, FaEye, FaUserTie } from "react-icons/fa";

function Staff() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH DEPARTMENT STAFF
  // ============================================================

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const response = await api.get(
        "/api/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Only academic staff
      const staffData = response.data.filter(
        (user) =>
          String(user.role || "").toUpperCase() === "STAFF"
      );

      setStaff(staffData);
      setFilteredStaff(staffData);

    } catch (error) {
      console.error("Failed to load staff:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredStaff(staff);
      return;
    }

    const results = staff.filter((member) => {

      const name =
        member.name ||
        `${member.first_name || ""} ${member.last_name || ""}`;

      return (
        name.toLowerCase().includes(value) ||
        String(member.username || "")
          .toLowerCase()
          .includes(value) ||
        String(member.email || "")
          .toLowerCase()
          .includes(value) ||
        String(member.department || "")
          .toLowerCase()
          .includes(value) ||
        String(member.current_position || "")
          .toLowerCase()
          .includes(value)
      );
    });

    setFilteredStaff(results);

  }, [search, staff]);

  // ============================================================
  // STAFF NAME
  // ============================================================

  const getStaffName = (member) => {
    if (member.name) {
      return member.name;
    }

    const fullName =
      `${member.first_name || ""} ${member.last_name || ""}`
        .trim();

    return fullName || member.username || "Unknown Staff";
  };

  // ============================================================
  // VIEW STAFF
  // ============================================================

  const handleView = (id) => {
    navigate(`/hod/staff/${id}`);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading department staff...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Department Staff
          </h1>

          <p style={styles.subtitle}>
            View academic staff in your department.
          </p>

        </div>

        <div style={styles.totalBox}>

          <FaUserTie />

          <div>
            <span>Total Staff</span>
            <strong>{staff.length}</strong>
          </div>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div style={styles.toolbar}>

        <div style={styles.searchBox}>

          <FaSearch style={styles.searchIcon} />

          <input
            type="text"
            placeholder="Search staff by name, email, department..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.searchInput}
          />

        </div>

        <span style={styles.resultCount}>
          {filteredStaff.length} staff found
        </span>

      </div>


      {/* ======================================================
          STAFF TABLE
      ====================================================== */}

      <div style={styles.tableCard}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                #
              </th>

              <th style={styles.th}>
                Staff Name
              </th>

              <th style={styles.th}>
                Email
              </th>

              <th style={styles.th}>
                Department
              </th>

              <th style={styles.th}>
                Current Position
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredStaff.length > 0 ? (

              filteredStaff.map((member, index) => (

                <tr
                  key={member.id}
                  style={styles.tr}
                >

                  <td style={styles.td}>
                    {index + 1}
                  </td>

                  {/* STAFF */}

                  <td style={styles.td}>

                    <div style={styles.staffInfo}>

                      <div style={styles.avatar}>
                        {getStaffName(member)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {getStaffName(member)}
                        </strong>

                        <small>
                          {member.username || ""}
                        </small>

                      </div>

                    </div>

                  </td>


                  {/* EMAIL */}

                  <td style={styles.td}>
                    {member.email || "—"}
                  </td>


                  {/* DEPARTMENT */}

                  <td style={styles.td}>
                    {member.department || "—"}
                  </td>


                  {/* POSITION */}

                  <td style={styles.td}>
                    {member.current_position ||
                      member.current_title_name ||
                      "—"}
                  </td>


                  {/* STATUS */}

                  <td style={styles.td}>

                    <span style={styles.activeStatus}>
                      Active
                    </span>

                  </td>


                  {/* ACTION */}

                  <td style={styles.td}>

                    <button
                      style={styles.viewButton}
                      onClick={() =>
                        handleView(member.id)
                      }
                    >

                      <FaEye />

                      <span>
                        View
                      </span>

                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="7"
                  style={styles.empty}
                >

                  <FaUserTie
                    size={35}
                    style={{
                      marginBottom: "10px",
                    }}
                  />

                  <div>
                    No department staff found.
                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


// ============================================================
// INLINE STYLES
// ============================================================

const styles = {

  page: {
    padding: "30px",
    background: "#f5f7fb",
    minHeight: "100vh",
    color: "#1f2937",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#172554",
  },

  subtitle: {
    marginTop: "7px",
    color: "#64748b",
  },

  totalBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    color: "#2563eb",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  searchBox: {
    position: "relative",
    width: "420px",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "14px",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 15px 12px 40px",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    outline: "none",
    background: "#ffffff",
    fontSize: "14px",
  },

  resultCount: {
    color: "#64748b",
    fontSize: "14px",
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: "15px",
    textAlign: "left",
    fontSize: "13px",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
  },

  tr: {
    borderBottom: "1px solid #eef2f7",
  },

  td: {
    padding: "15px",
    fontSize: "14px",
    color: "#334155",
  },

  staffInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  activeStatus: {
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    padding: "50px",
    color: "#94a3b8",
  },

  loading: {
    background: "#ffffff",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
  },

};

export default Staff;