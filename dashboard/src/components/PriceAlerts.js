import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  NotificationsActive,
  Add,
  Delete,
  TrendingUp,
  TrendingDown,
  Close,
  Save,
} from "@mui/icons-material";
import { fetchStockPrice } from "../services/stockAPI";
import "./PriceAlerts.css";

const PriceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    stock: "",
    targetPrice: "",
    condition: "ABOVE", // ABOVE or BELOW
    currentPrice: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
    checkAlerts();

    // Check alerts every 30 seconds
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const userId = localStorage.getItem("userName");
    const saved = localStorage.getItem(`priceAlerts_${userId}`);
    if (saved) {
      setAlerts(JSON.parse(saved));
    }
  };

  const saveAlerts = (updatedAlerts) => {
    const userId = localStorage.getItem("userName");
    localStorage.setItem(`priceAlerts_${userId}`, JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const checkAlerts = async () => {
    if (alerts.length === 0) return;

    for (const alert of alerts) {
      try {
        const priceData = await fetchStockPrice(alert.stock);
        const currentPrice = priceData.price;

        let triggered = false;
        if (alert.condition === "ABOVE" && currentPrice >= alert.targetPrice) {
          triggered = true;
        } else if (alert.condition === "BELOW" && currentPrice <= alert.targetPrice) {
          triggered = true;
        }

        if (triggered) {
          // Show notification
          if (Notification.permission === "granted") {
            new Notification(`Price Alert: ${alert.stock}`, {
              body: `${alert.stock} is now ${alert.condition} ₹${alert.targetPrice}. Current: ₹${currentPrice.toFixed(2)}`,
              icon: "/logo.png",
            });
          }

          // Remove triggered alert
          const updated = alerts.filter(a => a.id !== alert.id);
          saveAlerts(updated);
        }
      } catch (err) {
        console.error("Error checking alert:", err);
      }
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.stock || !newAlert.targetPrice) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);

    try {
      // Fetch current price
      const priceData = await fetchStockPrice(newAlert.stock.toUpperCase());

      const alert = {
        id: Date.now(),
        stock: newAlert.stock.toUpperCase(),
        targetPrice: parseFloat(newAlert.targetPrice),
        condition: newAlert.condition,
        currentPrice: priceData.price,
        createdAt: new Date().toISOString(),
      };

      const updated = [...alerts, alert];
      saveAlerts(updated);

      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

      setNewAlert({
        stock: "",
        targetPrice: "",
        condition: "ABOVE",
        currentPrice: 0,
      });
      setShowAddModal(false);
    } catch (err) {
      alert("Error fetching stock price. Please check stock symbol.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = (id) => {
    if (window.confirm("Delete this alert?")) {
      const updated = alerts.filter(a => a.id !== id);
      saveAlerts(updated);
    }
  };

  return (
    <div className="price-alerts-page">
      <div className="alerts-header">
        <h2>
          <NotificationsActive style={{ fontSize: "1.5rem" }} />
          Price Alerts
        </h2>
        <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>
          <Add style={{ fontSize: "1rem" }} />
          New Alert
        </button>
      </div>

      {/* Alert Summary */}
      <div className="alerts-summary">
        <div className="summary-item">
          <span className="summary-label">Active Alerts</span>
          <span className="summary-value">{alerts.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Upside Alerts</span>
          <span className="summary-value success">
            {alerts.filter(a => a.condition === "ABOVE").length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Downside Alerts</span>
          <span className="summary-value danger">
            {alerts.filter(a => a.condition === "BELOW").length}
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <NotificationsActive style={{ fontSize: "3rem", color: "rgb(200, 200, 200)" }} />
            <p>No price alerts set</p>
            <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>
              Create Your First Alert
            </button>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="alert-card">
              <div className="alert-header">
                <div className="alert-stock">
                  <h3>{alert.stock}</h3>
                  <span className={`condition-badge ${alert.condition.toLowerCase()}`}>
                    {alert.condition === "ABOVE" ? (
                      <TrendingUp style={{ fontSize: "0.9rem" }} />
                    ) : (
                      <TrendingDown style={{ fontSize: "0.9rem" }} />
                    )}
                    {alert.condition}
                  </span>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Delete style={{ fontSize: "1rem" }} />
                </button>
              </div>

              <div className="alert-body">
                <div className="alert-info">
                  <div className="info-item">
                    <span className="info-label">Target Price</span>
                    <span className="info-value">₹{alert.targetPrice.toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">When Created</span>
                    <span className="info-value">₹{alert.currentPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="alert-date">
                  Created: {new Date(alert.createdAt).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Price Alert</h3>
              <button onClick={() => setShowAddModal(false)}>
                <Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Stock Symbol</label>
                <input
                  type="text"
                  value={newAlert.stock}
                  onChange={(e) => setNewAlert({ ...newAlert, stock: e.target.value.toUpperCase() })}
                  placeholder="e.g., RELIANCE, TCS"
                />
              </div>

              <div className="form-group">
                <label>Condition</label>
                <div className="condition-buttons">
                  <button
                    className={newAlert.condition === "ABOVE" ? "active above" : "above"}
                    onClick={() => setNewAlert({ ...newAlert, condition: "ABOVE" })}
                  >
                    <TrendingUp />
                    Goes Above
                  </button>
                  <button
                    className={newAlert.condition === "BELOW" ? "active below" : "below"}
                    onClick={() => setNewAlert({ ...newAlert, condition: "BELOW" })}
                  >
                    <TrendingDown />
                    Goes Below
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Target Price (₹)</label>
                <input
                  type="number"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                  placeholder="Enter price"
                  step="0.05"
                />
              </div>

              <div className="alert-preview">
                <p>
                  Alert me when <strong>{newAlert.stock || "STOCK"}</strong> goes{" "}
                  <strong>{newAlert.condition === "ABOVE" ? "above" : "below"}</strong> ₹
                  {newAlert.targetPrice || "0.00"}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-blue" 
                onClick={handleAddAlert}
                disabled={loading}
              >
                {loading ? "Creating..." : (
                  <>
                    <Save style={{ fontSize: "1rem" }} />
                    Create Alert
                  </>
                )}
              </button>
              <button className="btn btn-grey" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;