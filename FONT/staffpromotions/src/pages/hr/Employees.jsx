function Employees() {
  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{ color: "#1e90ff" }}>All Employees</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>John Doe</td>
            <td>ICT</td>
            <td>Officer</td>
            <td>Active</td>
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

export default Employees;