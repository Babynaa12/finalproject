function Reviews() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>Reviews</h2>

      <textarea
        placeholder="Write review..."
        style={textareaStyle}
      />

      <button style={buttonStyle}>
        Submit Review
      </button>

    </div>
  );
}

const textareaStyle = {
  width: "100%",
  height: "120px",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "8px"
};

const buttonStyle = {
  marginTop: "10px",
  padding: "10px 15px",
  background: "#1e90ff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

export default Reviews;