import React from "react";
import { useParams } from "react-router-dom";

function ReviewMaterial() {
  const { id } = useParams();

  return (
    <div>
      <h1>Review Promotion Material</h1>

      <p>
        Review ID: {id}
      </p>

      <section>
        <h2>Applicant Information</h2>

        <p>Name: Applicant Name</p>
        <p>Department: Department</p>
        <p>Current Rank: Assistant Lecturer</p>
        <p>Applied Rank: Lecturer</p>
      </section>

      <section>
        <h2>Teaching</h2>

        <button>View Teaching Evaluation</button>
      </section>

      <section>
        <h2>Research</h2>

        <button>View Publications</button>
        <button>View Research Projects</button>
      </section>

      <section>
        <h2>Academic Service</h2>

        <button>View Service Activities</button>
      </section>

      <section>
        <h2>Supporting Documents</h2>

        <button>View CV</button>
        <button>View Certificates</button>
        <button>View Other Documents</button>
      </section>

      <section>
        <h2>Reviewer Comments</h2>

        <textarea
          rows="6"
          placeholder="Enter your review comments..."
        />
      </section>

      <section>
        <h2>Recommendation</h2>

        <label>
          <input
            type="radio"
            name="recommendation"
            value="satisfactory"
          />
          Satisfactory
        </label>

        <br />

        <label>
          <input
            type="radio"
            name="recommendation"
            value="not_satisfactory"
          />
          Not Satisfactory
        </label>
      </section>

      <br />

      <button>
        Submit Review
      </button>
    </div>
  );
}

export default ReviewMaterial;