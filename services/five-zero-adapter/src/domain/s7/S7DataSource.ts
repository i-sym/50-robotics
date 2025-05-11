import { DataSource } from '../base/DataSource';
import { MqttClient } from '../../infrastructure/MqttClient';

export class S7DataSource extends DataSource {
    private address: string;
    private dataType: string;

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
        super({
            id,
            machineId,
            name,
            scaleFactor,
            offset,
            mqttClient
        });
        this.address = address;
        this.dataType = dataType;
    }

    getAddress(): string {
        return this.address;
    }

    getDataType(): string {
        return this.dataType;
    }

    toJSON(): any {
        return {
            id: this.getId(),
            machineId: this.getMachineId(),
            name: this.getName(),
            address: this.address,
            dataType: this.dataType,
            scaleFactor: this.getScaleFactor(),
            offset: this.getOffset()
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): S7DataSource {
        return new S7DataSource({
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