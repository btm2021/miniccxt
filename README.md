# Mini-CCXT Project

**Mini-CCXT** là một thư viện Unified Market Data siêu nhẹ (Lite), được thiết kế để hợp nhất các API REST và WebSocket từ nhiều sàn giao dịch khác nhau (Crypto & Forex) thành một chuẩn duy nhất. Thư viện hỗ trợ cả môi trường **Node.js** và **Browser**.

🎯 **Mục tiêu**: Tập trung vào Market Data (OHLCV, Ticker, ExchangeInfo) với khả năng "Smart Fetch" (tự động phân trang khi yêu cầu dữ liệu lịch sử lớn) và đồng bộ hóa đa sàn.

---

## 🚀 Tính năng chính

- **Unified API**: Sử dụng chung một bộ hàm cho mọi sàn (`fetchOHLCV`, `fetchTicker`, `fetchExchangeInfo`, `subscribeTicker`).
- **Standardized Symbols**: Ký hiệu thống nhất dưới dạng `EXCHANGE:BASE/QUOTE` (ví dụ: `BINANCE:BTC/USDT`, `OANDA:XAU/USD`).
- **Smart Fetch**: Tự động chia nhỏ và gọi API nhiều lần khi `limit` vượt quá giới hạn của sàn (ví dụ: lấy 5000 nến Binance trong 1 lần gọi).
- **Forex Gap Filling**: Algorith tự động chèn "nến phẳng" (flat bars) vào các khoảng nghỉ của thị trường Forex (cuối tuần, lễ) giúp biểu đồ không bị đứt đoạn.
- **Hybrid Streaming**: 
  - Crypto: Sử dụng native WebSocket.
  - Forex (OANDA): Sử dụng HTTP Streaming (ReadableStream) để nhận giá trực tiếp không cần WebSocket.
- **TradingView Compatible**: Cung cấp sẵn các thuộc tính `minMove`, `priceScale`, `precision` để tích hợp trực tiếp vào TradingView Chart.

---

## 🏗️ Cấu trúc dự án

```text
src/
├── core/               # Nhân lõi (Base classes, Drivers)
│   ├── BaseExchange.ts # Lớp cơ sở cho mọi sàn
│   ├── RestClient.ts   # Axios wrapper
│   └── WebSocketClient.ts # WebSocket wrapper (Node/Browser)
├── exchanges/          # Triển khai cụ thể từng sàn
│   ├── crypto/         # Binance, Bybit, OKX
│   └── forex/          # Oanda
├── types/              # Định nghĩa TypeScript (Market, Exchange, WS)
├── utils/              # Tiện ích (Symbol handling, Timezone UTC+7)
└── index.ts            # Entry point (MiniCCXT class & Configs)
```

---

## 🛠️ Hướng dẫn sử dụng

### 1. Cài đặt và Build
```bash
npm install
npm run bundle  # Tạo file bundle tại dist/mini-ccxt.js
```

### 2. Sử dụng trong Browser
Nhúng file `dist/mini-ccxt.js` và khởi tạo:
```javascript
const ccxt = new MiniCCXT.MiniCCXT();

// Thêm sàn (sử dụng ID trong DEFAULT_CONFIGS)
const binance = await ccxt.addExchange('BINANCE_FUTURE');
const oanda = await ccxt.addExchange('OANDA', { accountId: '...', apiKey: '...' });

// Lấy 2000 nến (Smart Fetch tự động chạy)
const bars = await ccxt.fetchOHLCV('BINANCE_FUTURE', 'BTC/USDT', '1h', { limit: 2000 });

// Lấy thông tin cấu hình chart (cho TradingView)
const info = binance.getInfoSymbol('BTC/USDT'); 
// Trả về { minMove, priceScale, precision ... }
```

### 3. Đăng ký nhận giá Realtime
```javascript
ccxt.subscribeTicker('OANDA', 'XAU/USD', (msg) => {
    console.log(`[OANDA] Gold Price: ${msg.data.last}`);
});
```

---

## 🧪 Dashboard Demo
Dự án đi kèm một trang Dashboard mẫu tại `examples/dashboard/index.html`. 
Để chạy demo:
1. Chạy lệnh: `npx http-server .`
2. Mở trình duyệt tại: `http://localhost:8080/examples/dashboard/`

---

## 📂 Danh sách sàn đang hỗ trợ
- **BINANCE_FUTURE**: Crypto Futures (USD-M).
- **BYBIT_FUTURE**: Crypto Futures (Linear).
- **OKX_FUTURE**: Crypto Futures (Swap).
- **OANDA**: Forex (Major pairs & Gold).

---

## 📝 Giấy phép
Dự án được phát triển cho mục đích nghiên cứu và giao dịch tự động. Vui lòng kiểm tra kỹ logic tính toán (đặc biệt là Gap Filling và Timezone) trước khi áp dụng vào thực tế.
