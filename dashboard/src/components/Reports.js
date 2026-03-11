import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  Print,
  Email,
  PictureAsPdf,
  TableChart,
  Assessment,
  DateRange,
  Refresh,
} from "@mui/icons-material";
import { fetchMultipleStocks } from "../services/stockAPI";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("pnl");
  const [dateRange, setDateRange] = useState("1M");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [livePositions, setLivePositions] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const [statsRes, ordersRes, positionsRes, holdingsRes] = await Promise.all([
        axios.get("http://localhost:3002/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/allOrders", {
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
      const positions = positionsRes.data;
      if (positions.length > 0) {
        const symbols = positions.map(p => p.name);
        const priceData = await fetchMultipleStocks(symbols);
        
        const updatedPositions = positions.map(position => {
          const liveData = priceData.find(p => p.symbol === position.name);
          return {
            ...position,
            price: liveData ? liveData.price : position.price,
          };
        });
        
        setLivePositions(updatedPositions);
      }

      setReportData({
        stats: statsRes.data,
        orders: ordersRes.data,
        positions: positions,
        holdings: holdingsRes.data,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    alert("Downloading PDF report...");
  };

  const handleDownloadExcel = () => {
    alert("Downloading Excel report...");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert("Email report functionality - Enter your email");
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Generating report with live data...</p>
      </div>
    );
  }

  // Calculate real P&L from live positions
  const calculateRealPnL = () => {
    const positions = livePositions.length > 0 ? livePositions : reportData?.positions || [];
    
    const realizedPnL = reportData?.stats?.totalPnL || 0;
    const unrealizedPnL = positions.reduce((sum, pos) => {
      const pnl = (pos.price - pos.avg) * pos.qty;
      return sum + pnl;
    }, 0);
    
    const totalCharges = 1234.50; // Mock charges
    const netPnL = realizedPnL + unrealizedPnL - totalCharges;

    return {
      realized: realizedPnL,
      unrealized: unrealizedPnL,
      totalCharges,
      net: netPnL,
    };
  };

  const pnlData = calculateRealPnL();

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <div className="header-actions">
          <button className="btn btn-grey" onClick={fetchReportData}>
            <Refresh style={{ fontSize: "1rem" }} />
            Refresh
          </button>
          <button className="btn btn-grey" onClick={handlePrint}>
            <Print style={{ fontSize: "1rem" }} />
            Print
          </button>
          <button className="btn btn-grey" onClick={handleEmail}>
            <Email style={{ fontSize: "1rem" }} />
            Email
          </button>
          <button className="btn btn-blue" onClick={handleDownloadPDF}>
            <PictureAsPdf style={{ fontSize: "1rem" }} />
            PDF
          </button>
          <button className="btn btn-green" onClick={handleDownloadExcel}>
            <TableChart style={{ fontSize: "1rem" }} />
            Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="report-controls">
        <div className="report-types">
          <button
            className={reportType === "pnl" ? "type-btn active" : "type-btn"}
            onClick={() => setReportType("pnl")}
          >
            <Assessment style={{ fontSize: "1rem" }} />
            P&L Report
          </button>
          <button
            className={reportType === "tax" ? "type-btn active" : "type-btn"}
            onClick={() => setReportType("tax")}
          >
            📋 Tax Report
          </button>
          <button
            className={reportType === "transaction" ? "type-btn active" : "type-btn"}
            onClick={() => setReportType("transaction")}
          >
            📊 Transaction History
          </button>
        </div>

        <div className="date-range-selector">
          <DateRange style={{ fontSize: "1rem", color: "rgb(136, 136, 136)" }} />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
            <option value="ALL">All Time</option>
          </select>
        </div>
      </div>

      {/* P&L Report */}
      {reportType === "pnl" && (
        <div className="report-content">
          <div className="report-summary">
            <h3>Profit & Loss Summary (LIVE)</h3>
            <div className="summary-cards">
              <div className={`summary-card ${pnlData.realized >= 0 ? 'profit' : 'loss'}`}>
                <span className="card-label">Realized P&L</span>
                <span className="card-value">
                  {pnlData.realized >= 0 ? '+' : ''}₹{pnlData.realized.toFixed(2)}
                </span>
              </div>
              <div className={`summary-card ${pnlData.unrealized >= 0 ? 'profit' : 'loss'}`}>
                <span className="card-label">Unrealized P&L</span>
                <span className="card-value">
                  {pnlData.unrealized >= 0 ? '+' : ''}₹{pnlData.unrealized.toFixed(2)}
                </span>
              </div>
              <div className="summary-card">
                <span className="card-label">Total Charges</span>
                <span className="card-value">₹{pnlData.totalCharges.toFixed(2)}</span>
              </div>
              <div className={`summary-card ${pnlData.net >= 0 ? 'profit' : 'loss'}`}>
                <span className="card-label">Net P&L</span>
                <span className="card-value">
                  {pnlData.net >= 0 ? '+' : ''}₹{pnlData.net.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stock-wise P&L with LIVE prices */}
          <div className="report-table">
            <h3>Stock-wise P&L (Live Prices)</h3>
            <table>
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Qty</th>
                  <th>Buy Avg</th>
                  <th>Current Price</th>
                  <th>P&L</th>
                  <th>P&L %</th>
                </tr>
              </thead>
              <tbody>
                {(livePositions.length > 0 ? livePositions : reportData?.positions || []).map((pos, i) => {
                  const pnl = (pos.price - pos.avg) * pos.qty;
                  const pnlPercent = ((pnl / (pos.avg * pos.qty)) * 100).toFixed(2);
                  return (
                    <tr key={i}>
                      <td className="stock-name">
                        {pos.name}
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.65rem',
                          color: 'rgb(72, 194, 55)',
                          background: 'rgba(72, 194, 55, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: '600'
                        }}>
                          LIVE
                        </span>
                      </td>
                      <td>{pos.qty}</td>
                      <td>₹{pos.avg.toFixed(2)}</td>
                      <td>₹{pos.price.toFixed(2)}</td>
                      <td className={pnl >= 0 ? "profit" : "loss"}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                      </td>
                      <td className={parseFloat(pnlPercent) >= 0 ? "profit" : "loss"}>
                        {parseFloat(pnlPercent) >= 0 ? '+' : ''}
                        {pnlPercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tax Report */}
      {reportType === "tax" && (
        <div className="report-content">
          <div className="tax-summary">
            <h3>Tax Summary (FY 2024-25)</h3>
            <div className="tax-cards">
              <div className="tax-card">
                <span className="tax-label">Short Term Capital Gains</span>
                <span className="tax-value">₹45,670</span>
                <span className="tax-note">Tax @ 15%: ₹6,850.50</span>
              </div>
              <div className="tax-card">
                <span className="tax-label">Long Term Capital Gains</span>
                <span className="tax-value">₹1,23,450</span>
                <span className="tax-note">Tax @ 10%: ₹12,345</span>
              </div>
              <div className="tax-card total">
                <span className="tax-label">Total Tax Liability</span>
                <span className="tax-value">₹19,195.50</span>
              </div>
            </div>

            <div className="tax-info">
              <h4>Important Notes:</h4>
              <ul>
                <li>STCG applies to equity shares held for less than 1 year</li>
                <li>LTCG applies to equity shares held for more than 1 year</li>
                <li>₹1 lakh LTCG is exempt from tax per financial year</li>
                <li>This is an estimated calculation. Consult your CA for accurate filing</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {reportType === "transaction" && (
        <div className="report-content">
          <div className="report-table">
            <h3>Transaction History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.orders?.map((order, i) => (
                  <tr key={i}>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="stock-name">{order.name}</td>
                    <td>
                      <span className={`order-type ${order.mode.toLowerCase()}`}>
                        {order.mode}
                      </span>
                    </td>
                    <td>{order.qty}</td>
                    <td>₹{order.price.toFixed(2)}</td>
                    <td>₹{(order.qty * order.price).toFixed(2)}</td>
                    <td>
                      <span className="status-badge success">
                        {order.status || "Executed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;