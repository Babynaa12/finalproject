function Applications() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>Promotion Applications</h2>

      <div style={{ marginTop: "20px" }}>

        <div style={boxStyle}>
          <h4>John Doe</h4>
          <p>Requested: Senior Officer</p>
          <button style={btnApprove}>Approve</button>
          <button style={btnReject}>Reject</button>
        </div>

        <div style={boxStyle}>
          <h4>Jane Smith</h4>
          <p>Requested: Manager</p>
          <button style={btnApprove}>Approve</button>
          <button style={btnReject}>Reject</button>
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

const btnApprove = {
  background: "green",
  color: "white",
  border: "none",
  padding: "8px 12px",
  marginRight: "10px",
  borderRadius: "6px",
  cursor: "pointer"
};

const btnReject = {
  background: "red",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Applications;