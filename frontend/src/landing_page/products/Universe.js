import React from 'react'

const Universe = () => {

  const logoStyle = {
    height: "50px",
    objectFit: "contain"
  };

  return (
    <div className='container mt-5'>
      <div className='row text-center d-flex flex-column align-items-center mt-5'>
        <h3>True P&L</h3>

        <img 
          src='media/images/kite-pnl.png' 
          style={{ width: "70%" }} 
          className="img-fluid"
        />

        <p className='text-muted' style={{fontSize: "fs-5"}}>
          Console crunches tens of billions of rows of historical trade breakdowns to keep track of corporate actions, splits, <br></br>
          transfers, and more to compute the most accurate profit and loss statements (P&L) for your portfolio.
        </p>
      </div>

      <div className="row text-center mt-5 p-5">
        <h1>The Zerodha Universe</h1>
        <p>
          Extend your trading and investment experience even further with our
          partner platforms
        </p>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/smallcaseLogo.png" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/streakLogo.png" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/sensibullLogo.svg" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/zerodhaFundhouse.png" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/goldenpiLogo.png" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <div className="col-4 p-3 mt-5">
          <img src="media/images/dittoLogo.png" style={logoStyle} className="img-fluid" />
          <p className="text-small text-muted">Thematic investment platform</p>
        </div>

        <button
          className="p-2 btn btn-primary fs-5 mb-5"
          style={{ width: "20%", margin: "0 auto" }}
        >
          Signup Now
        </button>
      </div>
    </div>
  )
}

export default Universe
