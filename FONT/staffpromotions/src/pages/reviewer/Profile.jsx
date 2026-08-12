import React from "react";

function Profile() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div>
      <h1>My Profile</h1>

      <p>
        Name: {user?.name || "N/A"}
      </p>

      <p>
        Email: {user?.email || "N/A"}
      </p>

      <p>
        Role: {user?.role || "REVIEWER"}
      </p>

      <p>
        Department: {user?.department_name || "N/A"}
      </p>
    </div>
  );
}

export default Profile;