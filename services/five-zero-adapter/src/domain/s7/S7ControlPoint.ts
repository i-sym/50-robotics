import { ControlPoint } from '../base/ControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';

export class S7ControlPoint extends ControlPoint {
    private address: string;
    private dataType: string;

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
        super({
            id,
            machineId,
            name,
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
            dataType: this.dataType
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): S7ControlPoint {
        return new S7ControlPoint({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            address: data.address,
            dataType: data.dataType,
            mqttClient
        });
    }
}