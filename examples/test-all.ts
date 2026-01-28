import { MiniCCXT } from '../src/index';

async function testSmartFetch() {
    const ccxt = new MiniCCXT();

    console.log('--- Testing Mini-CCXT Smart Fetch ---');

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
        timeframeMap: {
            '1h': '1h',
            '1m': '1m'
        }
    });

    try {
        // Test Smart Fetch for Binance (Limit 2000 > 1500)
        console.log('\n[TEST] Fetching 2000 candles from Binance (should trigger 2 batches)...');
        const start = Date.now();
        const ohlcv = await ccxt.fetchOHLCV('binance', 'BTC/USDT', '1h', { limit: 2000 });
        const end = Date.now();

        console.log(`[SUCCESS] Received ${ohlcv.length} candles in ${end - start}ms.`);
        if (ohlcv.length > 0) {
            console.log(`First candle TS: ${new Date(ohlcv[0].timestamp - 7 * 3600 * 1000).toISOString()} (UTC)`); // Adjusting back for display
            console.log(`Last candle TS:  ${new Date(ohlcv[ohlcv.length - 1].timestamp - 7 * 3600 * 1000).toISOString()} (UTC)`);
        }

        // Test WebSocket All Tickers
        console.log('\n[TEST] Testing WebSocket !ticker@arr (Waiting 5 seconds for messages)...');
        let tickerCount = 0;

        // Manual connect for testing
        const binance = ccxt.getExchange('binance');
        const ws = (binance as any).wsClient;

        if (ws) {
            await ws.connect();

            ccxt.subscribeAllMiniTickers('binance', (msg) => {
                tickerCount++;
                if (tickerCount % 50 === 0) {
                    console.log(`[WS] Received ${tickerCount} tickers... Last: ${msg.symbol} at ${msg.data.c}`);
                }
            });

            ws.send({
                method: "SUBSCRIBE",
                params: ["!ticker@arr"],
                id: 1
            });

            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log(`[SUCCESS] Total tickers received in 5s: ${tickerCount}`);
            ws.close();
        }

    } catch (error) {
        console.error('[ERROR] Test failed:', error);
    }
}

testSmartFetch();
