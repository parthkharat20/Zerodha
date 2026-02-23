import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3002/login", {
        email,
        password,
      });

      // Token save karein
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="kite-auth-wrapper">
      {/* Left Panel: Background Image */}
      <div className="auth-left-panel"></div>

      {/* Right Panel: Login Form */}
      <div className="auth-right-panel">
        <div className="auth-container">
          <div className="form-header">
            {/* Logo Image */}
            <img src="/logo.png" alt="Kite Logo" style={{ width: "40px" }} />
            <h2>Login to Kite</h2>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Sign up now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;