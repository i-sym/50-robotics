import { AdapterService } from '../base/AdapterService';
import { UccncAdapter } from '../../domain/uccnc/UccncAdapter';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class UccncAdapterService extends AdapterService {
    constructor(adapter: UccncAdapter) {
        super(adapter);
    }

    static getInstance(config: ConfigLoader, mqttClient: MqttClient): UccncAdapterService {
        const adapter = new UccncAdapter({
            mqttClient,
            config,
            pollIntervalMs: config.getPollIntervalMs()
        });

        return new UccncAdapterService(adapter);
    }
}
