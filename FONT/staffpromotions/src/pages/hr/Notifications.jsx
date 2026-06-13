function Notifications() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>Notifications</h2>

      <div style={boxStyle}>
        New promotion application received
      </div>

      <div style={boxStyle}>
        Employee appraisal completed
      </div>

    </div>
  );
}

const boxStyle = {
  background: "white",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

export default Notifications;