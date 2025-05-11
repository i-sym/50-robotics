import { Machine } from '../base/Machine';
import { MqttClient } from '../../infrastructure/MqttClient';
import { S7Connection } from '../../infrastructure/s7/S7Connection';
import { ConnectionError } from '../../common/errors';

export interface S7ConnectionConfig {
    ip: string;
    rack: number;
    slot: number;
    localTSAP?: number;
    remoteTSAP?: number;
    timeout?: number;
}

export class S7Machine extends Machine {
    private connection: S7ConnectionConfig;
    private s7Connection: S7Connection | null = null;

    constructor({
        id,
        name,
        connection,
        dataSources = [],
        controlPoints = []
    }: {
        id: string;
        name: string;
        connection: S7ConnectionConfig;
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

    getConnection(): S7ConnectionConfig {
        return this.connection;
    }

    getS7Connection(): S7Connection | null {
        return this.s7Connection;
    }

    async connect(): Promise<void> {
        if (!this.s7Connection) {
            this.s7Connection = new S7Connection(this);
        }

        if (!this.s7Connection.isConnected()) {
            await this.s7Connection.connect();
        }
    }

    disconnect(): void {
        if (this.s7Connection) {
            this.s7Connection.disconnect();
            this.s7Connection = null;
        }
    }

    isConnected(): boolean {
        return this.s7Connection !== null && this.s7Connection.isConnected();
    }

    async readVariables(): Promise<{ [key: string]: any }> {
        if (!this.s7Connection || !this.isConnected()) {
            throw new ConnectionError('Not connected to PLC');
        }

        return await this.s7Connection.readVariables();
    }

    async writeVariable(alias: string, value: any): Promise<void> {
        if (!this.s7Connection || !this.isConnected()) {
            throw new ConnectionError('Not connected to PLC');
        }

        await this.s7Connection.writeVariable(alias, value);
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

    static fromJSON(data: any): S7Machine {
        return new S7Machine({
            id: data.id,
            name: data.name,
            connection: data.connection,
            dataSources: data.dataSources || [],
            controlPoints: data.controlPoints || []
        });
    }
}