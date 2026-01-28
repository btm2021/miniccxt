(function () {
    const ccxt = new MiniCCXT.MiniCCXT();
    const grid = document.getElementById('exchange-grid');

    // Display info in console for the USER
    console.log('--- MiniCCXT System Info ---');
    console.log(ccxt.info());

    // Simplified Exchange IDs supported by the library default configs
    const SUPPORTED_EXCHANGE_IDS = ['BINANCE_FUTURE', 'BYBIT_FUTURE', 'OKX_FUTURE', 'OANDA'];

    const exchangeData = {};

    async function initExchange(exchangeTag) {
        // 1. Setup MiniCCXT Exchange using standardized ID
        const exchange = await ccxt.addExchange(exchangeTag);
        const meta = exchange.getInfo(); // Get metadata (name, logo, shortName, description)

        // 2. Create UI Elements
        const card = document.createElement('div');
        card.className = 'exchange-card';
        card.innerHTML = `
            <div class="card-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${meta.logo}" width="28" height="28" style="background: #fff; border-radius: 6px; padding: 2px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h2 style="margin:0">${meta.name}</h2>
                            <span style="font-size: 0.7rem; background: var(--accent); color: #000; padding: 1px 6px; border-radius: 4px; font-weight: 600;">${meta.shortName}</span>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">${meta.description}</p>
                    </div>
                </div>
                <span class="symbol-count" id="count-${meta.id}">Loading symbols...</span>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Unified Symbol</th>
                            <th style="text-align: right">Price</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-${meta.id}"></tbody>
                </table>
            </div>
        `;
        grid.appendChild(card);

        const tbody = document.getElementById(`tbody-${meta.id}`);
        const countSpan = document.getElementById(`count-${meta.id}`);

        exchangeData[meta.id] = {
            cells: {}, // Standardized Symbol -> priceElement
            prevPrices: {}
        };

        try {
            // 3. Fetch Symbols
            const info = await ccxt.fetchExchangeInfo(meta.id);
            const symbols = info.symbols || [];
            countSpan.innerText = `${symbols.length} Symbols`;

            // 4. Render Table Rows for symbols
            if (symbols.length > 0) {
                const firstSym = symbols[0];
                const symInfo = exchange.getInfoSymbol(firstSym);
                console.log(`[${meta.name}] Sample Symbol Info (${firstSym}):`, symInfo);
            }

            symbols.forEach(standardizedSymbol => {
                const row = document.createElement('tr');

                // Use a safe ID for the price cell (avoiding btoa and special characters)
                const safeId = standardizedSymbol.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const cellId = `cell-${meta.id}-${safeId}`;

                row.innerHTML = `
                    <td class="symbol-cell" style="font-size: 0.8rem; color: var(--accent)">${standardizedSymbol}</td>
                    <td class="price-cell" id="${cellId}">-</td>
                `;
                tbody.appendChild(row);

                exchangeData[meta.id].cells[standardizedSymbol] = document.getElementById(cellId);
            });

            // 5. Connect WebSocket (if available)
            if (exchange.wsClient) {
                try {
                    await exchange.wsClient.connect();
                } catch (e) {
                    console.warn(`[${meta.name}] WebSocket connection failed:`, e);
                }
            }

            // 6. Subscribe to Tickers
            // Special case for Binance in this version of lib
            if (meta.id === 'binance') {
                exchange.wsClient.send({
                    method: "SUBSCRIBE",
                    params: ["!ticker@arr"],
                    id: 1
                });
            }

            ccxt.subscribeAllMiniTickers(meta.id, (msg) => {
                const stdSym = msg.symbol; // Library now returns standardized [BINANCE]:BTCUSDT
                const cell = exchangeData[meta.id].cells[stdSym];

                if (cell) {
                    const price = msg.data.c || msg.data.last || msg.data.idxPr || msg.data.markPrice;
                    if (!price) return;

                    const numericPrice = parseFloat(price);
                    const prevPrice = exchangeData[meta.id].prevPrices[stdSym];

                    if (numericPrice === prevPrice) return;

                    cell.innerText = numericPrice.toLocaleString(undefined, {
                        minimumFractionDigits: numericPrice < 1 ? 4 : 2,
                        maximumFractionDigits: 8
                    });

                    // Add flash effect
                    if (prevPrice) {
                        const flashClass = numericPrice > prevPrice ? 'update-flash-up' : 'update-flash-down';
                        cell.classList.add(flashClass);
                        setTimeout(() => cell.classList.remove(flashClass), 300);
                    }

                    exchangeData[meta.id].prevPrices[stdSym] = numericPrice;
                }
            });

        } catch (e) {
            console.error(`Error initializing ${meta.id}:`, e);
            countSpan.innerText = 'Error loading symbols';
            countSpan.style.color = 'var(--danger)';
        }
    }

    async function start() {
        for (const tag of SUPPORTED_EXCHANGE_IDS) {
            await initExchange(tag);
        }
    }

    start();
})();
