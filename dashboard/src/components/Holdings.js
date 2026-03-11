import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import LiveIndicator from "./LiveIndicator";
import { fetchMultipleStocks } from "../services/stockAPI";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Update prices every 30 seconds
  useEffect(() => {
    if (!isLive || allHoldings.length === 0) return;

    const interval = setInterval(() => {
      updateLivePrices();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLive, allHoldings]);

  const fetchHoldings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const res = await axios.get("http://localhost:3002/allHoldings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const holdings = res.data;
      if (holdings.length > 0) {
        // Fetch real-time prices for all holdings
        const symbols = holdings.map(h => h.name);
        const priceData = await fetchMultipleStocks(symbols);
        
        const updatedHoldings = holdings.map(holding => {
          const liveData = priceData.find(p => p.symbol === holding.name);
          return {
            ...holding,
            price: liveData ? liveData.price : holding.price,
            liveUpdate: true
          };
        });
        
        setAllHoldings(updatedHoldings);
      } else {
        setAllHoldings(holdings);
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
      console.error("Error fetching holdings:", err);
      setLoading(false);
    }
  };

  const updateLivePrices = async () => {
    if (allHoldings.length === 0) return;

    try {
      const symbols = allHoldings.map(h => h.name);
      const priceData = await fetchMultipleStocks(symbols);
      
      setAllHoldings(prevHoldings => {
        return prevHoldings.map(holding => {
          const liveData = priceData.find(p => p.symbol === holding.name);
          if (liveData) {
            return {
              ...holding,
              price: liveData.price,
              liveUpdate: true
            };
          }
          return holding;
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

  // Calculate totals
  const totalInvestment = allHoldings.reduce((sum, stock) => 
    sum + (stock.avg * stock.qty), 0
  );

  const totalCurrentValue = allHoldings.reduce((sum, stock) => 
    sum + (stock.price * stock.qty), 0
  );

  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 
    ? ((totalPnL / totalInvestment) * 100).toFixed(2)
    : 0;

  const labels = allHoldings.map((stock) => stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p>Loading holdings with live prices...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header with Live Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 className="title">Holdings ({allHoldings.length})</h3>
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

      {/* Portfolio Summary */}
      {allHoldings.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '2px',
          border: '1px solid rgb(235, 234, 234)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Total Investment
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
              ₹{totalInvestment.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Current Value (LIVE)
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
              ₹{totalCurrentValue.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Total P&L
            </div>
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: '500',
              color: totalPnL >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)'
            }}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)} ({totalPnLPercent}%)
            </div>
          </div>
        </div>
      )}

      {allHoldings.length === 0 ? (
        <p style={{textAlign: 'center', color: 'rgb(153, 153, 153)', marginTop: '50px', fontSize: '0.9rem'}}>
          No holdings yet. Buy some stocks to get started!
        </p>
      ) : (
        <>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Avg. cost</th>
                  <th>LTP (Live)</th>
                  <th>Cur. val</th>
                  <th>P&amp;L</th>
                  <th>Net chg.</th>
                  <th>Day chg.</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, index) => {
                  const curValue = stock.price * stock.qty;
                  const pnl = curValue - stock.avg * stock.qty;
                  const profClass = pnl >= 0 ? "profit" : "loss";
                  const netChange = ((stock.price - stock.avg) / stock.avg) * 100;

                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>
                        {stock.name}
                        {stock.liveUpdate && (
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
                      <td>{stock.qty}</td>
                      <td>₹{stock.avg.toFixed(2)}</td>
                      <td className="value-updating" style={{ fontWeight: '600' }}>
                        ₹{stock.price.toFixed(2)}
                      </td>
                      <td className="value-updating">₹{curValue.toFixed(2)}</td>
                      <td className={`${profClass} value-updating`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                      </td>
                      <td className={profClass}>{netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}%</td>
                      <td className={profClass}>{netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <VerticalGraph data={data} />
        </>
      )}
    </>
  );
};

export default Holdings;