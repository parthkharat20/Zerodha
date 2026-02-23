import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Token hai toh Dashboard dikhaao, nahi hai toh Login pe redirect karo
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;