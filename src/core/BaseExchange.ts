import { ExchangeConfig } from '../types/exchange';
import { OHLCV, ExchangeInfo, Ticker } from '../types/market';
import { RestClient } from './RestClient';
import { WebSocketClient } from './WebSocketClient';
import { WSCallback } from '../types/websocket';
import { normalizeSymbol } from '../utils/symbol';
import { toUTC7 } from '../utils/timestamp';

export abstract class BaseExchange {
    protected config: ExchangeConfig;
    protected restClient: RestClient;
    protected wsClient?: WebSocketClient;

    constructor(config: ExchangeConfig) {
        this.config = config;
        this.restClient = new RestClient(config.restUrl);
        if (config.wsUrl) {
            this.wsClient = new WebSocketClient(config.wsUrl);
        }
    }

    // Abstract methods to be implemented by each exchange
    abstract fetchOHLCV(symbol: string, timeframe: string, params?: object): Promise<OHLCV[]>;
    abstract fetchExchangeInfo(): Promise<ExchangeInfo>;
    abstract fetchTicker(symbol: string, params?: object): Promise<Ticker>;
    abstract fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]>;

    // WebSocket methods
    abstract subscribeTicker(symbol: string, callback: WSCallback): void;
    abstract subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void;
    abstract subscribeAllMiniTickers(callback: WSCallback): void;
    abstract unsubscribe(channel: string): void;

    // Common normalization methods
    protected normalizeSymbol(symbol: string): string {
        const map = this.config.symbolMap || {};
        return map[symbol] || symbol;
    }

    protected normalizeTimeframe(timeframe: string): string {
        return this.config.timeframeMap[timeframe] || timeframe;
    }

    protected normalizeTimestamp(ts: number): number {
        return toUTC7(ts);
    }
}
