import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

export class OKX extends BaseExchange {
    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '-');
        const interval = this.normalizeTimeframe(timeframe);
        const maxLimit = 100; // OKX limit per request

        let requestedLimit = params.limit || 100;
        let limitRemaining = requestedLimit;
        let allCandles: OHLCV[] = [];
        let currentAfter = params.after || undefined; // OKX uses "after" for pagination (timestamp)

        while (limitRemaining > 0) {
            const fetchLimit = Math.min(limitRemaining, maxLimit);
            const response = await this.restClient.get<any>('/api/v5/market/history-candles', {
                instId: marketSymbol,
                bar: interval,
                limit: fetchLimit,
                after: currentAfter,
                ...params
            });

            if (!response.data || response.data.length === 0) break;

            const data = response.data;
            const rawOldestTimestamp = parseInt(data[data.length - 1][0]);

            const candles = data.map((k: any) => Normalizer.normalizeOHLCV(
                parseInt(k[0]), parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4]), parseFloat(k[5])
            )).reverse(); // OKX returns descending

            allCandles = [...candles, ...allCandles];

            if (data.length < fetchLimit) break;

            limitRemaining -= data.length;
            currentAfter = rawOldestTimestamp; // Previous batch end

            if (allCandles.length >= requestedLimit) break;
        }

        return allCandles.slice(-requestedLimit);
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        const response = await this.restClient.get<any>('/api/v5/public/instruments', {
            instType: 'SWAP' // Perpetual
        });
        return {
            id: this.config.id,
            name: this.config.name,
            symbols: response.data.map((s: any) => s.instId),
            timeframes: Object.keys(this.config.timeframeMap),
            markets: response.data
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '-');
        const response = await this.restClient.get<any>('/api/v5/market/ticker', {
            instId: marketSymbol,
            ...params
        });

        const t = response.data[0];
        return Normalizer.normalizeTicker(symbol, parseInt(t.ts), {
            high: parseFloat(t.high24h),
            low: parseFloat(t.low24h),
            last: parseFloat(t.last),
            close: parseFloat(t.last),
            open: parseFloat(t.open24h),
            baseVolume: parseFloat(t.vol24h),
            quoteVolume: parseFloat(t.volCcy24h)
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        const response = await this.restClient.get<any>('/api/v5/market/tickers', {
            instType: 'SWAP',
            ...params
        });
        return response.data.map((t: any) => {
            return Normalizer.normalizeTicker(t.instId, parseInt(t.ts), {
                high: parseFloat(t.high24h),
                low: parseFloat(t.low24h),
                last: parseFloat(t.last),
                close: parseFloat(t.last),
                open: parseFloat(t.open24h),
                baseVolume: parseFloat(t.vol24h)
            });
        });
    }

    // WebSocket
    async subscribeAllMiniTickers(callback: WSCallback): Promise<void> {
        if (!this.wsClient) return;

        // OKX needs subscription per instId in tickers channel
        const info = await this.fetchExchangeInfo();
        const instIds = info.symbols;

        // OKX has limit of 3000 subscriptions per connection, but 20-30 args per msg is better
        for (let i = 0; i < instIds.length; i += 20) {
            const batch = instIds.slice(i, i + 20).map(id => ({
                channel: 'tickers',
                instId: id
            }));

            this.wsClient.send({
                op: 'subscribe',
                args: batch
            });
        }

        this.wsClient.on('message', (msg: any) => {
            if (msg.arg && msg.arg.channel === 'tickers' && msg.data) {
                msg.data.forEach((t: any) => {
                    callback({
                        exchange: 'OKX_FUTURE',
                        symbol: t.instId,
                        type: 'ticker',
                        timestamp: this.normalizeTimestamp(parseInt(t.ts)),
                        data: t
                    });
                });
            }
        });
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        if (!this.wsClient) return;
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '-');
        this.wsClient.send({
            op: 'subscribe',
            args: [{ channel: 'tickers', instId: marketSymbol }]
        });
        this.wsClient.on('message', (msg: any) => {
            if (msg.arg && msg.arg.channel === 'tickers' && msg.arg.instId === marketSymbol && msg.data) {
                msg.data.forEach((t: any) => {
                    callback({
                        exchange: 'OKX_FUTURE',
                        symbol,
                        type: 'ticker',
                        timestamp: this.normalizeTimestamp(parseInt(t.ts)),
                        data: t
                    });
                });
            }
        });
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
    }

    unsubscribe(channel: string): void {
        if (this.wsClient) {
            // Logic for OKX unsubscribe
        }
    }
}
