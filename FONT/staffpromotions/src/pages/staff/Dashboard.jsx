import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ONLY THIS STAFF DATA
      const myApps = res.data.filter(
        (app) => app.employee === user.id
      );

      setApplications(myApps);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // COUNTS
  const total = applications.length;

  const pending = applications.filter(
    (a) => a.final_status === "Pending"
  ).length;

  const approved = applications.filter(
    (a) => a.final_status === "Approved"
  ).length;

  const rejected = applications.filter(
    (a) => a.final_status === "Rejected"
  ).length;

  // RECENT 5
  const recent = [...applications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="dashboard-container">

      <div className="cards">

        <div className="card">
          <h5>Total Applications</h5>
          <h2>{total}</h2>
        </div>

        <div className="card">
          <h5>Pending</h5>
          <h2>{pending}</h2>
        </div>

        <div className="card">
          <h5>Approved</h5>
          <h2>{approved}</h2>
        </div>

        <div className="card">
          <h5>Rejected</h5>
          <h2>{rejected}</h2>
        </div>

      </div>

      {/* RECENT TABLE */}
      <div className="table-container">

        <h4>Recent Applications</h4>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Current Position</th>
                <th>Target Position</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recent.length > 0 ? (
                recent.map((app) => (
                  <tr key={app.id}>
                    <td>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td>{app.current_title_name}</td>
                    <td>{app.targeted_title_name}</td>
                    <td>{app.final_status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No applications yet</td>
                </tr>
              )}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default Dashboard;