import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Insights, 
  TrendingUp, 
  TrendingDown, 
  Warning,
  CheckCircle,
  Info,
  Lightbulb,
} from "@mui/icons-material";
import { fetchMultipleStocks } from "../services/stockAPI";
import "./PortfolioInsights.css";

const PortfolioInsights = () => {
  const [holdings, setHoldings] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const holdingsRes = await axios.get("http://localhost:3002/allHoldings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const holdingsData = holdingsRes.data;

      // Fetch live prices
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
        generateInsights(updatedHoldings);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const generateInsights = (holdings) => {
    const generatedInsights = [];

    // Total portfolio value
    const totalInvestment = holdings.reduce((sum, h) => sum + (h.avg * h.qty), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.price * h.qty), 0);
    const totalPnL = totalCurrentValue - totalInvestment;
    const totalPnLPercent = ((totalPnL / totalInvestment) * 100).toFixed(2);

    // Portfolio performance
    if (totalPnL > 0) {
      generatedInsights.push({
        type: "success",
        icon: <CheckCircle />,
        title: "Portfolio Performing Well",
        message: `Your portfolio is up ${totalPnLPercent}% with a profit of ₹${totalPnL.toFixed(2)}. Great job!`,
      });
    } else if (totalPnL < 0) {
      generatedInsights.push({
        type: "warning",
        icon: <Warning />,
        title: "Portfolio Underperforming",
        message: `Your portfolio is down ${Math.abs(totalPnLPercent)}%. Consider reviewing your holdings.`,
      });
    }

    // Top gainers
    const topGainers = holdings
      .map(h => ({
        ...h,
        pnlPercent: (((h.price - h.avg) / h.avg) * 100),
      }))
      .filter(h => h.pnlPercent > 0)
      .sort((a, b) => b.pnlPercent - a.pnlPercent)
      .slice(0, 3);

    if (topGainers.length > 0) {
      generatedInsights.push({
        type: "success",
        icon: <TrendingUp />,
        title: "Top Performers",
        message: `${topGainers.map(h => `${h.name} (+${h.pnlPercent.toFixed(2)}%)`).join(", ")} are your best performers.`,
      });
    }

    // Top losers
    const topLosers = holdings
      .map(h => ({
        ...h,
        pnlPercent: (((h.price - h.avg) / h.avg) * 100),
      }))
      .filter(h => h.pnlPercent < 0)
      .sort((a, b) => a.pnlPercent - b.pnlPercent)
      .slice(0, 3);

    if (topLosers.length > 0) {
      generatedInsights.push({
        type: "error",
        icon: <TrendingDown />,
        title: "Underperformers",
        message: `${topLosers.map(h => `${h.name} (${h.pnlPercent.toFixed(2)}%)`).join(", ")} need attention.`,
      });
    }

    // Concentration risk
    const maxHolding = holdings.reduce((max, h) => {
      const value = h.price * h.qty;
      return value > max.value ? { name: h.name, value } : max;
    }, { value: 0 });

    const concentration = ((maxHolding.value / totalCurrentValue) * 100).toFixed(2);

    if (concentration > 30) {
      generatedInsights.push({
        type: "warning",
        icon: <Warning />,
        title: "High Concentration Risk",
        message: `${maxHolding.name} represents ${concentration}% of your portfolio. Consider diversifying.`,
      });
    } else {
      generatedInsights.push({
        type: "info",
        icon: <Lightbulb />,
        title: "Well Diversified",
        message: `Your largest holding (${maxHolding.name}) is ${concentration}% of portfolio. Good diversification!`,
      });
    }

    // Number of holdings
    if (holdings.length < 5) {
      generatedInsights.push({
        type: "info",
        icon: <Info />,
        title: "Limited Holdings",
        message: `You have ${holdings.length} holdings. Consider diversifying across more stocks for better risk management.`,
      });
    }

    setInsights(generatedInsights);
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-insights-page">
      <div className="insights-header">
        <h2>
          <Insights style={{ fontSize: "1.5rem" }} />
          AI Portfolio Insights
        </h2>
        <button className="btn btn-blue" onClick={fetchData}>
          Refresh Analysis
        </button>
      </div>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type}`}>
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <h3>{insight.title}</h3>
              <p>{insight.message}</p>
            </div>
          </div>
        ))}
      </div>

      {holdings.length === 0 && (
        <div className="no-data">
          <Insights style={{ fontSize: "3rem", color: "var(--text-disabled)" }} />
          <p>No holdings to analyze. Start investing to see insights!</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioInsights;