import React from "react";
import { Navigate } from "react-router-dom";

function DietaryRequirementsRedirect() {
  return <Navigate to="/preferences" replace />;
}

export default DietaryRequirementsRedirect;
