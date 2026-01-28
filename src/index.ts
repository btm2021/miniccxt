import { ExchangeConfig } from './types/exchange';
import { BaseExchange } from './core/BaseExchange';
import { Binance } from './exchanges/crypto/binance';
import { Bybit } from './exchanges/crypto/bybit';
import { OKX } from './exchanges/crypto/okx';
import { Oanda } from './exchanges/forex/oanda';
import { OHLCV, Ticker, ExchangeInfo } from './types/market';
import { WSCallback } from './types/websocket';

// Exchange Logos
const LOGOS = {
    BINANCE: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
    BYBIT: 'https://www.bybit.com/favicon.ico',
    OKX: 'https://www.okx.com/favicon.ico',
    OANDA: 'https://www.oanda.com/favicon.ico'
};

const DEFAULT_CONFIGS: Record<string, ExchangeConfig> = {
    'BINANCE_FUTURE': {
        id: 'binance',
        name: 'Binance Futures',
        shortName: 'BNB-F',
        description: 'Binance USDⓂ-Margined Futures (Perpetual)',
        type: 'crypto',
        restUrl: 'https://fapi.binance.com',
        wsUrl: 'wss://fstream.binance.com/ws',
        logo: LOGOS.BINANCE,
        timeframeMap: { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d' },
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        }
    },
    'BYBIT_FUTURE': {
        id: 'bybit',
        name: 'Bybit Linear',
        shortName: 'BYB-L',
        description: 'Bybit Perpetual Linear USDT Futures',
        type: 'crypto',
        restUrl: 'https://api.bybit.com',
        wsUrl: 'wss://stream.bybit.com/v5/public/linear',
        logo: LOGOS.BYBIT,
        timeframeMap: { '1m': '1', '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D' },
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        }
    },
    'OKX_FUTURE': {
        id: 'okx',
        name: 'OKX Swap',
        shortName: 'OKX-S',
        description: 'OKX Perpetual Swap Markets',
        type: 'crypto',
        restUrl: 'https://www.okx.com',
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        logo: LOGOS.OKX,
        timeframeMap: { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1H', '4h': '4H', '1d': '1D' },
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        }
    },
    'OANDA': {
        id: 'oanda',
        name: 'Oanda Forex',
        shortName: 'OANDA',
        description: 'Oanda Global Forex Trading',
        type: 'forex',
        restUrl: 'https://api-fxpractice.oanda.com/v3',
        wsUrl: 'https://stream-fxpractice.oanda.com/v3',
        logo: LOGOS.OANDA,
        timeframeMap: { '1m': 'M1', '5m': 'M5', '15m': 'M15', '1h': 'H1', '4h': 'H4', '1d': 'D' },
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        }
    }
};

export class MiniCCXT {
    private exchanges: Map<string, BaseExchange> = new Map();

    /**
     * Get information about supported exchanges and unified APIs
     */
    info() {
        const exchanges = Object.keys(DEFAULT_CONFIGS).map(key => {
            const cfg = DEFAULT_CONFIGS[key];
            return {
                tag: key,
                name: cfg.name,
                shortName: cfg.shortName,
                description: cfg.description,
                logo: cfg.logo
            };
        });

        return {
            supportedExchanges: exchanges,
            apis: {
                rest: [
                    { name: 'fetchOHLCV', description: 'Fetch historical candlestick data with Smart Pagination.' },
                    { name: 'fetchTicker', description: 'Fetch latest price and 24h statistics for a specific symbol.' },
                    { name: 'fetchExchangeInfo', description: 'Fetch all available symbols and market metadata.' }
                ],
                websocket: [
                    { name: 'subscribeTicker', description: 'Real-time price updates for a single symbol.' },
                    { name: 'subscribeAllMiniTickers', description: 'Subscribe to all available tickers in one stream.' },
                    { name: 'subscribeOHLCV', description: 'Real-time candlestick updates (Coming Soon).' }
                ]
            },
            usage: {
                init: 'const ccxt = new MiniCCXT(); await ccxt.addExchange(\'BINANCE_FUTURE\');',
                fetch: 'const ohlcv = await ccxt.fetchOHLCV(\'BINANCE_FUTURE\', \'BTC/USDT\', \'1h\');',
                standardizedSymbol: 'Format: EXCHANGE:BASE/QUOTE (e.g., BINANCE:BTC/USDT)'
            }
        };
    }

    async addExchange(id: string, overrides: Partial<ExchangeConfig> = {}) {
        const config = { ...DEFAULT_CONFIGS[id], ...overrides };
        if (!config.id) throw new Error(`Unknown exchange: ${id}`);

        let exchange: BaseExchange;
        switch (config.id) {
            case 'binance':
                exchange = new Binance(config);
                break;
            case 'bybit':
                exchange = new Bybit(config);
                break;
            case 'okx':
                exchange = new OKX(config);
                break;
            case 'oanda':
                exchange = new Oanda(config);
                break;
            default:
                throw new Error(`Unsupported exchange: ${config.id}`);
        }

        this.exchanges.set(config.id, exchange);
        return exchange;
    }

    getExchange(id: string): BaseExchange {
        const exchange = this.exchanges.get(id);
        if (!exchange) throw new Error(`Exchange ${id} not initialized`);
        return exchange;
    }

    getExchangeMetadata(id: string) {
        return this.getExchange(id).getInfo();
    }

    // Unified REST Methods
    async fetchOHLCV(id: string, symbol: string, timeframe: string, params?: object) {
        return this.getExchange(id).fetchOHLCV(symbol, timeframe, params);
    }

    async fetchTicker(id: string, symbol: string, params?: object) {
        return this.getExchange(id).fetchTicker(symbol, params);
    }

    async fetchTickers(id: string, symbols?: string[], params?: object) {
        return this.getExchange(id).fetchTickers(symbols, params);
    }

    async fetchExchangeInfo(id: string) {
        return this.getExchange(id).fetchExchangeInfo();
    }

    // Unified WebSocket Methods
    subscribeTicker(id: string, symbol: string, callback: WSCallback) {
        this.getExchange(id).subscribeTicker(symbol, callback);
    }

    async subscribeAllMiniTickers(id: string, callback: WSCallback) {
        return this.getExchange(id).subscribeAllMiniTickers(callback);
    }
}
