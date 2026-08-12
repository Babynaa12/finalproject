import React, { useState } from "react";

function Appeal() {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      reason,
    });
  };

  return (
    <div>
      <h1>Promotion Appeal</h1>

      <p>
        You may submit an appeal if your promotion
        application was rejected.
      </p>

      <form onSubmit={handleSubmit}>

        <label>
          Reason for Appeal
        </label>

        <textarea
          rows="6"
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          placeholder="Explain why you are appealing..."
        />

        <br />

        <label>
          Supporting Document
        </label>

        <input type="file" />

        <br />

        <button type="submit">
          Submit Appeal
        </button>

      </form>
    </div>
  );
}

export default Appeal;