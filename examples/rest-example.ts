import { MiniCCXT } from '../src/index';

async function run() {
    const ccxt = new MiniCCXT();

    // 1. Setup Binance
    ccxt.addExchange({
        id: 'binance',
        name: 'Binance',
        type: 'crypto',
        restUrl: 'https://fapi.binance.com',
        wsUrl: 'wss://fstream.binance.com/ws',
        logo: 'https://binance.com/logo.svg',
        capabilities: {
            rest: { fetchOHLCV: true, fetchTickers: true, fetchExchangeInfo: true },
            websocket: { ticker: true, ohlcv: true, allMiniTickers: true }
        },
        timeframeMap: {
            '1m': '1m',
            '5m': '5m',
            '1h': '1h',
            '1d': '1d'
        }
    });

    try {
        console.log('Fetching OHLCV from Binance...');
        const ohlcv = await ccxt.fetchOHLCV('binance', 'BTC/USDT', '1h');
        console.log(`Received ${ohlcv.length} candles. Last candle:`, ohlcv[ohlcv.length - 1]);

        console.log('\nFetching Ticker from Binance...');
        const ticker = await ccxt.fetchTicker('binance', 'ETH/USDT');
        console.log('Ticker:', ticker);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
