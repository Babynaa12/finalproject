import React, { useState } from "react";

function PromotionMaterial() {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(file);
  };

  return (
    <div>
      <h1>Promotion Materials</h1>

      <form onSubmit={handleSubmit}>

        <label>
          Select Document
        </label>

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <br />

        <button type="submit">
          Upload Material
        </button>

      </form>
    </div>
  );
}

export default PromotionMaterial;