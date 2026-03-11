import axios from "axios";

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || "demo";
const BASE_URL = "https://www.alphavantage.co/query";

// Rate limiting
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 12000; // 12 seconds between calls (5 calls per minute limit)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Map Indian stock symbols to Alpha Vantage format
const mapIndianSymbol = (symbol) => {
  // Alpha Vantage uses .BSE or .NSE suffix for Indian stocks
  // Example: RELIANCE.BSE, TCS.NSE
  const symbolMap = {
    RELIANCE: "RELIANCE.BSE",
    TCS: "TCS.BSE",
    INFY: "INFY.BSE",
    HDFC: "HDFCBANK.BSE",
    ICICI: "ICICIBANK.BSE",
    SBIN: "SBIN.BSE",
    ITC: "ITC.BSE",
    BHARTIARTL: "BHARTIARTL.BSE",
    KOTAKBANK: "KOTAKBANK.BSE",
    LT: "LT.BSE",
  };

  return symbolMap[symbol] || `${symbol}.BSE`;
};

// Fetch real-time stock price
export const fetchStockPrice = async (symbol) => {
  try {
    // Rate limiting
    const now = Date.now();
    if (now - lastCallTime < MIN_CALL_INTERVAL) {
      await sleep(MIN_CALL_INTERVAL - (now - lastCallTime));
    }
    lastCallTime = Date.now();

    const mappedSymbol = mapIndianSymbol(symbol);

    const response = await axios.get(BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: mappedSymbol,
        apikey: API_KEY,
      },
    });

    const quote = response.data["Global Quote"];

    if (!quote || Object.keys(quote).length === 0) {
      console.warn(`No data for ${symbol}, using fallback`);
      return generateFallbackPrice(symbol);
    }

    return {
      symbol: symbol,
      price: parseFloat(quote["05. price"]) || 0,
      change: parseFloat(quote["09. change"]) || 0,
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")) || 0,
      high: parseFloat(quote["03. high"]) || 0,
      low: parseFloat(quote["04. low"]) || 0,
      volume: parseInt(quote["06. volume"]) || 0,
      timestamp: quote["07. latest trading day"],
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    return generateFallbackPrice(symbol);
  }
};

// Fetch multiple stocks (batch)
export const fetchMultipleStocks = async (symbols) => {
  const results = [];

  for (const symbol of symbols) {
    try {
      const data = await fetchStockPrice(symbol);
      results.push(data);
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      results.push(generateFallbackPrice(symbol));
    }
  }

  return results;
};

// Fallback prices when API fails
const generateFallbackPrice = (symbol) => {
  const basePrices = {
    RELIANCE: 2450,
    TCS: 3680,
    INFY: 1520,
    HDFC: 1650,
    ICICI: 950,
    SBIN: 620,
    ITC: 450,
    BHARTIARTL: 890,
    KOTAKBANK: 1750,
    LT: 3420,
  };

  const basePrice = basePrices[symbol] || 1000;
  const randomChange = (Math.random() - 0.5) * 3; // ±1.5%
  const price = basePrice * (1 + randomChange / 100);
  const change = price - basePrice;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: parseFloat((price * 1.02).toFixed(2)),
    low: parseFloat((price * 0.98).toFixed(2)),
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString().split("T")[0],
    isFallback: true,
  };
};

// Search stocks
export const searchStocks = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "SYMBOL_SEARCH",
        keywords: query,
        apikey: API_KEY,
      },
    });

    const matches = response.data.bestMatches || [];
    return matches
      .filter((match) => match["4. region"] === "India")
      .map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        currency: match["8. currency"],
      }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

// Get historical data
export const fetchHistoricalData = async (symbol, interval = "daily") => {
  try {
    const mappedSymbol = mapIndianSymbol(symbol);

    const response = await axios.get(BASE_URL, {
      params: {
        function: interval === "intraday" ? "TIME_SERIES_INTRADAY" : "TIME_SERIES_DAILY",
        symbol: mappedSymbol,
        interval: interval === "intraday" ? "5min" : undefined,
        outputsize: "compact",
        apikey: API_KEY,
      },
    });

    const timeSeriesKey =
      interval === "intraday"
        ? "Time Series (5min)"
        : "Time Series (Daily)";

    const timeSeries = response.data[timeSeriesKey] || {};

    return Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"]),
    }));
  } catch (error) {
    console.error("Historical data error:", error);
    return [];
  }
};

export default {
  fetchStockPrice,
  fetchMultipleStocks,
  searchStocks,
  fetchHistoricalData,
};