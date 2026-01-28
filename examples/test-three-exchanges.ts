import { MiniCCXT } from '../src/index';

async function testExchanges() {
    const ccxt = new MiniCCXT();

    console.log('--- Testing Mini-CCXT Multi-Exchange (Binance, Bybit, OKX) ---');

    // 1. Setup Binance Futures
    ccxt.addExchange({
        id: 'binance',
        name: 'Binance Futures',
        type: 'crypto',
        restUrl: 'https://fapi.binance.com',
        wsUrl: 'wss://fstream.binance.com/ws',
        logo: '',
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        },
        timeframeMap: { '1m': '1m', '1h': '1h' }
    });

    // 2. Setup Bybit Perpetual
    ccxt.addExchange({
        id: 'bybit',
        name: 'Bybit Perpetual',
        type: 'crypto',
        restUrl: 'https://api.bybit.com',
        wsUrl: 'wss://stream.bybit.com/v5/public/linear',
        logo: '',
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        },
        timeframeMap: { '1m': '1', '1h': '60' }
    });

    // 3. Setup OKX Perpetual
    ccxt.addExchange({
        id: 'okx',
        name: 'OKX Perpetual',
        type: 'crypto',
        restUrl: 'https://www.okx.com',
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        logo: '',
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        },
        timeframeMap: { '1m': '1m', '1h': '1H' }
    });

    const exchanges = ['binance', 'bybit', 'okx'];
    const testSymbol = 'BTC/USDT';

    for (const exchangeId of exchanges) {
        console.log(`\n--- Testing REST for ${exchangeId.toUpperCase()} ---`);
        try {
            // Test fetchOHLCV
            const ohlcv = await ccxt.fetchOHLCV(exchangeId, testSymbol, '1h', { limit: 5 });
            console.log(`[${exchangeId}] Last ${ohlcv.length} candles received. Last Close: ${ohlcv[ohlcv.length - 1].close}`);

            // Test fetchTicker
            const ticker = await ccxt.fetchTicker(exchangeId, testSymbol);
            console.log(`[${exchangeId}] Last Price: ${ticker.last}`);
        } catch (error: any) {
            console.error(`[${exchangeId}] REST Error:`, error.message);
        }
    }

    console.log('\n--- Testing WEBSOCKET All Tickers (30 seconds total) ---');

    const runWSTest = async (exchangeId: string, durationMs: number) => {
        console.log(`\n[${exchangeId.toUpperCase()}] Starting WebSocket...`);
        let count = 0;
        const exchange = ccxt.getExchange(exchangeId);
        const ws = (exchange as any).wsClient;

        if (ws) {
            await ws.connect();

            ccxt.subscribeAllMiniTickers(exchangeId, (msg) => {
                count++;
                if (count % 100 === 0) {
                    console.log(`[WS] ${msg.exchange}:${msg.symbol} -> ${msg.data.c || msg.data.lastPrice || msg.data.last}`);
                }
            });

            // Subscription messages
            if (exchangeId === 'binance') {
                ws.send({ method: "SUBSCRIBE", params: ["!ticker@arr"], id: 1 });
            }
            // Bybit and OKX handle subscription inside subscribeAllMiniTickers

            await new Promise(resolve => setTimeout(resolve, durationMs));
            console.log(`[${exchangeId.toUpperCase()}] Total updates received in ${durationMs / 1000}s: ${count}`);
            ws.close();
        }
    };

    // Run sequentially to see output clearly
    for (const exId of exchanges) {
        await runWSTest(exId, 10000); // 10s per exchange
    }

    console.log('\n--- Multi-Exchange Test Completed ---');
}

testExchanges().catch(console.error);
