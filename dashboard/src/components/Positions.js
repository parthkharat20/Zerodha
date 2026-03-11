import React, { useState, useEffect } from "react";
import axios from "axios";
import LiveIndicator from "./LiveIndicator";
import { fetchMultipleStocks } from "../services/stockAPI";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, []);

  // Update prices every 30 seconds
  useEffect(() => {
    if (!isLive || allPositions.length === 0) return;

    const interval = setInterval(() => {
      updateLivePrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive, allPositions]);

  const fetchPositions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const res = await axios.get("http://localhost:3002/allPositions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const positions = res.data;
      if (positions.length > 0) {
        const symbols = positions.map(p => p.name);
        const priceData = await fetchMultipleStocks(symbols);
        
        const updatedPositions = positions.map(position => {
          const liveData = priceData.find(p => p.symbol === position.name);
          return {
            ...position,
            price: liveData ? liveData.price : position.price,
            liveUpdate: true
          };
        });
        
        setAllPositions(updatedPositions);
      } else {
        setAllPositions(positions);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      console.error("Error fetching positions:", err);
      setLoading(false);
    }
  };

  const updateLivePrices = async () => {
    if (allPositions.length === 0) return;

    try {
      const symbols = allPositions.map(p => p.name);
      const priceData = await fetchMultipleStocks(symbols);
      
      setAllPositions(prevPositions => {
        return prevPositions.map(position => {
          const liveData = priceData.find(p => p.symbol === position.name);
          if (liveData) {
            return {
              ...position,
              price: liveData.price,
              liveUpdate: true
            };
          }
          return position;
        });
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error updating live prices:", err);
    }
  };

  const toggleLive = () => {
    setIsLive(prev => !prev);
  };

  // Calculate today's P&L
  const todayPnL = allPositions.reduce((sum, position) => {
    const pnl = (position.price - position.avg) * position.qty;
    return sum + pnl;
  }, 0);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p>Loading positions with live prices...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 className="title">Positions ({allPositions.length})</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LiveIndicator isActive={isLive} lastUpdated={lastUpdated} />
          <button 
            onClick={toggleLive}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              border: '1px solid rgb(224, 224, 224)',
              borderRadius: '2px',
              background: isLive ? 'white' : 'rgb(248, 249, 250)',
              cursor: 'pointer',
              color: 'rgb(70, 70, 70)',
              fontWeight: '400'
            }}
          >
            {isLive ? 'Pause Live' : 'Resume Live'}
          </button>
          <button 
            onClick={updateLivePrices}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              border: '1px solid rgb(65, 132, 243)',
              borderRadius: '2px',
              background: 'rgb(65, 132, 243)',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '500'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      {allPositions.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          background: todayPnL >= 0 ? 'rgba(72, 194, 55, 0.08)' : 'rgba(250, 118, 78, 0.08)',
          borderRadius: '2px',
          border: `1px solid ${todayPnL >= 0 ? 'rgba(72, 194, 55, 0.2)' : 'rgba(250, 118, 78, 0.2)'}`
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Today's P&L (LIVE)
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: todayPnL >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)'
            }}>
              {todayPnL >= 0 ? '+' : ''}₹{todayPnL.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Open Positions
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
              {allPositions.length}
            </div>
          </div>
        </div>
      )}

      {allPositions.length === 0 ? (
        <p style={{textAlign: 'center', color: 'rgb(153, 153, 153)', marginTop: '50px', fontSize: '0.9rem'}}>
          No open positions. All positions will appear here.
        </p>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Avg. cost</th>
                <th>LTP (Live)</th>
                <th>P&amp;L</th>
                <th>Chg.</th>
              </tr>
            </thead>
            <tbody>
              {allPositions.map((position, index) => {
                const pnl = (position.price - position.avg) * position.qty;
                const pnlPercent = ((pnl / (position.avg * position.qty)) * 100).toFixed(2);
                const profClass = pnl >= 0 ? "profit" : "loss";

                return (
                  <tr key={index}>
                    <td>CNC</td>
                    <td style={{ fontWeight: '500' }}>
                      {position.name}
                      {position.liveUpdate && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '0.65rem',
                          color: 'rgb(72, 194, 55)',
                          background: 'rgba(72, 194, 55, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: '600'
                        }}>
                          LIVE
                        </span>
                      )}
                    </td>
                    <td>{position.qty}</td>
                    <td>₹{position.avg.toFixed(2)}</td>
                    <td className="value-updating" style={{ fontWeight: '600' }}>
                      ₹{position.price.toFixed(2)}
                    </td>
                    <td className={`${profClass} value-updating`}>
                      {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                    </td>
                    <td className={profClass}>
                      {pnlPercent >= 0 ? '+' : ''}{pnlPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Positions;