import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker, Market } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

export class Oanda extends BaseExchange {
    private accountId: string;
    private apiKey: string;
    private streamUrl: string;

    private oandaSymbols = [
        'XAU_USD', 'XAU_EUR', 'XAU_AUD', 'XAU_CAD', 'XAU_CHF', 'XAU_NZD', 'XAU_GBP', 'XAU_JPY',
        'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD', 'USD_CAD', 'NZD_USD',
        'EUR_GBP', 'EUR_JPY', 'GBP_JPY', 'EUR_CHF', 'AUD_JPY', 'GBP_CHF', 'EUR_AUD',
        'EUR_CAD', 'GBP_CAD', 'AUD_CAD', 'AUD_NZD', 'CAD_JPY', 'CHF_JPY', 'NZD_JPY',
        'GBP_AUD', 'GBP_NZD', 'EUR_NZD', 'AUD_CHF', 'NZD_CHF', 'CAD_CHF', 'NZD_CAD'
    ];

    constructor(config: any) {
        super(config);
        this.accountId = config.accountId || '101-004-27015242-001'; // Default demo
        this.apiKey = config.apiKey || '7a53c4eeff879ba6118ddc416c2d2085-4a766a7d07af7bd629c07b451fe92984';
        this.streamUrl = config.wsUrl || 'https://stream-fxpractice.oanda.com/v3';
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const oandaSymbol = this.normalizeSymbol(symbol).replace('/', '_');
        const granularity = this.normalizeTimeframe(timeframe);

        const count = params.limit || 500;
        let url = `instruments/${oandaSymbol}/candles?granularity=${granularity}&count=${count}&price=M`;

        if (params.to) {
            const toISO = new Date(params.to).toISOString();
            url += `&to=${toISO}`;
        }

        const response = await this.restClient.get<any>(url, {}, { headers: this.getHeaders() });

        if (!response.candles) return [];

        let bars = response.candles.map((candle: any) => Normalizer.normalizeOHLCV(
            new Date(candle.time).getTime(),
            parseFloat(candle.mid.o),
            parseFloat(candle.mid.h),
            parseFloat(candle.mid.l),
            parseFloat(candle.mid.c),
            parseFloat(candle.volume)
        ));

        // Fill Gaps logic for Forex (weekends/holidays)
        if (['D', 'W', 'M'].includes(granularity) || params.fillGaps) {
            bars = this.fillGaps(bars);
        }

        return bars;
    }

    private isWeekend(timestamp: number): boolean {
        const date = new Date(timestamp);
        const day = date.getUTCDay();
        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    }

