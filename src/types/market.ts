export interface OHLCV {
    timestamp: number;  // Unix timestamp UTC+7
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Ticker {
    symbol: string;
    timestamp: number;
    datetime: string;
    high: number | null;
    low: number | null;
    bid: number | null;
    ask: number | null;
    last: number | null;
    close: number | null;
    open: number | null;
    baseVolume: number | null;
    quoteVolume: number | null;
    change: number | null;
    percentage: number | null;
    average: number | null;
}

export interface Market {
    symbol: string;         // Standardized symbol e.g., BTC/USDT
    id: string;             // Raw exchange ID e.g., BTCUSDT
    base: string;
    quote: string;
    settle?: string;
    active: boolean;
    precision: {
        price: number;
        amount: number;
    };
    limits: {
        amount: { min: number; max: number };
        price: { min: number; max: number };
        cost: { min: number; max: number };
    };
    info: any;              // Raw data
    minMove: number;        // small price change (tick size)
    priceScale: number;     // 10^precision
}

export interface ExchangeInfo {
    id: string;
    name: string;
    symbols: string[];
    timeframes: string[];
    markets: Market[];
}
