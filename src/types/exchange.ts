export interface ExchangeConfig {
    id: string;                    // 'binance', 'oanda'
    name: string;                  // 'Binance', 'OANDA'
    shortName: string;             // 'BNB', 'BYB'
    description: string;           // Brief description
    type: 'crypto' | 'forex';
    logo: string;                  // SVG string hoặc URL

    // Connection
    restUrl: string;               // REST API base URL
    wsUrl?: string;                // WebSocket URL (optional)

    // Authentication (optional)
    apiKey?: string;
    apiSecret?: string;

    // Capabilities
    capabilities: {
        rest: {
            fetchOHLCV: boolean;
            fetchTickers: boolean;
            fetchExchangeInfo: boolean;
        };
        websocket: {
            ticker: boolean;
            ohlcv: boolean;
            allMiniTickers: boolean;
        };
    };

    // Mapping
    timeframeMap: Record<string, string>;  // '1m' -> '1min' (exchange specific)
    symbolMap?: Record<string, string>;     // 'BTC/USDT' -> 'BTCUSDT'

    // Static data for exchanges without list API
    staticSymbols?: string[];
}
