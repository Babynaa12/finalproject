function ManagerDashboard() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>
        Manager Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        <div style={cardStyle}>
          <h4>Employees</h4>
          <h2>25</h2>
        </div>

        <div style={cardStyle}>
          <h4>Appraisals</h4>
          <h2>10</h2>
        </div>

        <div style={cardStyle}>
          <h4>Reports</h4>
          <h2>5</h2>
        </div>

      </div>

    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center"
};

export default ManagerDashboard;