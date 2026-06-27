import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedAdminRoute({ children }) {
  // Check if admin is logged in by looking for the admin flag in localStorage
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  if (!isAdminLoggedIn) {
    // If not logged in as admin, redirect to admin login page
    return <Navigate to="/admin-login" replace />;
  }

  // If admin is logged in, render the protected route's children components
  return children;
}
