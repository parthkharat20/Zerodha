import React from 'react';

function Signup() {
  return (
    <div className="container">
      <div className="row p-5 mt-5">
        <div className="col-7 p-5">
          <img 
            src="media/images/signup.png" 
            style={{ width: "100%" }} 
            alt="Signup Features" 
          />
        </div>
        <div className="col-5 p-5">
          <h1 className="fs-2 mb-4">Signup now</h1>
          <p className="text-muted">Or track your existing application</p>
          
          <div className="mt-4">
            <label 
              htmlFor="mobile" 
              className="text-muted mb-2" 
              style={{ fontSize: "0.8rem", fontWeight: "500" }}
            >
              Mobile Number
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-white text-muted">+91</span>
              <input 
                type="text" 
                className="form-control" 
                id="mobile" 
                placeholder="Your mobile number" 
                autoFocus 
              />
            </div>
            
            <p className="text-muted" style={{ fontSize: "0.75rem" }}>
              You will receive an OTP on your number
            </p>
            
            {/* Yahan hum button ko <a> tag bana rahe hain jo Dashboard par le jayega.
               Agar aapka Dashboard Login page '/login' par hai, toh url check kar lein.
               Maine 'http://localhost:3001/signup' rakha hai, agar dashboard me ye route nahi hai to '/register' use karein.
            */}
            <a 
              href="http://localhost:3001/signup"
              className="btn btn-primary w-100 mt-2 p-2 fs-5 text-decoration-none text-white" 
              style={{ backgroundColor: "rgb(56, 126, 209)", border: "none" }}
            >
              Continue
            </a>
            
            <div className="mt-3 text-center">
               <a href="#" className="text-decoration-none" style={{fontSize: "0.85rem"}}>
                 Want to open an NRI account?
               </a>
            </div>
          </div>

          <div className="mt-5 text-center text-muted" style={{ fontSize: "0.75rem" }}>
            <p>
              By proceeding, you agree to the <a href="#" className="text-dark">Zerodha Terms</a> and <a href="#" className="text-dark">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
      
      <div className="row text-center mt-5 mb-5 p-5">
        <p className="text-muted">
           I authorise Zerodha to contact me even if my number is registered on DND...
        </p>
      </div>
    </div>
  );
}

export default Signup;