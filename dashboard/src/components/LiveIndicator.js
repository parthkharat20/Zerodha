import React from "react";
import "./LiveIndicator.css";

const LiveIndicator = ({ isActive, lastUpdated }) => {
  const getTimeAgo = () => {
    if (!lastUpdated) return "Never";
    
    const seconds = Math.floor((new Date() - new Date(lastUpdated)) / 1000);
    
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="live-indicator-container">
      <div className={`live-dot ${isActive ? 'active' : 'paused'}`}></div>
      <div className="live-text">
        <span className="live-status">{isActive ? 'LIVE' : 'PAUSED'}</span>
        <span className="live-time">{getTimeAgo()}</span>
      </div>
    </div>
  );
};

export default LiveIndicator;