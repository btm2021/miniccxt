import { BaseExchange } from '../../core/BaseExchange';
import { OHLCV, ExchangeInfo, Ticker } from '../../types/market';
import { WSCallback } from '../../types/websocket';
import { Normalizer } from '../../core/Normalizer';

export class Bybit extends BaseExchange {
    async fetchOHLCV(symbol: string, timeframe: string, params: any = {}): Promise<OHLCV[]> {
        const marketSymbol = this.normalizeSymbol(symbol);
        const interval = this.normalizeTimeframe(timeframe);
        const maxLimit = 1000;
        const logo = `data:image/vnd.microsoft.icon;base64,AAABAAMAMDAAAAEAIACoJQAANgAAACAgAAABACAAqBAAAN4lAAAQEAAAAQAgAGgEAACGNgAAKAAAADAAAABgAAAAAQAgAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFRAQPhUSEp4UExPYFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UExPXFRISnhUQED4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMTEzcUERHqFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UERHqExMTNQAAAAAAAAAAAAAAAAAAAAAAAAAAEhISYhQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xISEmEAAAAAAAAAAAAAAAATExM3FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8TExM1AAAAAAAAAAMUERHqFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UERHrAAAAAxQUFEAUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FRAQPhUSEp8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FRISnBUTE9oUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBMT1xQSEv0UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/RQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/NTMz/2xra/9sa2v/bGtr/zUzM/8UEhL/FBIS/xQSEv8fHR3/bGtr/2xra/9sa2v/S0pK/xQSEv8UEhL/FBIS/xQSEv9hYGD/bGtr/2xra/9hYGD/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/NTMz/2xra/9sa2v/bGtr/zUzM/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wxMbP8Hb6L/B2+i/wdvov8SHiT/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8xMDD/////////////////p6en/xQSEv8UEhL/FBIS/xQSEv/i4uL////////////i4uL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/bGtr/////////////////2xra/8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/S0pK/6enp/+np6f/p6en/0tKSv8UEhL/FBIS/xQSEv8mJSX/p6en/6enp/+np6f/cG9v/xQSEv8UEhL/FBIS/xQSEv+VlJT/p6en/6enp/+VlJT/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/S0pK/6enp/+np6f/p6en/0tKSv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/wdvov8Apvf/AKb3/wCm9/8RJS//FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/w81SP8MSWj/DElo/wxJaP8TGR3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv0UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/RUSEt4UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBMT2RUSEqAUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FRISnRQUFEAUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FRAQPgAAAAMUERHrFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8TERHtAAAAAwAAAAASEhI5FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8TExM3AAAAAAAAAAAAAAAAFBISZBQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xISEmIAAAAAAAAAAAAAAAAAAAAAAAAAABISEjkTERHsFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8TERHsExMTNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFBQUQRQREaIVExPaFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UExPZFRISoBQUFEAAAAADAAAAAAAAAAAAAAAAAAAAAPwAAAAAPwAA8AAAAAAPAADgAAAAAAcAAMAAAAAAAwAAgAAAAAABAACAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAQAAgAAAAAABAADAAAAAAAMAAOAAAAAABwAA8AAAAAAPAAD8AAAAAD8AACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUFBRaFRISxxQSEvkUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEvkVEhLHFBQUWQAAAAQAAAAAAAAAAAAAAAANDQ0UFBIS5hQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS5Q0NDRMAAAAAAAAABBQSEucUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS5QAAAAQTExNcFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBQUWRQSEsgUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8VEhLGFBIS+RQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEvkUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8jISH/T01N/09NTf8jISH/FBIS/xQSEv9APz//T01N/0A/P/8UEhL/FBIS/yMhIf9PTU3/T01N/yMhIf8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/IyEh/09NTf9PTU3/IyEh/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/8XExP//////xcTE/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/xcTE///////FxMT/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv/FxMT//////8XExP8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/wlmk/8Fgb7/CWaT/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/8XExP//////xcTE/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/BYG+/wCm9/8Fgb7/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/xcTE///////FxMT/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8Fgb7/AKb3/wWBvv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv/FxMT//////8XExP8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/wWBvv8Apvf/BYG+/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/8XExP//////xcTE/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/BYG+/wCm9/8Fgb7/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/xcTE///////FxMT/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv8Fgb7/AKb3/wWBvv8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv9PTU3///////////9PTU3/FBIS/xQSEv/FxMT//////8XExP8UEhL/FBIS/09NTf///////////09NTf8UEhL/FBIS/wWBvv8Apvf/BYG+/xQSEv8UEhL/T01N////////////T01N/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/0A/P//FxMT/xcTE/0A/P/8UEhL/FBIS/5mYmP/FxMT/mZiY/xQSEv8UEhL/QD8//8XExP/FxMT/QD8//xQSEv8UEhL/BYG+/wCm9/8Fgb7/FBIS/xQSEv9APz//xcTE/8XExP9APz//FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8Fgb7/AKb3/wWBvv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/wWBvv8Apvf/BYG+/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/EC49/w83S/8QLj3/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS+RQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEvkUEhLKFBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FRISxxMTE1wUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UFBRaAAAABBQSEugUEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQSEv8UEhL/FBIS/xQS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`
        let requestedLimit = params.limit || 200;
        let limitRemaining = requestedLimit;
        let allCandles: OHLCV[] = [];
        let currentEndTime = params.endTime || undefined;

        while (limitRemaining > 0) {
            const fetchLimit = Math.min(limitRemaining, maxLimit);
            // Bybit V5 API: /v5/market/kline
            const response = await this.restClient.get<any>('/v5/market/kline', {
                category: 'linear',
                symbol: marketSymbol,
                interval,
                limit: fetchLimit,
                end: currentEndTime,
                ...params
            });

            if (!response.result || response.result.list.length === 0) break;

            const list = response.result.list;
            const rawOldestTimestamp = parseInt(list[list.length - 1][0]);

            const candles = list.map((k: any) => Normalizer.normalizeOHLCV(
                parseInt(k[0]), parseFloat(k[1]), parseFloat(k[2]), parseFloat(k[3]), parseFloat(k[4]), parseFloat(k[5])
            )).reverse(); // Bybit returns descending, we want ascending

            allCandles = [...candles, ...allCandles];

            if (list.length < fetchLimit) break;

            limitRemaining -= list.length;
            currentEndTime = rawOldestTimestamp - 1;

            if (allCandles.length >= requestedLimit) break;
        }

        return allCandles.slice(-requestedLimit);
    }

