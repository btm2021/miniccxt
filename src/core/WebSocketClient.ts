export class WebSocketClient {
    private ws: any;
    private url: string;
    private isNode: boolean;
    private callbacks: Map<string, Function[]> = new Map();
    private isConnected: boolean = false;
    private reconnectTimer?: NodeJS.Timeout;
    private manualClose: boolean = false;

    constructor(url: string) {
        this.url = url;
        this.isNode = typeof window === 'undefined';
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.manualClose = false;
                if (this.isNode) {
                    const WSNode = require('ws');
                    this.ws = new WSNode(this.url);
                } else {
                    this.ws = new (window as any).WebSocket(this.url);
                }

                this.ws.onopen = () => {
                    this.isConnected = true;
                    console.log(`WebSocket connected to ${this.url}`);
                    resolve();
                };

                this.ws.onmessage = (event: any) => {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    this.emit('message', data);
                };

                this.ws.onerror = (error: any) => {
                    console.error(`WebSocket error:`, error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    this.isConnected = false;
                    if (!this.manualClose) {
                        console.log(`WebSocket closed. Reconnecting...`);
                        this.reconnect();
                    } else {
                        console.log(`WebSocket closed manually.`);
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private reconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            this.connect().catch(() => { });
        }, 5000);
    }

    send(data: any) {
        if (this.isConnected) {
            this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
    }

    on(event: string, callback: Function) {
        const hooks = this.callbacks.get(event) || [];
        hooks.push(callback);
        this.callbacks.set(event, hooks);
    }

    private emit(event: string, data: any) {
        const hooks = this.callbacks.get(event) || [];
        hooks.forEach(cb => cb(data));
    }

    close() {
        this.manualClose = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.ws) {
            this.ws.close();
        }
    }
}
