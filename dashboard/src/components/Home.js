import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected route — TopBar + Dashboard sirf logged in user dekh sakta hai */}
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <>
              <TopBar />
              <Dashboard />
            </>
          </PrivateRoute>
        }
      />

      {/* Default — koi bhi route nahi match hota toh Login pe redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default Home;