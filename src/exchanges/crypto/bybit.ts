import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

export class Bybit extends BaseExchange {
    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '');
        const interval = this.normalizeTimeframe(timeframe);
        const maxLimit = 1000;

        let requestedLimit = params.limit || 200;
        let limitRemaining = requestedLimit;
        let allCandles: OHLCV[] = [];
        let currentEndTime = params.endTime || undefined;

        while (limitRemaining > 0) {
            const fetchLimit = Math.min(limitRemaining, maxLimit);
            // Bybit V5 API: /v5/market/kline
            const response = await this.restClient.get<any>('/v5/market/kline', {
                category: 'linear',
                symbol: marketSymbol,
                interval,
                limit: fetchLimit,
                end: currentEndTime,
                ...params
            });

            if (!response.result || response.result.list.length === 0) break;

            const list = response.result.list;
            const rawOldestTimestamp = parseInt(list[list.length - 1][0]);

            const candles = list.map((k: any) => Normalizer.normalizeOHLCV(
                parseInt(k[0]), parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4]), parseFloat(k[5])
            )).reverse(); // Bybit returns descending, we want ascending

            allCandles = [...candles, ...allCandles];

            if (list.length < fetchLimit) break;

            limitRemaining -= list.length;
            currentEndTime = rawOldestTimestamp - 1;

            if (allCandles.length >= requestedLimit) break;
        }

        return allCandles.slice(-requestedLimit);
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        const response = await this.restClient.get<any>('/v5/market/instruments-info', {
            category: 'linear'
        });
        return {
            id: this.config.id,
            name: this.config.name,
            symbols: response.result.list.map((s: any) => s.symbol),
            timeframes: Object.keys(this.config.timeframeMap),
            markets: response.result.list
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '');
        const response = await this.restClient.get<any>('/v5/market/tickers', {
            category: 'linear',
            symbol: marketSymbol,
            ...params
        });

        const t = response.result.list[0];
        return Normalizer.normalizeTicker(symbol, Date.now(), {
            high: parseFloat(t.highPrice24h),
            low: parseFloat(t.lowPrice24h),
            last: parseFloat(t.lastPrice),
            close: parseFloat(t.lastPrice),
            open: parseFloat(t.prevPrice24h),
            baseVolume: parseFloat(t.volume24h),
            quoteVolume: parseFloat(t.turnover24h)
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        const response = await this.restClient.get<any>('/v5/market/tickers', {
            category: 'linear',
            ...params
        });
        return response.result.list.map((t: any) => {
            return Normalizer.normalizeTicker(t.symbol, Date.now(), {
                high: parseFloat(t.highPrice24h),
                low: parseFloat(t.lowPrice24h),
                last: parseFloat(t.lastPrice),
                close: parseFloat(t.lastPrice),
                open: parseFloat(t.prevPrice24h),
                baseVolume: parseFloat(t.volume24h)
            });
        });
    }

    // WebSocket
    async subscribeAllMiniTickers(callback: WSCallback): Promise<void> {
        if (!this.wsClient) return;

        // Bybit needs subscription per symbol topic: tickers.BTCUSDT
        // First fetch all symbols
        const info = await this.fetchExchangeInfo();
        const symbols = info.symbols;

        // Bybit allows max 10 symbols per subscription item in some cases, but topics are safer
        // We can subscribe in batches if needed, but let's try the full list
        const topics = symbols.map(s => `tickers.${s}`);

        // Send subscription in batches of 10 to be safe with Bybit limits
        for (let i = 0; i < topics.length; i += 10) {
            const batch = topics.slice(i, i + 10);
            this.wsClient.send({
                op: 'subscribe',
                args: batch
            });
        }

        this.wsClient.on('message', (msg: any) => {
            if (msg.topic && msg.topic.startsWith('tickers.')) {
                const symbol = msg.topic.split('.')[1];
                const data = msg.data;
                callback({
                    exchange: 'BYBIT_FUTURE',
                    symbol,
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(msg.ts),
                    data: data
                });
            }
        });
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        if (!this.wsClient) return;
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '');
        this.wsClient.send({
            op: 'subscribe',
            args: [`tickers.${marketSymbol}`]
        });
        this.wsClient.on('message', (msg: any) => {
            if (msg.topic === `tickers.${marketSymbol}`) {
                callback({
                    exchange: 'BYBIT_FUTURE',
                    symbol,
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(msg.ts),
                    data: msg.data
                });
            }
        });
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
        // klines.<interval>.<symbol>
    }

    unsubscribe(channel: string): void {
        if (this.wsClient) {
            this.wsClient.send({ op: 'unsubscribe', args: [channel] });
        }
    }
}
