import React from "react";

import Menu from "./Menu";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{23847.90} </p>
          <p className="percent"> </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{78549.45}</p>
          <p className="percent"></p>
        </div>
        <div className="banknifty">
          <p className="index">BANKNIFTY</p>
          <p className="index-points">{51234.80} </p>
          <p className="percent"> </p>
        </div>
        <div className="finnifty">
          <p className="index">FINNIFTY</p>
          <p className="index-points">{100.2} </p>
          <p className="percent"> </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;