    async fetchExchangeInfo(): Promise<ExchangeInfo> {
        const response = await this.restClient.get<any>('/v5/market/instruments-info', {
            category: 'linear'
        });

        // Filter for USDT pairs and Perpetual contracts (not expired)
        const filteredSymbols = response.result.list.filter((s: any) =>
            s.quoteCoin === 'USDT' && s.status === 'Trading'
        );

        const markets = filteredSymbols.map((s: any) => {
            const std = this.standardizeSymbol(`${s.baseCoin}/${s.quoteCoin}`);
            this.rawToStandard.set(s.symbol, std);
            this.standardToRaw.set(std, s.symbol);

            const { minMove, priceScale } = this.calculateTVPrecision(s.priceFilter.tickSize);

            return {
                symbol: std,
                id: s.symbol,
                base: s.baseCoin,
                quote: s.quoteCoin,
                active: s.status === 'Trading',
                precision: {
                    price: parseFloat(s.priceFilter.tickSize),
                    amount: parseFloat(s.lotSizeFilter.qtyStep)
                },
                limits: {
                    amount: {
                        min: parseFloat(s.lotSizeFilter.minOrderQty),
                        max: parseFloat(s.lotSizeFilter.maxOrderQty)
                    },
                    price: {
                        min: parseFloat(s.priceFilter.minPrice),
                        max: parseFloat(s.priceFilter.maxPrice)
                    },
                    cost: { min: 0, max: 0 }
                },
                minMove,
                priceScale,
                info: s
            };
        });

        this.setMarkets(markets);

        return {
            id: this.config.id,
            name: this.config.name,
            symbols: markets.map((m: any) => m.symbol),
            timeframes: Object.keys(this.config.timeframeMap),
            markets
        };
    }

