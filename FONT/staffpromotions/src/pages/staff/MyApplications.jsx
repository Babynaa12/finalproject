function MyApplications() {
  return (
    <div className="table-container">

      <h3>My Applications</h3>

      <table>
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>001</td>
            <td>Senior Officer</td>
            <td>Pending</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

export default MyApplications;