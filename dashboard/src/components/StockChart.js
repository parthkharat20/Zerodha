import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { TrendingUp, TrendingDown, ShowChart } from "@mui/icons-material";
import { fetchHistoricalData } from "../services/stockAPI";
import "./StockChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ stockSymbol = "RELIANCE" }) => {
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState("1D"); // 1D, 5D, 1M, 3M, 1Y
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    change: 0,
    changePercent: 0,
  });

  useEffect(() => {
    fetchChartData();
  }, [stockSymbol, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const interval = timeframe === "1D" ? "intraday" : "daily";
      const historicalData = await fetchHistoricalData(stockSymbol, interval);

      if (historicalData.length === 0) {
        // Generate mock data if API fails
        generateMockData();
        return;
      }

      const labels = historicalData.map(d => d.date);
      const prices = historicalData.map(d => d.close);

      const firstPrice = historicalData[0].close;
      const lastPrice = historicalData[historicalData.length - 1].close;
      const change = lastPrice - firstPrice;
      const changePercent = ((change / firstPrice) * 100).toFixed(2);

      setStats({
        open: historicalData[0].open,
        high: Math.max(...historicalData.map(d => d.high)),
        low: Math.min(...historicalData.map(d => d.low)),
        close: lastPrice,
        change,
        changePercent,
      });

      setChartData({
        labels,
        datasets: [
          {
            label: stockSymbol,
            data: prices,
            borderColor: changePercent >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)',
            backgroundColor: changePercent >= 0 
              ? 'rgba(72, 194, 55, 0.1)' 
              : 'rgba(250, 118, 78, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      generateMockData();
    }
  };

  const generateMockData = () => {
    const labels = [];
    const prices = [];
    const basePrice = 2450;

    for (let i = 0; i < 30; i++) {
      labels.push(`Day ${i + 1}`);
      const randomChange = (Math.random() - 0.5) * 50;
      prices.push(basePrice + randomChange);
    }

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = ((change / firstPrice) * 100).toFixed(2);

    setStats({
      open: firstPrice,
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: lastPrice,
      change,
      changePercent,
    });

    setChartData({
      labels,
      datasets: [
        {
          label: stockSymbol,
          data: prices,
          borderColor: changePercent >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)',
          backgroundColor: changePercent >= 0 
            ? 'rgba(72, 194, 55, 0.1)' 
            : 'rgba(250, 118, 78, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    });

    setLoading(false);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: stats.changePercent >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(0);
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  return (
    <div className="stock-chart-container">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="chart-title">
          <ShowChart style={{ fontSize: '1.2rem' }} />
          <h3>{stockSymbol}</h3>
        </div>
        <div className="chart-stats">
          <div className={`stat-item ${stats.changePercent >= 0 ? 'profit' : 'loss'}`}>
            {stats.changePercent >= 0 ? (
              <TrendingUp style={{ fontSize: '1rem' }} />
            ) : (
              <TrendingDown style={{ fontSize: '1rem' }} />
            )}
            <span className="stat-value">
              {stats.changePercent >= 0 ? '+' : ''}₹{stats.change.toFixed(2)} (
              {stats.changePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Price Stats */}
      <div className="price-stats">
        <div className="price-stat">
          <span className="stat-label">Open</span>
          <span className="stat-value">₹{stats.open.toFixed(2)}</span>
        </div>
        <div className="price-stat">
          <span className="stat-label">High</span>
          <span className="stat-value profit">₹{stats.high.toFixed(2)}</span>
        </div>
        <div className="price-stat">
          <span className="stat-label">Low</span>
          <span className="stat-value loss">₹{stats.low.toFixed(2)}</span>
        </div>
        <div className="price-stat">
          <span className="stat-label">Close</span>
          <span className="stat-value">₹{stats.close.toFixed(2)}</span>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        {["1D", "5D", "1M", "3M", "1Y"].map((tf) => (
          <button
            key={tf}
            className={timeframe === tf ? "tf-btn active" : "tf-btn"}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        {loading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart data...</p>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>No chart data available</p>
        )}
      </div>
    </div>
  );
};

export default StockChart;