    async fetchTicker(symbol: string, params?: object): Promise<Ticker> {
        const marketSymbol = this.normalizeSymbol(symbol);
        const response = await this.restClient.get<any>('/v5/market/tickers', {
            category: 'linear',
            symbol: marketSymbol,
            ...params
        });

        const t = response.result.list[0];
        return Normalizer.normalizeTicker(symbol, Date.now(), {
            high: parseFloat(t.highPrice24h),
            low: parseFloat(t.lowPrice24h),
            last: parseFloat(t.lastPrice),
            close: parseFloat(t.lastPrice),
            open: parseFloat(t.prevPrice24h),
            baseVolume: parseFloat(t.volume24h),
            quoteVolume: parseFloat(t.turnover24h)
        });
    }

    async fetchTickers(symbols?: string[], params?: object): Promise<Ticker[]> {
        const response = await this.restClient.get<any>('/v5/market/tickers', {
            category: 'linear',
            ...params
        });
        return response.result.list.map((t: any) => {
            return Normalizer.normalizeTicker(t.symbol, Date.now(), {
                high: parseFloat(t.highPrice24h),
                low: parseFloat(t.lowPrice24h),
                last: parseFloat(t.lastPrice),
                close: parseFloat(t.lastPrice),
                open: parseFloat(t.prevPrice24h),
                baseVolume: parseFloat(t.volume24h)
            });
        });
    }

    // WebSocket
    async subscribeAllMiniTickers(callback: WSCallback): Promise<void> {
        if (!this.wsClient) return;

        // Bybit needs subscription per symbol topic: tickers.BTCUSDT
        // First fetch all symbols
        const info = await this.fetchExchangeInfo();
        const symbols = info.symbols;

        // Bybit allows max 10 symbols per subscription item in some cases, but topics are safer
        // We use normalizeSymbol to strip the prefix if symbols came from fetchExchangeInfo
        const topics = symbols.map(s => `tickers.${this.normalizeSymbol(s)}`);

        // Send subscription in batches of 10 to be safe with Bybit limits
        for (let i = 0; i < topics.length; i += 10) {
            const batch = topics.slice(i, i + 10);
            this.wsClient.send({
                op: 'subscribe',
                args: batch
            });
        }

        this.wsClient.on('message', (msg: any) => {
            if (msg.topic && msg.topic.startsWith('tickers.')) {
                const symbol = msg.topic.split('.')[1];
                const data = msg.data;
                callback({
                    exchange: 'BYBIT_FUTURE',
                    symbol: this.rawToStandard.get(symbol) || this.standardizeSymbol(symbol),
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(msg.ts),
                    data: data
                });
            }
        });
    }

    subscribeTicker(symbol: string, callback: WSCallback): void {
        if (!this.wsClient) return;
        const marketSymbol = this.normalizeSymbol(symbol).replace('/', '');
        this.wsClient.send({
            op: 'subscribe',
            args: [`tickers.${marketSymbol}`]
        });
        this.wsClient.on('message', (msg: any) => {
            if (msg.topic === `tickers.${marketSymbol}`) {
                callback({
                    exchange: 'BYBIT_FUTURE',
                    symbol: this.rawToStandard.get(marketSymbol) || this.standardizeSymbol(symbol),
                    type: 'ticker',
                    timestamp: this.normalizeTimestamp(msg.ts),
                    data: msg.data
                });
            }
        });
    }

    subscribeOHLCV(symbol: string, timeframe: string, callback: WSCallback): void {
        // klines.<interval>.<symbol>
    }

    unsubscribe(channel: string): void {
        if (this.wsClient) {
            this.wsClient.send({ op: 'unsubscribe', args: [channel] });
        }
    }
}
