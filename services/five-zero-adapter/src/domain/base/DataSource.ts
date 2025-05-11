import { MqttClient } from '../../infrastructure/MqttClient';

export abstract class DataSource {
    private id: string;
    private machineId: string;
    private name: string;
    private scaleFactor: number;
    private offset: number;
    private value: any = null;
    private status: 'OK' | 'ERROR' | 'DISCONNECTED' = 'DISCONNECTED';
    protected mqttClient: MqttClient;

    constructor({
        id,
        machineId,
        name,
        scaleFactor = 1,
        offset = 0,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        scaleFactor?: number;
        offset?: number;
        mqttClient: MqttClient;
    }) {
        this.id = id;
        this.machineId = machineId;
        this.name = name;
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
        this.mqttClient.publish(topic, JSON.stringify({
            value: this.value,
            timestamp: new Date().toISOString()
        }));
    }

    private publishStatus(): void {
        const topic = `/machines/${this.machineId}/datasources/${this.id}/status`;
        this.mqttClient.publish(topic, JSON.stringify({
            status: this.status,
            timestamp: new Date().toISOString()
        }));
    }

    abstract toJSON(): any;

    static fromJSON(data: any, mqttClient: MqttClient): DataSource {
        // Factory method to be implemented by child classes
        throw new Error('Method not implemented');
    }
}