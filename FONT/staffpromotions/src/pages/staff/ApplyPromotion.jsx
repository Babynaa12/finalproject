function ApplyPromotion() {
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "30px auto",
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1e90ff" }}>
        Apply For Promotion
      </h3>

      <form style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        <input
          type="text"
          placeholder="Current Position"
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Target Position"
          style={inputStyle}
        />

        <textarea
          placeholder="Reason"
          rows="4"
          style={{ ...inputStyle, resize: "none" }}
        ></textarea>

        <input type="file" />

        <button
          type="submit"
          style={buttonStyle}
        >
          Submit Application
        </button>

      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px"
};

const buttonStyle = {
  padding: "12px",
  background: "#1e90ff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "bold"
};

export default ApplyPromotion;