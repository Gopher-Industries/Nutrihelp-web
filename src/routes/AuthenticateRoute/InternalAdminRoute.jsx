import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/user.context";

function allowLocalDevAccess() {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

const InternalAdminRoute = ({ children }) => {
  const { currentUser, authReady } = useContext(UserContext);

  if (allowLocalDevAccess()) {
    return children;
  }

  if (!authReady) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = String(currentUser.role || "").toLowerCase();
  if (role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default InternalAdminRoute;
