export function normalizeSymbol(symbol: string): string {
    // Standard format is ASSET/QUOTE (e.g., BTC/USDT)
    return symbol.toUpperCase().replace('-', '/').replace('_', '/');
}

export function splitSymbol(symbol: string): [string, string] {
    const parts = normalizeSymbol(symbol).split('/');
    if (parts.length !== 2) {
        throw new Error(`Invalid symbol format: ${symbol}`);
    }
    return [parts[0], parts[1]];
}
