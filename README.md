# Mini-CCXT Project

**Mini-CCXT** là một thư viện Unified Market Data siêu nhẹ, được thiết kế để hợp nhất các API REST và WebSocket từ nhiều sàn giao dịch khác nhau (Crypto & Forex) thành một chuẩn duy nhất. Thư viện hỗ trợ cả môi trường **Node.js** và **Browser**.

🎯 **Mục tiêu**: Tập trung vào Market Data (OHLCV, Ticker) với khả năng "Smart Fetch" (tự động phân trang khi yêu cầu dữ liệu lịch sử lớn).

---

## 🚀 Tính năng chính

- **Unified API**: Sử dụng chung một bộ hàm cho mọi sàn (`fetchOHLCV`, `fetchTicker`, `subscribeAllMiniTickers`).
- **Smart Fetch**: Tự động chia nhỏ và gọi API nhiều lần khi `limit` vượt quá giới hạn của sàn (ví dụ: lấy 5000 nến Binance trong 1 lần gọi).
- **Hybrid WebSocket**: Hệ thống tự động nhận diện môi trường để sử dụng `ws` (Node.js) hoặc `native WebSocket` (Browser).
- **Timezone Standard**: Mọi timestamp trả về đều được chuẩn hóa (ví dụ: hỗ trợ UTC+7 như cấu hình).
- **Exchange Support**:
  - **Binance Future** (USD-M)
  - **Bybit Future** (Perpetual Linear)
  - **OKX Future** (Swap)
  - **OANDA** (Forex - REST & Polling fallback)

---

## 🏗️ Kiến trúc Chi tiết

Dự án được xây dựng theo mô hình **Inheritance & Manager**:

- `core/BaseExchange.ts`: Lớp trừu tượng định nghĩa các quy chuẩn chung.
- `core/RestClient.ts` & `WebSocketClient.ts`: Các driver kết nối nền tảng.
- `core/Normalizer.ts`: Tập hợp các hàm biến đổi dữ liệu thô từ sàn về định dạng chuẩn của dự án.
- `exchanges/`: Thư mục chứa các bản triển khai thực tế của từng sàn (Binance, Bybit, OKX...).

### Định dạng dữ liệu chuẩn
```typescript
interface OHLCV {
  timestamp: number; // Đã chuẩn hóa
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UnifiedMessage {
  exchange: 'BINANCE_FUTURE' | 'BYBIT_FUTURE' | 'OKX_FUTURE' | string;
  symbol: string;
  type: 'ticker' | 'ohlcv';
  data: any; // Raw data hoặc chuẩn hóa sâu hơn
}
```

---

## 🛠️ Hướng dẫn Triển khai (Implement)

### 1. Cài đặt môi trường
```bash
npm install
```

### 2. Thêm một sàn mới (DataSource)
Để thêm một sàn mới, bạn tạo một file trong `src/exchanges/` và kế thừa `BaseExchange`:

```typescript
import { BaseExchange } from '../../core/BaseExchange';

export class MyNewExchange extends BaseExchange {
  async fetchOHLCV(symbol: string, timeframe: string, params: any = {}) {
    // 1. Gọi API sàn sử dụng this.restClient
    // 2. Sử dụng logic vòng lặp nếu muốn hỗ trợ Smart Fetch
    // 3. Trả về dữ liệu qua Normalizer.normalizeOHLCV
  }
  
  // Triển khai tương tự cho fetchTicker và WebSocket subscriptions
}
```
Sau đó đăng ký class này trong `src/index.ts`.

### 3. Đóng gói cho Browser
Sử dụng `esbuild` để tạo file bundle sử dụng ngay lập tức:
```bash
npm run bundle
```
File kết quả sẽ nằm tại `dist/mini-ccxt.js`. Bạn có thể nhúng trực tiếp vào thẻ `<script>`.

---

## 🧪 Ví dụ sử dụng

### Node.js (TypeScript)
```typescript
import { MiniCCXT } from './src/index';

const ccxt = new MiniCCXT();
ccxt.addExchange({
    id: 'binance',
    name: 'Binance Future',
    type: 'crypto',
    restUrl: 'https://fapi.binance.com',
    wsUrl: 'wss://fstream.binance.com/ws',
    timeframeMap: { '1h': '1h' }
});

// Smart Fetch 2000 nến
const ohlcv = await ccxt.fetchOHLCV('binance', 'BTC/USDT', '1h', { limit: 2000 });
```

### WebSocket All Tickers (Realtime)
```typescript
ccxt.subscribeAllMiniTickers('bybit', (msg) => {
    console.log(`[${msg.exchange}] ${msg.symbol}: ${msg.data.lastPrice}`);
});
```

---

## 📂 Cấu trúc thư mục
- `src/core/`: Nhân lõi của thư viện.
- `src/exchanges/`: Các bản thực thi sàn giao dịch.
- `src/utils/`: Các hàm tiện ích về thời gian, ký hiệu.
- `dist/`: Chứa file bundle cho trình duyệt.
- `examples/`: Các ví dụ mẫu và file test.

---

## 📝 Giấy phép
Dự án được phát triển cho mục đích nghiên cứu và giao dịch tự động. Vui lòng kiểm tra kỹ logic tính toán trước khi áp dụng vào thực tế.
