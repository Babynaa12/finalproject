import "../../styles/Dashboard.css";
function Dashboard() {
  return (
    <div className="cards">

      <div className="card">
        <h5>Applications</h5>
        <h2>12</h2>
      </div>

      <div className="card">
        <h5>Pending</h5>
        <h2>5</h2>
      </div>

      <div className="card">
        <h5>Approved</h5>
        <h2>4</h2>
      </div>

      <div className="card">
        <h5>Rejected</h5>
        <h2>3</h2>
      </div>

      <div className="table-container">
        <h4>Recent Applications</h4>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Position</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>01/08/2026</td>
              <td>Senior Officer</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;