# AI Agent Guide: Mini-CCXT Project Extension

You are tasked with maintaining and extending the **Mini-CCXT** library. This library is a lightweight market data aggregator for Crypto and Forex.

## 🎯 Current Context & Goals
The project has successfully unified **Binance**, **Bybit**, **OKX**, and **OANDA**. 
The goal is to keep adding new exchanges (Stock, Forex, or other Crypto) while maintaining the **Unified Interface** and **TradingView compatibility**.

---

## 🏗️ Technical Standards (MUST FOLLOW)

### 1. Unified Symbol Format
- All internal symbols must be standardized: `EXCHANGE_ID:BASE/QUOTE`.
- Example: `BINANCE:BTC/USDT`, `OANDA:EUR/USD`.
- Use `BaseExchange.standardizeSymbol` and `utils/symbol.ts` for consistency.

### 2. BaseExchange Architecture
- Every new exchange must extend `BaseExchange` in `src/exchanges/`.
- Overwrite `fetchOHLCV`, `fetchTicker`, `fetchExchangeInfo`, and subscription methods.
- Use `this.restClient` for HTTP calls and `this.wsClient` for WebSockets.

### 3. Market Metadata (Crucial for Charts)
- `fetchExchangeInfo` MUST populate `this.markets` with `Market` objects.
- Use `this.calculateTVPrecision(tickSize)` to generate `minMove`, `priceScale`, and `precision`.
- This metadata is used by the frontend to render TradingView charts correctly.

### 4. Forex & Timezone Handling
- Forex exchanges (like OANDA) usually have gaps on weekends. 
- You MUST implement/use a `fillGaps` logic inside `fetchOHLCV` for Forex to provide continuous data for charts.
- All timestamps must be handled as numbers (UTC). The project defaults to display-friendly formats for UTC+7 in some utils, but core data is always UTC.

### 5. OANDA Specifics
- OANDA doesn't use standard WebSockets for market data; it uses **HTTP Streaming**.
- Implementation is in `src/exchanges/forex/oanda.ts` using `fetch` + `ReadableStream`.
- When adding similar providers (e.g., IGPark, Alpaca), check if they use WebSockets or HTTP Streams.

---

## 🛠️ Typical Task: Adding a New Exchange

1.  **Define Config**: Add a new entry to `DEFAULT_CONFIGS` in `src/index.ts`.
2.  **Create Interface**: Create `src/exchanges/<category>/<name>.ts`.
3.  **Implement `fetchExchangeInfo`**: Map the exchange's raw symbols to unified symbols and calculate precision.
4.  **Implement `fetchOHLCV`**: 
    - Handle pagination (Smart Fetch) to allow fetching more data than the exchange's single-request limit.
    - For Forex, implement `fillGaps`.
5.  **Implement WebSocket/Stream**: Connect to the streaming endpoint and map incoming data to the `Ticker` or `OHLCV` format.
6.  **Register**: Import and add the new class to the `switch` case in `MiniCCXT.addExchange`.
7.  **Bundle**: Run `npm run bundle` to update the browser version.

---

## 🔍 Code Review Checklist
- [ ] Does it support `fetchExchangeInfo`?
- [ ] Does it use `Normalizer` for all data outputs?
- [ ] Are the symbol mappings correct (`rawToStandard` and `standardToRaw`)?
- [ ] Does `fetchOHLCV` support the `limit` parameter exceeding the exchange limit?
- [ ] Is the browser bundle updated (`dist/mini-ccxt.js`)?

---

## 🚀 Vision
Keep the library "mini" (small footprint, fast bundling) while becoming the ultimate backend for custom trading dashboards.
