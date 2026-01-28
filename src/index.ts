import { ExchangeConfig } from './types/exchange';
import { BaseExchange } from './core/BaseExchange';
import { Binance } from './exchanges/crypto/binance';
import { Bybit } from './exchanges/crypto/bybit';
import { OKX } from './exchanges/crypto/okx';
import { Oanda } from './exchanges/forex/oanda';
import { OHLCV, Ticker, ExchangeInfo } from './types/market';
import { WSCallback } from './types/websocket';

export class MiniCCXT {
    private exchanges: Map<string, BaseExchange> = new Map();

    addExchange(config: ExchangeConfig): BaseExchange {
        let exchange: BaseExchange;

        switch (config.type) {
            case 'crypto':
                if (config.id === 'binance') {
                    exchange = new Binance(config);
                } else if (config.id === 'bybit') {
                    exchange = new Bybit(config);
                } else if (config.id === 'okx') {
                    exchange = new OKX(config);
                } else {
                    // Default crypto or other implementations
                    exchange = new Binance(config); // Fallback for demo
                }
                break;
            case 'forex':
                exchange = new Oanda(config);
                break;
            default:
                throw new Error(`Unsupported exchange type: ${config.type}`);
        }

        this.exchanges.set(config.id, exchange);
        return exchange;
    }

    getExchange(id: string): BaseExchange {
        const exchange = this.exchanges.get(id);
        if (!exchange) throw new Error(`Exchange ${id} not found. Add it first.`);
        return exchange;
    }

    // Unified REST API methods
    async fetchOHLCV(exchangeId: string, symbol: string, timeframe: string, params?: object): Promise<OHLCV[]> {
        return this.getExchange(exchangeId).fetchOHLCV(symbol, timeframe, params);
    }

    async fetchTicker(exchangeId: string, symbol: string, params?: object): Promise<Ticker> {
        return this.getExchange(exchangeId).fetchTicker(symbol, params);
    }

    async fetchExchangeInfo(exchangeId: string): Promise<ExchangeInfo> {
        return this.getExchange(exchangeId).fetchExchangeInfo();
    }

    // Unified WebSocket API methods
    subscribeTicker(exchangeId: string, symbol: string, callback: WSCallback): void {
        this.getExchange(exchangeId).subscribeTicker(symbol, callback);
    }

    subscribeAllMiniTickers(exchangeId: string, callback: WSCallback): void {
        this.getExchange(exchangeId).subscribeAllMiniTickers(callback);
    }

    subscribeOHLCV(exchangeId: string, symbol: string, timeframe: string, callback: WSCallback): void {
        this.getExchange(exchangeId).subscribeOHLCV(symbol, timeframe, callback);
    }
}

export * from './types/exchange';
export * from './types/market';
export * from './types/websocket';
export * from './core/BaseExchange';
