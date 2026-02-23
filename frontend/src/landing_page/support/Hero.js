import React from "react";

function Hero() {
  return (
    <section className="container-fluid text-white" id="supportHero">
      <div className="d-flex justify-content-between align-items-center p-5" id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="" className="text-white">Track Tickets</a>
      </div>

      <div className="row p-5 justify-content-center">
        <div className="col-md-5 text-center text-md-start">
          <h1 className="fs-4 mb-3">
            Search for an answer or browse help topics to create a ticket
          </h1>

          <input 
            className="form-control mb-3"
            placeholder="Eg. how do I activate F&O"
          />

          <div className="d-flex flex-wrap gap-3">
            <a href="">Track account opening</a>
            <a href="">Track segment activation</a>
            <a href="">Intraday margins</a>
            <a href="">Kite user manual</a>
          </div>
        </div>

        <div className="col-md-4 mt-4 mt-md-0">
          <h1 className="fs-4">Featured</h1>
          <ol>
            <li>
              <a href="">Current Takeovers and Delisting - January 2024</a>
            </li>
            <li>
              <a href="">Latest Intraday leverages - MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
