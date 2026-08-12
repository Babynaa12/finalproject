import React from "react";

function Profile() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div>
      <h1>My Profile</h1>

      <div>
        <h3>Personal Information</h3>

        <p>
          Name: {user?.name || "N/A"}
        </p>

        <p>
          Email: {user?.email || "N/A"}
        </p>

        <p>
          Username: {user?.username || "N/A"}
        </p>
      </div>

      <div>
        <h3>Academic Information</h3>

        <p>
          Department: {user?.department_name || "N/A"}
        </p>

        <p>
          Role: {user?.role || "STUDENT"}
        </p>
      </div>
    </div>
  );
}

export default Profile;