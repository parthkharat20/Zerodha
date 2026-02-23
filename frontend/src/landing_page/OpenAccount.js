import React from "react";
import { Link } from "react-router-dom"; // Link import karna mat bhoolna

function OpenAccount() {
  return (
    <div className="container mt-5">
      <div className="row text-center">
        <div className="col-2"></div>
        <div className="col-8">
          <h1>Open a Zerodha Account</h1>
          <p>Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.</p>
          
          {/* Internal Link to show the Frontend Signup Page */}
          <Link 
            to="/signup" 
            className="p-2 btn btn-primary fs-5 mb-5"
          >
            Sign up Now
          </Link>
        </div>
        <div className="col-2"></div>
      </div>
    </div>
  );
}

export default OpenAccount;