function PromotionHistory() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>Promotion History</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Old Position</th>
            <th>New Position</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Officer</td>
            <td>Senior Officer</td>
            <td>2026-08-01</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

const tableStyle = {
  width: "100%",
  marginTop: "20px",
  borderCollapse: "collapse"
};

export default PromotionHistory;