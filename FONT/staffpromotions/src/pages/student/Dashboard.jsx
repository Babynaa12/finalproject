import React from "react";

function Dashboard() {
  return (
    <div>
      <h1>Student Dashboard</h1>

      <p>
        Welcome to the Student Teaching Evaluation Portal.
      </p>

      <div>
        <h3>Pending Evaluations</h3>
        <p>2</p>
      </div>

      <div>
        <h3>Completed Evaluations</h3>
        <p>5</p>
      </div>

      <div>
        <h3>Evaluation History</h3>
        <p>5 evaluations</p>
      </div>
    </div>
  );
}

export default Dashboard;