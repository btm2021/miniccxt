export interface UnifiedMessage {
    exchange: string;
    symbol: string;
    type: 'ticker' | 'ohlcv' | 'orderbook';
    timestamp: number;  // Unix timestamp UTC+7
    data: any;
}

export type WSCallback = (data: UnifiedMessage) => void;
