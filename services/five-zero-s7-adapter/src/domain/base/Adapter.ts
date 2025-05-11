import { MqttClient } from '../../infrastructure/MqttClient';
import { ConfigLoader } from '../../common/ConfigLoader';
import { Machine } from './Machine';
import { DataSource } from './DataSource';
import { ControlPoint } from './ControlPoint';

export abstract class Adapter {
    protected name: string;
    protected mqttClient: MqttClient;
    protected config: ConfigLoader;
    protected machines: Map<string, Machine> = new Map();
    protected dataSources: Map<string, DataSource> = new Map();
    protected controlPoints: Map<string, ControlPoint> = new Map();
    protected pollingInterval: NodeJS.Timeout | null = null;
    protected pollIntervalMs: number;

    constructor({
        name,
        mqttClient,
        config,
        pollIntervalMs = 1000
    }: {
        name: string;
        mqttClient: MqttClient;
        config: ConfigLoader;
        pollIntervalMs?: number;
    }) {
        this.name = name;
        this.mqttClient = mqttClient;
        this.config = config;
        this.pollIntervalMs = pollIntervalMs;
    }

    abstract initialize(): Promise<void>;

    startPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            await this.pollAllMachines();
        }, this.pollIntervalMs);

        console.log(`Started polling with interval ${this.pollIntervalMs}ms`);
    }

    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Stopped polling');
        }
    }

    abstract pollAllMachines(): Promise<void>;

    async disconnect(): Promise<void> {
        this.stopPolling();

        for (const [machineId, machine] of this.machines.entries()) {
            machine.disconnect();
            await this.updateMachineComponentsStatus(machineId, 'DISCONNECTED');
        }

        console.log(`All ${this.name} connections closed`);
    }

    async updateMachineComponentsStatus(
        machineId: string,
        status: 'OK' | 'ERROR' | 'DISCONNECTED'
    ): Promise<void> {
        // Update data sources status
        for (const dataSource of this.getDataSourcesByMachine(machineId)) {
            dataSource.updateStatus(status);
        }

        // Update control points status
        for (const controlPoint of this.getControlPointsByMachine(machineId)) {
            controlPoint.updateStatus(status);
        }
    }

    getMachine(id: string): Machine | undefined {
        return this.machines.get(id);
    }

    getAllMachines(): Machine[] {
        return Array.from(this.machines.values());
    }

    getDataSource(id: string): DataSource | undefined {
        return this.dataSources.get(id);
    }

    getDataSourcesByMachine(machineId: string): DataSource[] {
        return Array.from(this.dataSources.values())
            .filter(ds => ds.getMachineId() === machineId);
    }

    getControlPoint(id: string): ControlPoint | undefined {
        return this.controlPoints.get(id);
    }

    getControlPointsByMachine(machineId: string): ControlPoint[] {
        return Array.from(this.controlPoints.values())
            .filter(cp => cp.getMachineId() === machineId);
    }

    getMqttClient(): MqttClient {
        return this.mqttClient;
    }
}
