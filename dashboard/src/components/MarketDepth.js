import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Refresh } from "@mui/icons-material";
import "./MarketDepth.css";

const MarketDepth = ({ stockSymbol = "RELIANCE" }) => {
  const [depth, setDepth] = useState({
    bids: [],
    asks: [],
    lastPrice: 0,
  });

  useEffect(() => {
    generateMockDepth();

    // Update every 5 seconds
    const interval = setInterval(generateMockDepth, 5000);
    return () => clearInterval(interval);
  }, [stockSymbol]);

  const generateMockDepth = () => {
    const basePrice = 2450;
    const bids = [];
    const asks = [];

    // Generate 5 bid levels
    for (let i = 0; i < 5; i++) {
      bids.push({
        price: (basePrice - (i + 1) * 0.5).toFixed(2),
        quantity: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 10) + 1,
      });
    }

    // Generate 5 ask levels
    for (let i = 0; i < 5; i++) {
      asks.push({
        price: (basePrice + (i + 1) * 0.5).toFixed(2),
        quantity: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 10) + 1,
      });
    }

    setDepth({
      bids,
      asks,
      lastPrice: basePrice,
    });
  };

  const maxQuantity = Math.max(
    ...depth.bids.map(b => b.quantity),
    ...depth.asks.map(a => a.quantity)
  );

  return (
    <div className="market-depth-container">
      <div className="depth-header">
        <h3>Market Depth - {stockSymbol}</h3>
        <button className="refresh-btn" onClick={generateMockDepth}>
          <Refresh style={{ fontSize: "1rem" }} />
        </button>
      </div>

      <div className="depth-content">
        {/* Bids (Buy Orders) */}
        <div className="bids-section">
          <div className="section-header buy">
            <TrendingUp style={{ fontSize: "1rem" }} />
            <span>Bids (Buy)</span>
          </div>
          <div className="depth-table">
            <div className="depth-row header">
              <span>Orders</span>
              <span>Qty</span>
              <span>Price</span>
            </div>
            {depth.bids.map((bid, i) => (
              <div key={i} className="depth-row bid">
                <div 
                  className="depth-bar bid-bar"
                  style={{ width: `${(bid.quantity / maxQuantity) * 100}%` }}
                ></div>
                <span className="orders">{bid.orders}</span>
                <span className="quantity">{bid.quantity}</span>
                <span className="price">₹{bid.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price */}
        <div className="current-price-section">
          <div className="current-price">
            <span className="label">LTP</span>
            <span className="value">₹{depth.lastPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="asks-section">
          <div className="section-header sell">
            <TrendingDown style={{ fontSize: "1rem" }} />
            <span>Asks (Sell)</span>
          </div>
          <div className="depth-table">
            <div className="depth-row header">
              <span>Price</span>
              <span>Qty</span>
              <span>Orders</span>
            </div>
            {depth.asks.map((ask, i) => (
              <div key={i} className="depth-row ask">
                <div 
                  className="depth-bar ask-bar"
                  style={{ width: `${(ask.quantity / maxQuantity) * 100}%` }}
                ></div>
                <span className="price">₹{ask.price}</span>
                <span className="quantity">{ask.quantity}</span>
                <span className="orders">{ask.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDepth;