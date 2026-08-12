import React from "react";
import { useParams } from "react-router-dom";

function ReviewApplication() {
  const { id } = useParams();

  return (
    <div>
      <h1>Review Promotion Application</h1>

      <p>Application ID: {id}</p>

      <h3>Application Documents</h3>

      <h3>Teaching Evaluation</h3>

      <h3>Peer Reviews</h3>

      <h3>Research Materials</h3>

      <h3>HOD Recommendation</h3>

      <textarea
        placeholder="Enter your comments..."
        rows="5"
      />

      <div>
        <button>Recommend</button>
        <button>Not Recommend</button>
      </div>
    </div>
  );
}

export default ReviewApplication;