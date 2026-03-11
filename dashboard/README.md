# TradeX - Professional Trading Platform

A modern, real-time stock trading platform built with React and Node.js.

## Features

- 📈 Real-time stock prices with live updates
- 💰 Portfolio management with live P&L tracking
- 📊 Advanced charting and analytics
- 🔔 Price alerts and notifications
- 📖 Trading journal for performance tracking
- 🧮 Advanced trade calculator with real charges
- 🎯 AI-powered portfolio insights
- 📰 Market news feed
- 🌙 Professional dark theme

## Tech Stack

**Frontend:**
- React 18
- Chart.js for visualizations
- Material-UI icons
- Axios for API calls

**Backend:**
- Node.js
- Express
- MongoDB
- JWT authentication

**APIs:**
- Alpha Vantage for real-time stock data

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/tradex.git
cd tradex
```

2. Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd dashboard
npm install
```

3. Configure environment variables

Create `.env` in dashboard folder:
```
REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

4. Start the servers

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd dashboard
npm start
```

5. Open http://localhost:3000

## Default Credentials

Email: demo@tradex.com
Password: demo123

## Features Overview

### Dashboard
- Live portfolio value
- Today's P&L
- Available balance
- Quick stats

### Holdings & Positions
- Real-time price updates every 30 seconds
- Live P&L calculations
- Detailed performance metrics

### Trade Calculator
- Real brokerage calculations (STT, GST, etc.)
- Break-even price calculator
- Affordability checker

### Portfolio Insights
- AI-powered analysis
- Performance recommendations
- Risk assessment
- Diversification tips

### Price Alerts
- Set custom price triggers
- Browser notifications
- Multiple alert types

## License

MIT

## Contact

For support: support@tradex.com