    private fillGaps(bars: OHLCV[]): OHLCV[] {
        if (bars.length < 2) return bars;

        const filledBars: OHLCV[] = [];
        const barInterval = bars[1].timestamp - bars[0].timestamp;

        for (let i = 0; i < bars.length; i++) {
            filledBars.push(bars[i]);

            if (i < bars.length - 1) {
                const currentTime = bars[i].timestamp;
                const nextTime = bars[i + 1].timestamp;
                const gap = nextTime - currentTime;

                if (gap > barInterval * 1.5) {
                    const lastClose = bars[i].close;
                    let fillTime = currentTime + barInterval;

                    while (fillTime < nextTime) {
                        if (!this.isWeekend(fillTime)) {
                            filledBars.push({
                                timestamp: fillTime,
                                open: lastClose,
                                high: lastClose,
                                low: lastClose,
                                close: lastClose,
                                volume: 0
                            });
                        }
                        fillTime += barInterval;
                    }
                }
            }
        }

        return filledBars;
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        const markets: Market[] = this.oandaSymbols.map(id => {
            const parts = id.split('_');
            const base = parts[0];
            const quote = parts[1];
            const std = this.standardizeSymbol(`${base}/${quote}`);

            this.rawToStandard.set(id, std);
            this.standardToRaw.set(std, id);

            // Forex precision
            let tickSize = 0.00001;
            if (quote === 'JPY') tickSize = 0.001;
            if (base === 'XAU') tickSize = 0.01;

            const { minMove, priceScale, precision } = this.calculateTVPrecision(tickSize);

            return {
                symbol: std,
                id: id,
                base: base,
                quote: quote,
                active: true,
                precision: {
                    price: precision,
                    amount: 0
                },
                limits: {
                    amount: { min: 0, max: 0 },
                    price: { min: 0, max: 0 },
                    cost: { min: 0, max: 0 }
                },
                minMove,
                priceScale,
                info: { id }
            };
        });

        this.setMarkets(markets);

        return {
            id: this.config.id,
            name: this.config.name,
            symbols: markets.map(m => m.symbol),
            timeframes: Object.keys(this.config.timeframeMap),
            markets
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const oandaSymbol = this.normalizeSymbol(symbol).replace('/', '_');
        const url = `accounts/${this.accountId}/pricing?instruments=${oandaSymbol}`;

        const response = await this.restClient.get<any>(url, {}, { headers: this.getHeaders() });
        const price = response.prices[0];

        const bid = parseFloat(price.bids[0].price);
        const ask = parseFloat(price.asks[0].price);
        const mid = (bid + ask) / 2;

        return Normalizer.normalizeTicker(symbol, new Date(price.time).getTime(), {
            last: mid,
            close: mid,
            bid: bid,
            ask: ask,
            high: mid,
            low: mid,
            open: mid,
            baseVolume: 0
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        const instruments = symbols ?
            symbols.map(s => this.normalizeSymbol(s).replace('/', '_')).join(',') :
            this.oandaSymbols.join(',');

        const url = `accounts/${this.accountId}/pricing?instruments=${instruments}`;
        const response = await this.restClient.get<any>(url, {}, { headers: this.getHeaders() });

        return response.prices.map((price: any) => {
            const bid = parseFloat(price.bids[0].price);
            const ask = parseFloat(price.asks[0].price);
            const mid = (bid + ask) / 2;
            const stdSym = this.rawToStandard.get(price.instrument) || this.standardizeSymbol(price.instrument.replace('_', '/'));

            return Normalizer.normalizeTicker(stdSym, new Date(price.time).getTime(), {
                last: mid,
                close: mid,
                bid: bid,
                ask: ask,
                baseVolume: 0
            });
        });
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        const oandaSymbol = this.normalizeSymbol(symbol).replace('/', '_');
        const streamUrl = `${this.streamUrl}/accounts/${this.accountId}/pricing/stream?instruments=${oandaSymbol}`;

        // OANDA uses HTTP Stream, not standard WebSocket
        // For simplicity in this library, we'll use fetch with ReadableStream
        this.startHttpStream(streamUrl, (data: any) => {
            if (data.type === 'PRICE') {
                const bid = parseFloat(data.bids[0].price);
                const ask = parseFloat(data.asks[0].price);
                const mid = (bid + ask) / 2;

                callback({
                    exchange: 'OANDA',
                    symbol: this.rawToStandard.get(data.instrument) || this.standardizeSymbol(symbol),
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(new Date(data.time).getTime()),
                    data: {
                        ...data,
                        last: mid,
                        bid,
                        ask
                    }
                });
            }
        });
    }

    private async startHttpStream(url: string, onData: (data: any) => void) {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            onData(data);
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error('Oanda Stream Error:', error);
            // Auto-reconnect
            setTimeout(() => this.startHttpStream(url, onData), 5000);
        }
    }

    subscribeAllMiniTickers(callback: WSCallback): void {
        // Oanda doesn't have "all tickers" in one stream easily without listing all instruments
        const instruments = this.oandaSymbols.join(',');
        const streamUrl = `${this.streamUrl}/accounts/${this.accountId}/pricing/stream?instruments=${instruments}`;
        this.startHttpStream(streamUrl, (data: any) => {
            if (data.type === 'PRICE') {
                const bid = parseFloat(data.bids[0].price);
                const ask = parseFloat(data.asks[0].price);
                const mid = (bid + ask) / 2;

                callback({
                    exchange: 'OANDA',
                    symbol: this.rawToStandard.get(data.instrument) || this.standardizeSymbol(data.instrument.replace('_', '/')),
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(new Date(data.time).getTime()),
                    data: {
                        ...data,
                        last: mid,
                        bid,
                        ask
                    }
                });
            }
        });
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
        // Oanda HTTP Stream doesn't support OHLCV natively, would need bundling logic
    }

    unsubscribe(channel: string): void {
        // HTTP Stream needs AbortController to unsubscribe, not yet implemented here
    }
}
