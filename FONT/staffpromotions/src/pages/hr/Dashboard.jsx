function HRDashboard() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>
        HR Dashboard
      </h2>

      <div style={gridStyle}>

        <div style={cardStyle}>
          <h4>Employees</h4>
          <h2>120</h2>
        </div>

        <div style={cardStyle}>
          <h4>Applications</h4>
          <h2>45</h2>
        </div>

        <div style={cardStyle}>
          <h4>Reports</h4>
          <h2>8</h2>
        </div>

      </div>

    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginTop: "20px"
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center"
};

export default HRDashboard;