import React from "react";

function Dashboard() {
  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <h1>Dean Dashboard</h1>
        <p>
          Academic Staff Promotion Management
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Pending Applications</h3>
          <p>8</p>
          <span>Awaiting Dean Review</span>
        </div>

        <div className="dashboard-card">
          <h3>Under Review</h3>
          <p>4</p>
          <span>Currently being reviewed</span>
        </div>

        <div className="dashboard-card">
          <h3>Recommended</h3>
          <p>12</p>
          <span>Recommended for promotion</span>
        </div>

        <div className="dashboard-card">
          <h3>Rejected</h3>
          <p>2</p>
          <span>Not recommended</span>
        </div>

      </div>

      {/* APPLICATION OVERVIEW */}
      <div className="dashboard-section">

        <h2>Recent Applications</h2>

        <table className="data-table">

          <thead>
            <tr>
              <th>Application ID</th>
              <th>Applicant</th>
              <th>Department</th>
              <th>Applied Rank</th>
              <th>HOD Recommendation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>APP-001</td>
              <td>Irshad Haji</td>
              <td>School of Computing</td>
              <td>Lecturer</td>
              <td>Recommended</td>
              <td>Pending</td>

              <td>
                <button>
                  Review
                </button>
              </td>
            </tr>

            <tr>
              <td>APP-002</td>
              <td>Fatma Ali</td>
              <td>School of Education</td>
              <td>Senior Lecturer</td>
              <td>Recommended</td>
              <td>Under Review</td>

              <td>
                <button>
                  Review
                </button>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-section">

        <h2>Quick Actions</h2>

        <div className="quick-actions">

          <button>
            View Applications
          </button>

          <button>
            Review Pending
          </button>

          <button>
            Promotion History
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;