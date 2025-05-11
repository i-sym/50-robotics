import { Machine } from '../base/Machine';
import { MqttClient } from '../../infrastructure/MqttClient';
import { UccncConnection } from '../../infrastructure/uccnc/UccncConnection';
import { ConnectionError } from '../../common/errors';

export interface UccncConnectionConfig {
    ip: string;
    port: number;
    apiKey?: string;
}

export class UccncMachine extends Machine {
    private connection: UccncConnectionConfig;
    private uccncConnection: UccncConnection | null = null;

    constructor({
        id,
        name,
        connection,
        dataSources = [],
        controlPoints = []
    }: {
        id: string;
        name: string;
        connection: UccncConnectionConfig;
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

    getConnection(): UccncConnectionConfig {
        return this.connection;
    }

    getUccncConnection(): UccncConnection | null {
        return this.uccncConnection;
    }

    async connect(): Promise<void> {
        if (!this.uccncConnection) {
            this.uccncConnection = new UccncConnection(this);
        }

        if (!this.uccncConnection.isConnected()) {
            await this.uccncConnection.connect();
        }
    }

    disconnect(): void {
        if (this.uccncConnection) {
            this.uccncConnection.disconnect();
            this.uccncConnection = null;
        }
    }

    isConnected(): boolean {
        return this.uccncConnection !== null && this.uccncConnection.isConnected();
    }

    async getVariable(variableName: string): Promise<any> {
        if (!this.uccncConnection || !this.isConnected()) {
            throw new ConnectionError('Not connected to UCCNC machine');
        }

        return await this.uccncConnection.getVariable(variableName);
    }

    async sendCommand(command: string, value?: any): Promise<void> {
        if (!this.uccncConnection || !this.isConnected()) {
            throw new ConnectionError('Not connected to UCCNC machine');
        }

        await this.uccncConnection.sendCommand(command, value);
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

    static fromJSON(data: any): UccncMachine {
        return new UccncMachine({
            id: data.id,
            name: data.name,
            connection: data.connection,
            dataSources: data.dataSources || [],
            controlPoints: data.controlPoints || []
        });
    }
}