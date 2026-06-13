import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function StaffLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StaffLayout;