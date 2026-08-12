import React from "react";

function TeachingEvaluations() {
  return (
    <div>
      <h1>Teaching Evaluations</h1>

      <p>
        Please evaluate the teaching performance of your lecturers.
      </p>

      <table>
        <thead>
          <tr>
            <th>Lecturer</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Irshad Haji</td>
            <td>Database Systems</td>
            <td>Semester 1</td>
            <td>Pending</td>
            <td>
              <button>
                Evaluate
              </button>
            </td>
          </tr>

          <tr>
            <td>Asha Ali</td>
            <td>Web Development</td>
            <td>Semester 1</td>
            <td>Completed</td>
            <td>
              <button disabled>
                Completed
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TeachingEvaluations;