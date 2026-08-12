import React from "react";

function EvaluationHistory() {
  return (
    <div>
      <h1>Evaluation History</h1>

      <p>
        View your previously completed teaching evaluations.
      </p>

      <table>
        <thead>
          <tr>
            <th>Lecturer</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Irshad Haji</td>
            <td>Database Systems</td>
            <td>Semester 1</td>
            <td>10/08/2026</td>
            <td>Completed</td>
          </tr>

          <tr>
            <td>Asha Ali</td>
            <td>Web Development</td>
            <td>Semester 1</td>
            <td>08/08/2026</td>
            <td>Completed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default EvaluationHistory;