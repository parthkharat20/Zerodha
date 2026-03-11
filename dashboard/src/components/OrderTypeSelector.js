import React from "react";
import { Info } from "@mui/icons-material";
import "./OrderTypeSelector.css";

const OrderTypeSelector = ({ 
  orderType, 
  setOrderType, 
  triggerPrice, 
  setTriggerPrice,
  targetPrice,
  setTargetPrice,
  stopLoss,
  setStopLoss,
}) => {
  const orderTypes = [
    { 
      value: 'MARKET', 
      label: 'Market', 
      description: 'Buy/Sell at current market price',
      icon: '⚡'
    },
    { 
      value: 'LIMIT', 
      label: 'Limit', 
      description: 'Buy/Sell at specific price or better',
      icon: '🎯'
    },
    { 
      value: 'STOP_LOSS', 
      label: 'Stop Loss', 
      description: 'Trigger order when price hits stop loss',
      icon: '🛡️'
    },
    { 
      value: 'STOP_LOSS_MARKET', 
      label: 'SL-M', 
      description: 'Stop Loss at Market price',
      icon: '⚠️'
    },
  ];

  return (
    <div className="order-type-selector">
      <div className="order-type-tabs">
        {orderTypes.map((type) => (
          <button
            key={type.value}
            className={orderType === type.value ? "type-tab active" : "type-tab"}
            onClick={() => setOrderType(type.value)}
          >
            <span className="type-icon">{type.icon}</span>
            <div className="type-content">
              <span className="type-label">{type.label}</span>
              <span className="type-desc">{type.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Options */}
      {orderType !== 'MARKET' && (
        <div className="advanced-options">
          {orderType === 'LIMIT' && (
            <div className="option-group">
              <label>
                <Info style={{ fontSize: '0.9rem' }} />
                Limit Price (₹)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter limit price"
                step="0.05"
              />
              <span className="helper-text">
                Order will execute only at this price or better
              </span>
            </div>
          )}

          {orderType === 'STOP_LOSS' && (
            <>
              <div className="option-group">
                <label>
                  <Info style={{ fontSize: '0.9rem' }} />
                  Trigger Price (₹)
                </label>
                <input
                  type="number"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder="Enter trigger price"
                  step="0.05"
                />
                <span className="helper-text">
                  Order triggers when market hits this price
                </span>
              </div>
              <div className="option-group">
                <label>Limit Price (₹)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter limit price"
                  step="0.05"
                />
              </div>
            </>
          )}

          {orderType === 'STOP_LOSS_MARKET' && (
            <div className="option-group">
              <label>
                <Info style={{ fontSize: '0.9rem' }} />
                Trigger Price (₹)
              </label>
              <input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                placeholder="Enter trigger price"
                step="0.05"
              />
              <span className="helper-text">
                Will execute at market price when triggered
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      <div className="order-tips">
        <h5>💡 Quick Tips:</h5>
        <ul>
          <li><strong>Market:</strong> Fastest execution, price may vary</li>
          <li><strong>Limit:</strong> Control your price, may not execute</li>
          <li><strong>Stop Loss:</strong> Protect against losses automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderTypeSelector;