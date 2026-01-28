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

export interface ExchangeInfo {
    id: string;
    name: string;
    symbols: string[];
    timeframes: string[];
    markets: any[];
}
