import { useEffect, useState } from "react";
import api from "../../services/api";

function MyApplications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/api/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // FILTER ONLY CURRENT STAFF
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

  return (
    <div className="table-container">

      <h3>My Applications</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Current Position</th>
              <th>Target Position</th>
              <th>Manager Status</th>
              <th>HR Status</th>
              <th>Final Status</th>
            </tr>
          </thead>

          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.current_title_name}</td>
                  <td>{app.targeted_title_name}</td>
                  <td>{app.manager_status}</td>
                  <td>{app.hr_status}</td>
                  <td>{app.final_status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No applications found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyApplications;