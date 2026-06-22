import "../styles/Navbar.css";

function Navbar({ role }) {
  const navbarData = {
    staff: {
      title: "Staff Dashboard",
      welcome: "Welcome, Staff",
    },

    manager: {
      title: "Manager Dashboard",
      welcome: "Welcome, Manager",
    },

    hr: {
      title: "HR Dashboard",
      welcome: "Welcome, HR",
    },
  };

  const current = navbarData[role] || {
    title: "Dashboard",
    welcome: "Welcome",
  };

  return (
    <div className="navbar">
      <h3>{current.title}</h3>

      <div className="navbar-right">
        <span>{current.welcome}</span>
      </div>
    </div>
  );
}

export default Navbar;