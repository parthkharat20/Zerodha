import React, { useState, useEffect } from "react";
import axios from "axios";
import { Refresh, TrendingUp, TrendingDown, AccountBalanceWallet } from "@mui/icons-material";
import { fetchMultipleStocks } from "../services/stockAPI";
import "./Summary.css";

const Summary = () => {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState(null);
  const [funds, setFunds] = useState(null);
  const [positions, setPositions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (!silent) setLoading(true);

    try {
      const [statsRes, fundsRes, positionsRes, holdingsRes] = await Promise.all([
        axios.get("http://localhost:3002/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/funds", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/allPositions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/allHoldings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Fetch live prices for positions
      const posData = positionsRes.data;
      if (posData.length > 0) {
        const symbols = posData.map(p => p.name);
        const priceData = await fetchMultipleStocks(symbols);
        
        const updatedPositions = posData.map(position => {
          const liveData = priceData.find(p => p.symbol === position.name);
          return {
            ...position,
            price: liveData ? liveData.price : position.price,
          };
        });
        
        setPositions(updatedPositions);
      } else {
        setPositions(posData);
      }

      // Fetch live prices for holdings
      const holdingsData = holdingsRes.data;
      if (holdingsData.length > 0) {
        const symbols = holdingsData.map(h => h.name);
        const priceData = await fetchMultipleStocks(symbols);
        
        const updatedHoldings = holdingsData.map(holding => {
          const liveData = priceData.find(p => p.symbol === holding.name);
          return {
            ...holding,
            price: liveData ? liveData.price : holding.price,
          };
        });
        
        setHoldings(updatedHoldings);
      } else {
        setHoldings(holdingsData);
      }

      setStats(statsRes.data);
      setFunds(fundsRes.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard with live data...</p>
      </div>
    );
  }

  // Calculate live P&L from positions
  const todayPnL = positions.reduce((sum, pos) => {
    const pnl = (pos.price - pos.avg) * pos.qty;
    return sum + pnl;
  }, 0);

  // Calculate total from holdings with live prices
  const totalInvestment = holdings.reduce((sum, h) => sum + (h.avg * h.qty), 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.price * h.qty), 0);
  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 ? ((totalPnL / totalInvestment) * 100).toFixed(2) : 0;

  const availableBalance = funds?.availableBalance || 0;
  const usedMargin = funds?.usedMargin || 0;

  return (
    <div className="summary-page">
      {/* Welcome Header */}
      <div className="summary-header">
        <div className="username">
          <h6>Hi, {userName}!</h6>
          <p className="welcome-text">Here's your portfolio overview</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">
            <span>Last updated: {lastUpdated.toLocaleTimeString('en-IN')}</span>
          </div>
          <button 
            onClick={() => fetchDashboardData()}
            className="btn btn-blue"
          >
            <Refresh style={{ fontSize: '1rem' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        {/* Available Balance */}
        <div className="stat-card balance-card">
          <div className="stat-header">
            <AccountBalanceWallet style={{ fontSize: '1.5rem' }} />
            <span className="stat-label">Available Balance</span>
          </div>
          <div className="stat-value-large">₹{availableBalance.toFixed(2)}</div>
          <div className="stat-footer">
            <span className="stat-detail">Used Margin: ₹{usedMargin.toFixed(2)}</span>
          </div>
        </div>

        {/* Today's P&L */}
        <div className={`stat-card ${todayPnL >= 0 ? 'profit-card' : 'loss-card'}`}>
          <div className="stat-header">
            {todayPnL >= 0 ? (
              <TrendingUp style={{ fontSize: '1.5rem' }} />
            ) : (
              <TrendingDown style={{ fontSize: '1.5rem' }} />
            )}
            <span className="stat-label">Today's P&L (LIVE)</span>
          </div>
          <div className={`stat-value-large ${todayPnL >= 0 ? 'profit' : 'loss'}`}>
            {todayPnL >= 0 ? '+' : ''}₹{todayPnL.toFixed(2)}
          </div>
          <div className="stat-footer">
            <span className="stat-detail">Open Positions: {positions.length}</span>
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="stat-card portfolio-card">
          <div className="stat-header">
            <TrendingUp style={{ fontSize: '1.5rem' }} />
            <span className="stat-label">Portfolio Value</span>
          </div>
          <div className="stat-value-large">₹{totalCurrentValue.toFixed(2)}</div>
          <div className="stat-footer">
            <span className="stat-detail">Investment: ₹{totalInvestment.toFixed(2)}</span>
          </div>
        </div>

        {/* Total P&L */}
        <div className={`stat-card ${totalPnL >= 0 ? 'profit-card' : 'loss-card'}`}>
          <div className="stat-header">
            {totalPnL >= 0 ? (
              <TrendingUp style={{ fontSize: '1.5rem' }} />
            ) : (
              <TrendingDown style={{ fontSize: '1.5rem' }} />
            )}
            <span className="stat-label">Total P&L</span>
          </div>
          <div className={`stat-value-large ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
          </div>
          <div className="stat-footer">
            <span className={`stat-detail ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent}%
            </span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Equity Section */}
      <div className="section">
        <div className="section-header">
          <h3>Equity</h3>
        </div>
        <div className="data-grid">
          <div className="data-card">
            <div className="data-label">Margin Available</div>
            <div className="data-value">{availableBalance.toFixed(2)}k</div>
          </div>
          <div className="data-card">
            <div className="data-label">Margin Used</div>
            <div className="data-value">{usedMargin.toFixed(2)}</div>
          </div>
          <div className="data-card">
            <div className="data-label">Opening Balance</div>
            <div className="data-value">{availableBalance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Holdings Section */}
      <div className="section">
        <div className="section-header">
          <h3>Holdings ({holdings.length})</h3>
        </div>
        <div className="data-grid">
          <div className="data-card">
            <div className="data-label">Total P&L</div>
            <div className={`data-value ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="data-card">
            <div className="data-label">Current Value</div>
            <div className="data-value">₹{totalCurrentValue.toFixed(2)}</div>
          </div>
          <div className="data-card">
            <div className="data-label">Investment</div>
            <div className="data-value">₹{totalInvestment.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;