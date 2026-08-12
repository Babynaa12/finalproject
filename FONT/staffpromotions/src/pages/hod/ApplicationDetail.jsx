import React from "react";
import { useParams } from "react-router-dom";

function ApplicationDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Application Details</h1>

      <p>Application ID: {id}</p>

      <h3>Applicant Information</h3>

      <h3>Promotion Materials</h3>

      <h3>Teaching Evaluation</h3>

      <h3>Peer Reviews</h3>

      <h3>Research and Publications</h3>

      <h3>Service Activities</h3>
    </div>
  );
}

export default ApplicationDetail;