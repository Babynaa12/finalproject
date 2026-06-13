    function Appraisals() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>Appraisals</h2>

      <div style={{ marginTop: "20px" }}>

        <div style={boxStyle}>
          <h4>John Doe</h4>
          <p>Performance: Excellent</p>
        </div>

        <div style={boxStyle}>
          <h4>Jane Smith</h4>
          <p>Performance: Good</p>
        </div>

      </div>

    </div>
  );
}

const boxStyle = {
  background: "white",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

export default Appraisals;