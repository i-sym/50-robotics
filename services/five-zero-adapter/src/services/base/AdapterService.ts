import { MqttClient } from '../../infrastructure/MqttClient';
import { Adapter } from '../../domain/base/Adapter';
import { ConfigLoader } from '../../common/ConfigLoader';

export abstract class AdapterService {
    protected adapter: Adapter;

    constructor(adapter: Adapter) {
        this.adapter = adapter;
    }

    public getAdapter(): Adapter {
        return this.adapter;
    }

    async initialize(): Promise<void> {
        await this.adapter.initialize();
    }

    startPolling(): void {
        this.adapter.startPolling();
    }

    stopPolling(): void {
        this.adapter.stopPolling();
    }

    async disconnect(): Promise<void> {
        await this.adapter.disconnect();
    }

    getMqttClient(): MqttClient {
        return this.adapter.getMqttClient();
    }

    static getInstance(config: ConfigLoader, mqttClient: MqttClient): AdapterService {
        // Factory method to be implemented by child classes
        throw new Error('Method not implemented');
    }
}