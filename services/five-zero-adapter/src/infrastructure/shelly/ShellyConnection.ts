import { ShellyMachine } from '../../domain/shelly/ShellyMachine';
import { ConnectionError, ProtocolError } from '../../common/errors';

export class ShellyConnection {
    private machine: ShellyMachine;
    private connected: boolean = false;

    constructor(machine: ShellyMachine) {
        this.machine = machine;
    }

    async connect(): Promise<void> {
        try {
            const { ip } = this.machine.getConnection();

            // Try to connect to the Shelly device by fetching device info
            const response = await fetch(`http://${ip}`);

            if (!(response.ok || response.status == 404)) {
                throw new ConnectionError(`Failed to connect to Shelly device at ${ip}`);
            }

            const data = await response.text();

            // Check if the device type matches (if specified)
            // const configType = this.machine.getConnection().type;
            // if (configType && data.type !== configType) {
            //     console.warn(`Device type mismatch: expected ${configType}, got ${data.type}`);
            // }

            this.connected = true;
        } catch (error) {
            this.connected = false;
            throw new ConnectionError(`Failed to connect to Shelly device at ${this.machine.getConnection().ip}: ${error}`);
        }
    }

    async fetchData(endpoint: string): Promise<any> {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const url = `http://${this.machine.getConnection().ip}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Error fetching data from ${url}: ${response.status} ${response.statusText}`);
                throw new ProtocolError(`HTTP error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.connected = false;
            throw new ProtocolError(`Failed to fetch data from ${endpoint}: ${error}`);
        }
    }

    async sendCommand(endpoint: string, params: Record<string, any>): Promise<any> {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const url = new URL(`http://${this.machine.getConnection().ip}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`);

            // Add params to URL
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });

            console.log(`Sending command to ${url.toString()}`);

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new ProtocolError(`HTTP error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.connected = false;
            throw new ProtocolError(`Failed to send command to ${endpoint}: ${error}`);
        }
    }

    disconnect(): void {
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }
}