import { ControlPointData } from '../schemas'
import { MqttClient } from '../infrastructure/MqttClient';

export class ControlPoint {
    private id: string;
    private machineId: string;
    private name: string;
    private address: string;
    private dataType: string;
    private reported: any = null;
    private target: any = null;
    private status: 'OK' | 'ERROR' | 'DISCONNECTED' = 'DISCONNECTED';
    private mqttClient: MqttClient;
    private onTargetChangeCallback: ((value: any) => Promise<void>) | null = null;

    constructor({
        id,
        machineId,
        name,
        address,
        dataType,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        address: string;
        dataType: string;
        mqttClient: MqttClient;
    }) {
        this.id = id;
        this.machineId = machineId;
        this.name = name;
        this.address = address;
        this.dataType = dataType;
        this.mqttClient = mqttClient;

        // Subscribe to target commands
        this.subscribeToTarget();
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

    private subscribeToTarget(): void {
        const topic = `/machines/${this.machineId}/controlPoints/${this.id}/target`;
        this.mqttClient.subscribe(topic, (message) => {
            try {
                this.target = JSON.parse(message.toString());
                this.handleTargetChange();
            } catch (error) {
                console.error(`Error parsing target for ${this.id}:`, error);
            }
        });
    }

    setTargetChangeCallback(callback: (value: any) => Promise<void>): void {
        this.onTargetChangeCallback = callback;
    }

    protected async handleTargetChange(): Promise<void> {
        try {
            if (this.onTargetChangeCallback) {
                await this.onTargetChangeCallback(this.target);
            }
        } catch (error) {
            console.error(`Error handling target change for ${this.id}:`, error);
            this.updateStatus('ERROR');
        }
    }

    updateReported(value: any): void {
        this.reported = value;
        this.publishReported();
    }

    updateStatus(status: 'OK' | 'ERROR' | 'DISCONNECTED'): void {
        this.status = status;
        this.publishStatus();
    }

    getCurrentTarget(): any {
        return this.target;
    }

    getCurrentReported(): any {
        return this.reported;
    }

    getCurrentStatus(): 'OK' | 'ERROR' | 'DISCONNECTED' {
        return this.status;
    }

    private publishReported(): void {
        const topic = `/machines/${this.machineId}/controlPoints/${this.id}/reported`;
        this.mqttClient.publish(topic, JSON.stringify(this.reported));
    }

    private publishStatus(): void {
        const topic = `/machines/${this.machineId}/controlPoints/${this.id}/status`;
        this.mqttClient.publish(topic, JSON.stringify({
            status: this.status,
            timestamp: new Date().toISOString()
        }));
    }

    toJSON(): ControlPointData {
        return {
            id: this.id,
            machineId: this.machineId,
            name: this.name,
            address: this.address,
            dataType: this.dataType as any // Cast to match schema enum
        };
    }

    static fromJSON(data: ControlPointData, mqttClient: MqttClient): ControlPoint {
        return new ControlPoint({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            address: data.address,
            dataType: data.dataType,
            mqttClient
        });
    }
}
