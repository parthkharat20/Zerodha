import React from 'react'

function Team() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5 border-top">
        <h1 className="text-center">
            People
        </h1>
      </div>
      <div className="row p-5 border-top text-muted fs-5" style={{lineHeight: "1.8", fontSize: "1.2em"}}>
        <div className="col-6 p-5 text-center">
          <img src='media/images/nithinKamath.jpg' style={{borderRadius: "100%", width: "60%"}}/>
          <h4 className='mt-5'>Nithin Kamath</h4>
          <h6>Founder, CEO</h6>
        </div>
        <div className="col-6 p-5">
          <p>
            In addition, we run a number of popular open online educational and
            community initiatives to empower retail traders and investors.
          </p>
          <p>
            <span style={{ color: "blue" }}>Rainmatter</span>, our fintech fund
            and incubator, has invested in several fintech startups with the
            goal of growing the Indian capital markets.
          </p>
          <p>
            And yet, we are always up to something new every day. Catch up on
            the latest updates on our blog or see what the media is saying about
            us or learn more about our business and product philosophies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Team
