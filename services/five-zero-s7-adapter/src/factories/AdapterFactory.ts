import { AdapterService } from '../services/base/AdapterService';
import { S7AdapterService } from '../services/s7/S7AdapterService';
import { ShellyAdapterService } from '../services/shelly/ShellyAdapterService';
import { UccncAdapterService } from '../services/uccnc/UccncAdapterService';
import { ConfigLoader } from '../common/ConfigLoader';
import { MqttClient } from '../infrastructure/MqttClient';

/**
 * Factory class for creating the appropriate adapter service based on configuration
 */
export class AdapterFactory {
    static createAdapterService(config: ConfigLoader, mqttClient: MqttClient): AdapterService {
        const adapterType = config.getAdapterType().toLowerCase();

        switch (adapterType) {
            case 's7':
                console.log('Creating S7 Protocol Adapter Service');
                return S7AdapterService.getInstance(config, mqttClient);

            case 'shelly':
                console.log('Creating Shelly Adapter Service');
                return ShellyAdapterService.getInstance(config, mqttClient);

            case 'uccnc':
                console.log('Creating UCCNC Adapter Service');
                return UccncAdapterService.getInstance(config, mqttClient);

            default:
                throw new Error(`Unsupported adapter type: ${adapterType}`);
        }
    }
}