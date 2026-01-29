# AI Agent Guide: Using MiniCCXT-Lite

You are an expert developer building a financial dashboard or trading application using the **MiniCCXT-Lite** library. 

## 1. Library Overview
**MiniCCXT-Lite** is a high-performance, unified market data library for Crypto and Forex. It provides a standardized API for multiple exchanges, handling complexity like pagination, symbol normalization, and real-time streaming.

- **NPM Package**: `miniccxt-lite`
- **CDN (Browser)**: `https://cdn.jsdelivr.net/npm/miniccxt-lite@1.0.3/dist/mini-ccxt.js`
- **Global Name**: `MiniCCXT` (when using CDN)

## 2. Supported Exchanges
Use these IDs when calling `addExchange`:
- `BINANCE_FUTURE`: Binance USDⓂ Futures
- `BYBIT_FUTURE`: Bybit USDT Linear Perpetual
- `OKX_FUTURE`: OKX Swap
- `OANDA`: Oanda Forex (requires `apiKey` and `accountId`)

## 3. Core Concepts
### Unified Symbols
Format: `EXCHANGE:BASE/QUOTE`
Examples: `BINANCE:BTC/USDT`, `OANDA:XAU/USD`, `BYBIT:ETH/USDT`.

### Initialization
```javascript
// Node.js
import { MiniCCXT } from 'miniccxt-lite';
const ccxt = new MiniCCXT();

// Browser (Global)
const ccxt = new MiniCCXT.MiniCCXT();
```

## 4. API Reference

### Initialization & Markets
- `await ccxt.addExchange(exchangeId, options)`: Initialize an exchange. Options include `apiKey`, `secret`, `accountId` (for OANDA).
- `await ccxt.fetchExchangeInfo(exchangeId)`: Returns all available symbols and their metadata (precision, minMove, priceScale).

### REST API (Market Data)
- `await ccxt.fetchTicker(exchangeId, symbol)`: Fetch latest price, change, and 24h volume.
- `await ccxt.fetchTickers(exchangeId, symbols)`: Fetch multiple tickers at once.
- `await ccxt.fetchOHLCV(exchangeId, symbol, timeframe, { limit: 1000 })`: Fetch historical candles. 
  - *Smart Fetch Feature*: If you request 2000 candles but the exchange only allows 500 per call, the library handles the loop automatically.

### WebSocket (Real-time)
- `ccxt.subscribeTicker(exchangeId, symbol, callback)`: Subscribe to price updates for one symbol.
- `ccxt.subscribeAllMiniTickers(exchangeId, callback)`: Subscribe to price updates for ALL symbols in a single stream (efficient for dashboards).

## 5. Data Models

### Ticker Object
```typescript
{
  symbol: string;      // e.g., "BTC/USDT"
  last: number;        // Current price
  high: number;        // 24h High
  low: number;         // 24h Low
  change: number;      // 24h change amount
  percentage: number;  // 24h change percentage
  volume: number;      // 24h Volume
  timestamp: number;   // UTC Timestamp
}
```

### Market/Symbol Info (for TradingView)
```typescript
{
  symbol: string;
  base: string;
  quote: string;
  precision: number;   // Decimal places for price
  priceScale: number;  // 10^precision (used by TradingView)
  minMove: number;     // Smallest tick (e.g., 0.01)
}
```

## 6. TradingView Integration Tips
When setting up `Datafeed` for TradingView:
1. Use `fetchExchangeInfo` to populate the `onReady` and `resolveSymbol` callbacks.
2. Use `fetchOHLCV` in `getBars`.
3. Map `market.priceScale` and `market.minMove` directly to the `LibrarySymbolInfo`.

## 7. Performance & Optimization
- **Smart Pagination**: You can request large datasets (e.g. 5000 nendes) in a single `fetchOHLCV` call; the library manages API limits.
- **Forex Gap Filling**: For OANDA, the library automatically inserts "flat" candles during weekends to prevent gaps in charts.
- **Hybrid Streaming**: It uses native WebSockets for Crypto and HTTP Streams for Oanda, presenting a unified callback interface.

## 8. Common Code Snippet
```javascript
const ccxt = new MiniCCXT.MiniCCXT();
await ccxt.addExchange('BINANCE_FUTURE');

// Real-time market scanner
ccxt.subscribeAllMiniTickers('BINANCE_FUTURE', (msg) => {
    const tickers = msg.data; // Array of updated tickers
    updateUI(tickers);
});

// Fetch historical data for chart
const bars = await ccxt.fetchOHLCV('BINANCE_FUTURE', 'BTC/USDT', '15m', { limit: 1000 });
```
