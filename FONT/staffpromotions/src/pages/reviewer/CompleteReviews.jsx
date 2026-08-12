import React from "react";

function CompleteReviews() {
  return (
    <div>
      <h1>Completed Reviews</h1>

      <p>
        View promotion reviews that you have already completed.
      </p>

      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Applied Rank</th>
            <th>Recommendation</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Example Applicant</td>
            <td>Lecturer</td>
            <td>Satisfactory</td>
            <td>12/08/2026</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CompleteReviews;