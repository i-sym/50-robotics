import { Machine } from '../base/Machine';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ShellyConnection } from '../../infrastructure/shelly/ShellyConnection';
import { ConnectionError } from '../../common/errors';

export interface ShellyConnectionConfig {
    ip: string;
    type: string;
    username?: string;
    password?: string;
}

export class ShellyMachine extends Machine {
    private connection: ShellyConnectionConfig;
    private shellyConnection: ShellyConnection | null = null;

    constructor({
        id,
        name,
        connection,
        dataSources = [],
        controlPoints = []
    }: {
        id: string;
        name: string;
        connection: ShellyConnectionConfig;
        dataSources?: string[];
        controlPoints?: string[];
    }) {
        super({
            id,
            name,
            dataSources,
            controlPoints
        });
        this.connection = connection;
    }

    getConnection(): ShellyConnectionConfig {
        return this.connection;
    }

    getShellyConnection(): ShellyConnection | null {
        return this.shellyConnection;
    }

    async connect(): Promise<void> {
        if (!this.shellyConnection) {
            this.shellyConnection = new ShellyConnection(this);
        }

        if (!this.shellyConnection.isConnected()) {
            await this.shellyConnection.connect();
        }
    }

    disconnect(): void {
        if (this.shellyConnection) {
            this.shellyConnection.disconnect();
            this.shellyConnection = null;
        }
    }

    isConnected(): boolean {
        return this.shellyConnection !== null && this.shellyConnection.isConnected();
    }

    async fetchData(endpoint: string): Promise<any> {
        if (!this.shellyConnection || !this.isConnected()) {
            throw new ConnectionError('Not connected to Shelly device');
        }

        return await this.shellyConnection.fetchData(endpoint);
    }

    async sendCommand(endpoint: string, params: Record<string, any>): Promise<any> {
        if (!this.shellyConnection || !this.isConnected()) {
            throw new ConnectionError('Not connected to Shelly device');
        }

        return await this.shellyConnection.sendCommand(endpoint, params);
    }

    toJSON(): any {
        return {
            id: this.getId(),
            name: this.getName(),
            connection: this.connection,
            dataSources: this.getDataSources(),
            controlPoints: this.getControlPoints()
        };
    }

    static fromJSON(data: any): ShellyMachine {
        return new ShellyMachine({
            id: data.id,
            name: data.name,
            connection: data.connection,
            dataSources: data.dataSources || [],
            controlPoints: data.controlPoints || []
        });
    }
}