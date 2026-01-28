import { OHLCV, Ticker } from '../types/market';
import { toUTC7 } from '../utils/timestamp';

export class Normalizer {
    static normalizeOHLCV(timestamp: number, open: number, high: number, low: number, close: number, volume: number): OHLCV {
        return {
            timestamp: toUTC7(timestamp),
            open,
            high,
            low,
            close,
            volume
        };
    }

    static normalizeTicker(symbol: string, timestamp: number, data: any): Ticker {
        return {
            symbol,
            timestamp: toUTC7(timestamp),
            datetime: new Date(toUTC7(timestamp)).toISOString(),
            high: data.high || null,
            low: data.low || null,
            bid: data.bid || null,
            ask: data.ask || null,
            last: data.last || null,
            close: data.close || null,
            open: data.open || null,
            baseVolume: data.baseVolume || null,
            quoteVolume: data.quoteVolume || null,
            change: data.change || null,
            percentage: data.percentage || null,
            average: data.average || null,
        };
    }
}
