import { AdapterService } from '../base/AdapterService';
import { ShellyAdapter } from '../../domain/shelly/ShellyAdapter';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class ShellyAdapterService extends AdapterService {
    constructor(adapter: ShellyAdapter) {
        super(adapter);
    }

    static getInstance(config: ConfigLoader, mqttClient: MqttClient): ShellyAdapterService {
        const adapter = new ShellyAdapter({
            mqttClient,
            config,
            pollIntervalMs: config.getPollIntervalMs()
        });

        return new ShellyAdapterService(adapter);
    }
}