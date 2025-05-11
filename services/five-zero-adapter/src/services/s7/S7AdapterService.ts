import { AdapterService } from '../base/AdapterService';
import { S7Adapter } from '../../domain/s7/S7Adapter';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class S7AdapterService extends AdapterService {
    constructor(adapter: S7Adapter) {
        super(adapter);
    }

    static getInstance(config: ConfigLoader, mqttClient: MqttClient): S7AdapterService {
        const adapter = new S7Adapter({
            mqttClient,
            config,
            pollIntervalMs: config.getPollIntervalMs()
        });

        return new S7AdapterService(adapter);
    }
}