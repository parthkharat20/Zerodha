import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AccessTime,
  Pause,
  PlayArrow,
} from "@mui/icons-material";
import "./TradeFeed.css";

const TradeFeed = () => {
  const [trades, setTrades] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      generateTrade();
    }, 2000); // New trade every 2 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const generateTrade = () => {
    const stocks = ["RELIANCE", "TCS", "INFY", "HDFC", "ICICI", "SBIN", "ITC"];
    const types = ["BUY", "SELL"];
    
    const newTrade = {
      id: Date.now(),
      stock: stocks[Math.floor(Math.random() * stocks.length)],
      type: types[Math.floor(Math.random() * types.length)],
      price: (Math.random() * 3000 + 500).toFixed(2),
      quantity: Math.floor(Math.random() * 500) + 1,
      time: new Date().toLocaleTimeString("en-IN"),
    };

    setTrades(prev => [newTrade, ...prev].slice(0, 20)); // Keep last 20 trades
  };

  return (
    <div className="trade-feed-container">
      <div className="feed-header">
        <div className="feed-title">
          <AccessTime style={{ fontSize: "1.2rem" }} />
          <h3>Live Trades</h3>
          <span className="feed-count">{trades.length}</span>
        </div>
        <button 
          className="pause-btn"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? (
            <>
              <PlayArrow style={{ fontSize: "1rem" }} />
              Resume
            </>
          ) : (
            <>
              <Pause style={{ fontSize: "1rem" }} />
              Pause
            </>
          )}
        </button>
      </div>

      <div className="feed-list">
        {trades.length === 0 ? (
          <div className="no-trades">
            <AccessTime style={{ fontSize: "2.5rem", color: "rgb(200, 200, 200)" }} />
            <p>Waiting for live trades...</p>
          </div>
        ) : (
          trades.map((trade) => (
            <div key={trade.id} className={`trade-item ${trade.type.toLowerCase()}`}>
              <div className="trade-main">
                <div className="trade-stock">
                  <span className="stock-name">{trade.stock}</span>
                  <span className={`trade-type ${trade.type.toLowerCase()}`}>
                    {trade.type === "BUY" ? (
                      <TrendingUp style={{ fontSize: "0.9rem" }} />
                    ) : (
                      <TrendingDown style={{ fontSize: "0.9rem" }} />
                    )}
                    {trade.type}
                  </span>
                </div>
                <div className="trade-details">
                  <span className="trade-qty">{trade.quantity} qty</span>
                  <span className="trade-price">@ ₹{trade.price}</span>
                </div>
              </div>
              <div className="trade-time">
                <AccessTime style={{ fontSize: "0.7rem" }} />
                {trade.time}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeFeed;