import { DataSource } from '../base/DataSource';
import { MqttClient } from '../../infrastructure/MqttClient';

export class ShellyDataSource extends DataSource {
    private endpoint: string;
    private valuePath: string;

    constructor({
        id,
        machineId,
        name,
        endpoint,
        valuePath,
        scaleFactor = 1,
        offset = 0,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        endpoint: string;
        valuePath: string;
        scaleFactor?: number;
        offset?: number;
        mqttClient: MqttClient;
    }) {
        super({
            id,
            machineId,
            name,
            scaleFactor,
            offset,
            mqttClient
        });
        this.endpoint = endpoint;
        this.valuePath = valuePath;
    }

    getEndpoint(): string {
        return this.endpoint;
    }

    getValuePath(): string {
        return this.valuePath;
    }

    toJSON(): any {
        return {
            id: this.getId(),
            machineId: this.getMachineId(),
            name: this.getName(),
            endpoint: this.endpoint,
            valuePath: this.valuePath,
            scaleFactor: this.getScaleFactor(),
            offset: this.getOffset()
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): ShellyDataSource {
        return new ShellyDataSource({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            endpoint: data.endpoint,
            valuePath: data.valuePath,
            scaleFactor: data.scaleFactor,
            offset: data.offset,
            mqttClient
        });
    }
}