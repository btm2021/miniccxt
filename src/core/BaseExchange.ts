import { ExchangeConfig } from '../types/exchange';
import { OHLCV, ExchangeInfo, Ticker } from '../types/market';
import { RestClient } from './RestClient';
import { WebSocketClient } from './WebSocketClient';
import { WSCallback } from '../types/websocket';
import { normalizeSymbol } from '../utils/symbol';
import { toUTC7 } from '../utils/timestamp';
import { Market } from '../types/market';

export abstract class BaseExchange {
    protected config: ExchangeConfig;
    protected restClient: RestClient;
    protected wsClient?: WebSocketClient;
    protected rawToStandard: Map<string, string> = new Map();
    protected standardToRaw: Map<string, string> = new Map();
    protected markets: Map<string, Market> = new Map();

    constructor(config: ExchangeConfig) {
        this.config = config;
        this.restClient = new RestClient(config.restUrl);
        if (config.wsUrl) {
            this.wsClient = new WebSocketClient(config.wsUrl);
        }
    }

    /**
     * Get exchange metadata
     */
    getInfo() {
        return {
            id: this.config.id,
            name: this.config.name,
            shortName: this.config.shortName,
            description: this.config.description,
            logo: this.config.logo
        };
    }

    /**
     * Get market info for a symbol
     */
    getMarket(symbol: string): Market | undefined {
        const stdSymbol = symbol.includes(':') ? symbol : this.standardizeSymbol(symbol);
        return this.markets.get(stdSymbol);
    }

    /**
     * Alias for getMarket (as requested by user)
     */
    getInfoSymbol(symbol: string) {
        const market = this.getMarket(symbol);
        if (!market) return null;
        return {
            ...market,
            getMinmove: market.minMove,
            getPriceScale: market.priceScale
        };
    }

    /**
     * Set markets
     */
    protected setMarkets(markets: Market[]) {
        this.markets.clear();
        for (const market of markets) {
            this.markets.set(market.symbol, market);
        }
    }

    /**
     * Standardize symbol to [EXCHANGE_ID]:SYMBOL format
     */
    standardizeSymbol(symbol: string): string {
        return `${this.config.id.toUpperCase()}:${symbol.toUpperCase()}`;
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
        let targetSymbol = symbol;
        if (symbol.includes(':')) {
            targetSymbol = symbol.split(':')[1];
        }

        // Check our map first (standard search)
        const stdSymbol = symbol.includes(':') ? symbol : this.standardizeSymbol(symbol);
        if (this.standardToRaw.has(stdSymbol)) {
            return this.standardToRaw.get(stdSymbol)!;
        }

        const map = this.config.symbolMap || {};
        return map[targetSymbol] || targetSymbol;
    }

    /**
     * Helper to calculate minMove and priceScale for TradingView
     */
    protected calculateTVPrecision(tickSize: string | number) {
        const tsStr = tickSize.toString();
        let precision = 0;
        if (tsStr.includes('.')) {
            precision = tsStr.split('.')[1].length;
        }
        const priceScale = Math.pow(10, precision);
        const minMove = Math.round(parseFloat(tsStr) * priceScale);
        return { minMove, priceScale, precision };
    }

    protected normalizeTimeframe(timeframe: string): string {
        return this.config.timeframeMap[timeframe] || timeframe;
    }

    protected normalizeTimestamp(ts: number): number {
        return toUTC7(ts);
    }
}
