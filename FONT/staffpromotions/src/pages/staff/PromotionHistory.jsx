import StaffLayout from "../../layouts/StaffLayout";

function PromotionHistory() {
  return (


      <div className="table-container">

        <h3>Promotion History</h3>

        <table>
          <thead>
            <tr>
              <th>Old Position</th>
              <th>New Position</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Officer</td>
              <td>Senior Officer</td>
              <td>12/05/2026</td>
            </tr>
          </tbody>
        </table>

      </div>
    
  );
}

export default PromotionHistory;