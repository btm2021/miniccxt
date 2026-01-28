import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

export class Oanda extends BaseExchange {
    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '_');
        const granularity = this.normalizeTimeframe(timeframe);
        const maxLimit = 5000;

        let requestedLimit = params.count || 100;
        let limitRemaining = requestedLimit;
        let allCandles: OHLCV[] = [];
        let currentTo = params.to || undefined;

        while (limitRemaining > 0) {
            const fetchLimit = Math.min(limitRemaining, maxLimit);
            const { count: _count, to: _to, ...restParams } = params;
            const response = await this.restClient.get<any>(`/v3/instruments/${marketSymbol}/candles`, {
                ...restParams,
                granularity,
                count: fetchLimit,
                to: currentTo,
            });

            if (!response.candles || response.candles.length === 0) break;

            // Oldest candle in the response
            const rawOldestTime = response.candles[0].time;

            const candles = response.candles.map((c: any) => Normalizer.normalizeOHLCV(
                new Date(c.time).getTime(),
                parseFloat(c.mid.o),
                parseFloat(c.mid.h),
                parseFloat(c.mid.l),
                parseFloat(c.mid.c),
                parseFloat(c.volume)
            ));

            allCandles = [...candles, ...allCandles];

            if (response.candles.length < fetchLimit) break;

            limitRemaining -= response.candles.length;
            // Subtract 1 second from oldest candle time to get next batch
            const nextTo = new Date(new Date(rawOldestTime).getTime() - 1000).toISOString();
            currentTo = nextTo;

            if (allCandles.length >= requestedLimit) break;
        }

        return allCandles.slice(-requestedLimit);
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        return {
            id: this.config.id,
            name: this.config.name,
            symbols: this.config.staticSymbols || [],
            timeframes: Object.keys(this.config.timeframeMap),
            markets: []
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '_');
        const response = await this.restClient.get<any>(`/v3/accounts/${this.config.apiKey}/pricing`, {
            instruments: marketSymbol,
            ...params
        });

        const price = response.prices[0];
        const ts = new Date(price.time).getTime();

        return Normalizer.normalizeTicker(symbol, ts, {
            bid: parseFloat(price.bids[0].price),
            ask: parseFloat(price.asks[0].price),
            last: (parseFloat(price.bids[0].price) + parseFloat(price.asks[0].price)) / 2
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        const syms = symbols || this.config.staticSymbols || [];
        const instruments = syms.map(s => this.normalizeSymbol(s).replace('/', '_')).join(',');

        const response = await this.restClient.get<any>(`/v3/accounts/${this.config.apiKey}/pricing`, {
            instruments,
            ...params
        });

        return response.prices.map((price: any) => {
            const ts = new Date(price.time).getTime();
            return Normalizer.normalizeTicker(price.instrument, ts, {
                bid: parseFloat(price.bids[0].price),
                ask: parseFloat(price.asks[0].price),
                last: (parseFloat(price.bids[0].price) + parseFloat(price.asks[0].price)) / 2
            });
        });
    }

    // WebSocket Strategy
    subscribeAllMiniTickers(callback: WSCallback): void {
        if (!this.wsClient) {
            this.fallbackPolling(callback);
            return;
        }

        // OANDA: Cần list symbols từ staticSymbols
        const symbols = this.config.staticSymbols || [];
        symbols.forEach(symbol => {
            // Logic để subscribe từng symbol qua WS
            // this.wsClient.send({ type: 'subscribe', symbol: `price/${symbol}` });
        });

        this.wsClient.on('message', (msg: any) => {
            // Logic to handle OANDA price messages and map to callback
        });
    }

    private fallbackPolling(callback: WSCallback) {
        const symbols = this.config.staticSymbols || [];
        setInterval(async () => {
            try {
                const tickers = await this.fetchTickers(symbols);
                tickers.forEach(t => {
                    callback({
                        exchange: this.config.id,
                        symbol: t.symbol,
                        type: 'ticker',
                        timestamp: t.timestamp,
                        data: t
                    });
                });
            } catch (e) { }
        }, 5000);
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        if (!this.wsClient) {
            // fallback
            return;
        }
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
    }

    unsubscribe(channel: string): void {
    }
}
