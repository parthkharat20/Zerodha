import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Notifications,
  Close,
  ShowChart,
  AccountBalanceWallet,
  Add,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import axios from "axios";
import "./TopBar.css";

const TopBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [funds, setFunds] = useState(null);
  const [stats, setStats] = useState(null);
  const [indices, setIndices] = useState([
    { name: "NIFTY 50", value: 22156.80, change: 0.45 },
    { name: "SENSEX", value: 73041.58, change: 0.38 },
    { name: "BANKNIFTY", value: 47850.25, change: -0.52 },
    { name: "FINNIFTY", value: 20567.90, change: 0.65 },
  ]);

  useEffect(() => {
    fetchData();
    // Simulate real-time index updates
    const interval = setInterval(() => {
      setIndices(prev => prev.map(index => ({
        ...index,
        value: index.value + (Math.random() - 0.5) * 50,
        change: (Math.random() - 0.5) * 2,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [fundsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3002/funds", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setFunds(fundsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const totalPnL = stats?.totalPnL || 0;

  return (
    <div className="topbar-container">
      {/* Logo Section */}
      <div className="topbar-logo">
        <Link to="/dashboard">
          <div className="logo-icon">
            <ShowChart style={{ fontSize: "1.8rem", color: "var(--color-blue)" }} />
          </div>
          <div className="logo-text">
            <div className="app-name">TradeX</div>
            <div className="market-status">
              <span style={{ 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                background: "#26a69a",
                display: "inline-block",
                marginRight: "4px",
              }}></span>
              Market Open
            </div>
          </div>
        </Link>
      </div>

      {/* Indices Section */}
      <div className="indices-container">
        {indices.map((index, i) => (
          <div key={i} className="index-item">
            <p className="index-name">{index.name}</p>
            <div className="index-data">
              <p className="index-value">{index.value.toFixed(2)}</p>
              <span className={`index-change ${index.change >= 0 ? 'up' : 'down'}`}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Funds Widget */}
        <Link to="/dashboard/funds" className="funds-widget" style={{ textDecoration: 'none' }}>
          <div className="funds-icon">
            <AccountBalanceWallet style={{ fontSize: "1.2rem" }} />
          </div>
          <div className="funds-info">
            <span className="funds-label">Available</span>
            <span className="funds-value">
              ₹{funds?.availableBalance?.toFixed(2) || "0.00"}
            </span>
          </div>
          <button className="add-funds-btn">
            <Add style={{ fontSize: "1rem" }} />
          </button>
        </Link>

        {/* P&L Widget */}
        <div className="pnl-widget">
          <div className="pnl-info">
            <span className="pnl-label">Total P&L</span>
            <span className={`pnl-value ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
              {totalPnL >= 0 ? (
                <TrendingUp style={{ fontSize: "1rem" }} />
              ) : (
                <TrendingDown style={{ fontSize: "1rem" }} />
              )}
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-container">
          <button 
            className="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Notifications style={{ fontSize: "1.2rem" }} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button onClick={() => setShowNotifications(false)}>×</button>
              </div>
              <div className="notifications-body">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <Notifications style={{ fontSize: "2rem", color: "var(--text-disabled)" }} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={i} className="notification-item">
                      <p>{notif.message}</p>
                      <span>{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;