import { MqttClient } from '../../infrastructure/MqttClient';

export abstract class ControlPoint {
    private id: string;
    private machineId: string;
    private name: string;
    private reported: any = null;
    private target: any = null;
    private status: 'OK' | 'ERROR' | 'DISCONNECTED' = 'DISCONNECTED';
    protected mqttClient: MqttClient;
    private onTargetChangeCallback: ((value: any) => Promise<void>) | null = null;

    constructor({
        id,
        machineId,
        name,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        mqttClient: MqttClient;
    }) {
        this.id = id;
        this.machineId = machineId;
        this.name = name;
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

    private subscribeToTarget(): void {
        const topic = `/machines/${this.machineId}/controlPoints/${this.id}/target`;
        this.mqttClient.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.toString());
                this.target = data.value !== undefined ? data.value : data;
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
        this.mqttClient.publish(topic, JSON.stringify({
            value: this.reported,
            timestamp: new Date().toISOString()
        }));
    }

    private publishStatus(): void {
        const topic = `/machines/${this.machineId}/controlPoints/${this.id}/status`;
        this.mqttClient.publish(topic, JSON.stringify({
            status: this.status,
            timestamp: new Date().toISOString()
        }));
    }

    abstract toJSON(): any;

    static fromJSON(data: any, mqttClient: MqttClient): ControlPoint {
        // Factory method to be implemented by child classes
        throw new Error('Method not implemented');
    }
}