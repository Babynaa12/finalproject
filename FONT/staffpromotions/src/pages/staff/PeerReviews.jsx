import React from "react";

function PeerReviews() {
  return (
    <div>
      <h1>Peer Reviews</h1>

      <p>
        View the status of peer reviews associated
        with your promotion application.
      </p>

      <table>
        <thead>
          <tr>
            <th>Reviewer</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Reviewer 1</td>
            <td>Completed</td>
          </tr>

          <tr>
            <td>Reviewer 2</td>
            <td>Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PeerReviews;