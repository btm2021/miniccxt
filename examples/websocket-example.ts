import { MiniCCXT } from '../src/index';

async function run() {
    const ccxt = new MiniCCXT();

    // Setup Binance
    const binance = ccxt.addExchange({
        id: 'binance',
        name: 'Binance',
        type: 'crypto',
        restUrl: 'https://fapi.binance.com',
        wsUrl: 'wss://fstream.binance.com/ws',
        logo: '',
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        },
        timeframeMap: { '1m': '1m' }
    });

    // Connect manually for this example as we don't have auto-connect in constructor
    // In a real app, MiniCCXT might manage connections
    const wsClient = (binance as any).wsClient;
    if (wsClient) {
        await wsClient.connect();

        console.log('Subscribing to All Mini Tickers...');
        ccxt.subscribeAllMiniTickers('binance', (data) => {
            console.log(`[WS] ${data.exchange} | ${data.symbol} | Price: ${data.data.c} | Time: ${new Date(data.timestamp).toLocaleTimeString()}`);
        });

        // Send subscription message if required by Binance
        // For !ticker@arr, we just need to be connected to the right stream
        // or send method like:
        wsClient.send({
            method: "SUBSCRIBE",
            params: ["!ticker@arr"],
            id: 1
        });
    }
}

run();
