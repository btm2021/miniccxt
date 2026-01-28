import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

/**
 * Binance Futures (USDⓈ-M) implementation
 */
export class Binance extends BaseExchange {
    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const marketSymbol = this.normalizeSymbol(symbol);
        const interval = this.normalizeTimeframe(timeframe);
        const maxLimit = 1500;
        let requestedLimit = params.limit || 500;
        let limitRemaining = requestedLimit;
        let allCandles: OHLCV[] = [];
        let currentEndTime = params.endTime || undefined;

        while (limitRemaining > 0) {
            const fetchLimit = Math.min(limitRemaining, maxLimit);
            const { limit: _limit, endTime: _endTime, ...restParams } = params;
            const response = await this.restClient.get<any[]>('/fapi/v1/klines', {
                ...restParams,
                symbol: marketSymbol,
                interval,
                limit: fetchLimit,
                endTime: currentEndTime,
            });

            if (response.length === 0) break;

            // Extract raw data before normalization for pagination logic
            const rawOldestTimestamp = response[0][0];

            const candles = response.map(k => Normalizer.normalizeOHLCV(
                k[0], parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4]), parseFloat(k[5])
            ));

            // Append/Prepend logic: Binance returns ascending (oldest first)
            // Since we use endTime, we are fetching "backwards" in terms of batches
            allCandles = [...candles, ...allCandles];

            if (response.length < fetchLimit) break;

            limitRemaining -= response.length;
            currentEndTime = rawOldestTimestamp - 1;

            if (allCandles.length >= requestedLimit) break;
        }

        return allCandles.slice(-requestedLimit);
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        // Binance Futures endpoint: /fapi/v1/exchangeInfo
        const response = await this.restClient.get<any>('/fapi/v1/exchangeInfo');

        // Filter for USDT pairs and PERPETUAL contracts
        const filteredSymbols = response.symbols.filter((s: any) =>
            s.quoteAsset === 'USDT' && s.contractType === 'PERPETUAL' && s.status === 'TRADING'
        );

        const markets = filteredSymbols.map((s: any) => {
            const std = this.standardizeSymbol(`${s.baseAsset}/${s.quoteAsset}`);
            this.rawToStandard.set(s.symbol, std);
            this.standardToRaw.set(std, s.symbol);

            const priceFilter = s.filters.find((f: any) => f.filterType === 'PRICE_FILTER');
            const lotSize = s.filters.find((f: any) => f.filterType === 'LOT_SIZE');
            const tickSize = priceFilter ? priceFilter.tickSize : '0.01';
            const { minMove, priceScale } = this.calculateTVPrecision(tickSize);

            return {
                symbol: std,
                id: s.symbol,
                base: s.baseAsset,
                quote: s.quoteAsset,
                active: s.status === 'TRADING',
                precision: {
                    price: s.pricePrecision,
                    amount: s.quantityPrecision
                },
                limits: {
                    amount: {
                        min: lotSize ? parseFloat(lotSize.minQty) : 0,
                        max: lotSize ? parseFloat(lotSize.maxQty) : 0
                    },
                    price: {
                        min: priceFilter ? parseFloat(priceFilter.minPrice) : 0,
                        max: priceFilter ? parseFloat(priceFilter.maxPrice) : 0
                    },
                    cost: { min: 0, max: 0 }
                },
                minMove,
                priceScale,
                info: s
            };
        });

        this.setMarkets(markets);

        return {
            id: this.config.id,
            name: this.config.name,
            symbols: markets.map((m: any) => m.symbol),
            timeframes: Object.keys(this.config.timeframeMap),
            markets
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const marketSymbol = this.normalizeSymbol(symbol);
        // Binance Futures endpoint: /fapi/v1/ticker/24hr
        const response = await this.restClient.get<any>('/fapi/v1/ticker/24hr', {
            symbol: marketSymbol,
            ...params
        });

        return Normalizer.normalizeTicker(symbol, response.closeTime, {
            high: parseFloat(response.highPrice),
            low: parseFloat(response.lowPrice),
            last: parseFloat(response.lastPrice),
            close: parseFloat(response.lastPrice),
            open: parseFloat(response.openPrice),
            baseVolume: parseFloat(response.volume),
            quoteVolume: parseFloat(response.quoteVolume),
            change: parseFloat(response.priceChange),
            percentage: parseFloat(response.priceChangePercent)
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        // Binance Futures endpoint: /fapi/v1/ticker/24hr
        const response = await this.restClient.get<any[]>('/fapi/v1/ticker/24hr', params);
        return response.map(t => {
            return Normalizer.normalizeTicker(t.symbol, t.closeTime, {
                high: parseFloat(t.highPrice),
                low: parseFloat(t.lowPrice),
                last: parseFloat(t.lastPrice),
                close: parseFloat(t.lastPrice),
                open: parseFloat(t.openPrice),
                baseVolume: parseFloat(t.volume)
            });
        });
    }

    // WebSocket Strategy
    subscribeAllMiniTickers(callback: WSCallback): void {
        if (!this.wsClient) return;

        // Binance Futures: !ticker@arr stream (All Tickers)
        this.wsClient.on('message', (msg: any) => {
            // For !ticker@arr, msg is an array of ticker objects
            if (Array.isArray(msg)) {
                msg.forEach(item => {
                    // Event type for !ticker@arr is '24hrTicker'
                    if (item.e === '24hrTicker') {
                        callback({
                            exchange: 'BINANCE_FUTURE',
                            symbol: this.rawToStandard.get(item.s) || this.standardizeSymbol(item.s),
                            type: 'ticker',
                            timestamp: this.normalizeTimestamp(item.E),
                            data: item
                        });
                    }
                });
            }
        });
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        if (!this.wsClient) return;
        const marketSymbol = symbol.toLowerCase().replace('/', '');
        this.wsClient.on('message', (msg: any) => {
            if (msg.e === '24hrTicker' && msg.s.toLowerCase() === marketSymbol) {
                callback({
                    exchange: 'BINANCE_FUTURE',
                    symbol: this.rawToStandard.get(msg.s) || this.standardizeSymbol(symbol),
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(msg.E),
                    data: msg
                });
            }
        });
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
        if (!this.wsClient) return;
    }

    unsubscribe(channel: string): void {
        if (!this.wsClient) return;
    }
}
