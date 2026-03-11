import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import OrderTypeSelector from "./OrderTypeSelector";
import { fetchStockPrice } from "../services/stockAPI";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0);
  const [livePrice, setLivePrice] = useState(0);
  const [orderType, setOrderType] = useState('MARKET');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    fetchAvailableBalance();
    fetchLivePrice();
  }, [uid]);

  // Auto-update price every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLivePrice();
    }, 30000);

    return () => clearInterval(interval);
  }, [uid]);

  const fetchAvailableBalance = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3002/funds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableBalance(response.data.availableBalance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const fetchLivePrice = async () => {
    try {
      setPriceLoading(true);
      const priceData = await fetchStockPrice(uid);
      setLivePrice(priceData.price);
      setStockPrice(priceData.price);
      setLoading(false);
      setPriceLoading(false);
    } catch (err) {
      console.error("Error fetching live price:", err);
      setStockPrice(100); // Fallback
      setLivePrice(100);
      setLoading(false);
      setPriceLoading(false);
    }
  };

  const handleBuyClick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first!");
      window.location.href = "/";
      return;
    }

    if (!stockQuantity || stockQuantity <= 0) {
      alert("Please enter valid quantity");
      return;
    }

    if (!stockPrice || stockPrice <= 0) {
      alert("Please enter valid price");
      return;
    }

    const orderValue = Number(stockQuantity) * Number(stockPrice);

    if (orderValue > availableBalance) {
      alert(`Insufficient funds! Need ₹${orderValue.toFixed(2)}, Available: ₹${availableBalance.toFixed(2)}`);
      return;
    }

    const orderData = {
      name: uid,
      qty: stockQuantity,
      price: stockPrice,
      mode: "BUY",
      orderType: orderType
    };

    if (orderType === 'LIMIT' && targetPrice) {
      orderData.targetPrice = Number(targetPrice);
    }

    if (orderType === 'STOP_LOSS' && triggerPrice) {
      orderData.triggerPrice = Number(triggerPrice);
    }

    try {
      const response = await axios.post("http://localhost:3002/newOrder", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert(response.data.message);
      generalContext.closeBuyWindow();
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error("Error:", msg);
      alert(msg);
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  const orderValue = (Number(stockQuantity) * Number(stockPrice)).toFixed(2);

  if (loading) {
    return (
      <div className="container" id="buy-window" draggable="true">
        <div className="regular-order" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 15px' }}></div>
          <p>Fetching live price for {uid}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="order-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4>{uid}</h4>
            <span style={{
              fontSize: '0.7rem',
              color: 'rgb(72, 194, 55)',
              background: 'rgba(72, 194, 55, 0.1)',
              padding: '3px 8px',
              borderRadius: '3px',
              fontWeight: '600'
            }}>
              LIVE
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="balance-info">Available: ₹{availableBalance.toFixed(2)}</p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginTop: '4px'
            }}>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '700',
                color: 'rgb(65, 132, 243)'
              }}>
                ₹{livePrice.toFixed(2)}
              </span>
              <button 
                onClick={fetchLivePrice}
                disabled={priceLoading}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  border: '1px solid rgb(224, 224, 224)',
                  borderRadius: '2px',
                  background: 'white',
                  cursor: priceLoading ? 'not-allowed' : 'pointer',
                  opacity: priceLoading ? 0.6 : 1
                }}
              >
                {priceLoading ? '...' : '🔄'}
              </button>
            </div>
          </div>
        </div>

        <OrderTypeSelector
          orderType={orderType}
          setOrderType={setOrderType}
          triggerPrice={triggerPrice}
          setTriggerPrice={setTriggerPrice}
          targetPrice={targetPrice}
          setTargetPrice={setTargetPrice}
        />

        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              min="1"
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              min="0.05"
            />
          </fieldset>
        </div>

        <div style={{
          background: 'rgba(65, 132, 243, 0.05)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: 'rgb(71, 71, 71)',
          marginTop: '10px'
        }}>
          💡 Price updates every 30 seconds automatically
        </div>
      </div>
      <div className="buttons">
        <span className={orderValue > availableBalance ? 'insufficient' : ''}>
          Total: ₹{orderValue}
          {orderValue > availableBalance && <span className="error-text"> (Insufficient funds)</span>}
        </span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;