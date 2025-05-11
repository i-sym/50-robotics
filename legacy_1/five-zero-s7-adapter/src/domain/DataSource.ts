import { DataSourceData } from '../schemas';
import { MqttClient } from '../infrastructure/MqttClient';

export class DataSource {
    private id: string;
    private machineId: string;
    private name: string;
    private address: string;
    private dataType: string;
    private scaleFactor: number;
    private offset: number;
    private value: any = null;
    private status: 'OK' | 'ERROR' | 'DISCONNECTED' = 'DISCONNECTED';
    private mqttClient: MqttClient;

    constructor({
        id,
        machineId,
        name,
        address,
        dataType,
        scaleFactor = 1,
        offset = 0,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        address: string;
        dataType: string;
        scaleFactor?: number;
        offset?: number;
        mqttClient: MqttClient;
    }) {
        this.id = id;
        this.machineId = machineId;
        this.name = name;
        this.address = address;
        this.dataType = dataType;
        this.scaleFactor = scaleFactor;
        this.offset = offset;
        this.mqttClient = mqttClient;
    }

    getId(): string {
        return this.id;
    }

    getMachineId(): string {
        return this.machineId;
    }

    getName(): string {
        return this.name;
    }

    getAddress(): string {
        return this.address;
    }

    getDataType(): string {
        return this.dataType;
    }

    getScaleFactor(): number {
        return this.scaleFactor;
    }

    getOffset(): number {
        return this.offset;
    }

    updateValue(value: any): void {
        // Apply scale factor and offset if needed
        if (typeof value === 'number') {
            this.value = value * this.scaleFactor + this.offset;
        } else {
            this.value = value;
        }
        this.publishValue();
    }

    updateStatus(status: 'OK' | 'ERROR' | 'DISCONNECTED'): void {
        this.status = status;
        this.publishStatus();
    }

    getCurrentValue(): any {
        return this.value;
    }

    getCurrentStatus(): 'OK' | 'ERROR' | 'DISCONNECTED' {
        return this.status;
    }

    private publishValue(): void {
        const topic = `/machines/${this.machineId}/datasources/${this.id}/value`;
        this.mqttClient.publish(topic, JSON.stringify(this.value));
    }

    private publishStatus(): void {
        const topic = `/machines/${this.machineId}/datasources/${this.id}/status`;
        this.mqttClient.publish(topic, JSON.stringify({
            status: this.status,
            timestamp: new Date().toISOString()
        }));
    }

    toJSON(): DataSourceData {
        return {
            id: this.id,
            machineId: this.machineId,
            name: this.name,
            address: this.address,
            dataType: this.dataType as any, // Cast to match schema enum
            scaleFactor: this.scaleFactor,
            offset: this.offset
        };
    }

    static fromJSON(data: DataSourceData, mqttClient: MqttClient): DataSource {
        return new DataSource({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            address: data.address,
            dataType: data.dataType,
            scaleFactor: data.scaleFactor,
            offset: data.offset,
            mqttClient
        });
    }
}