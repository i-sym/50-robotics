import { ControlPoint } from '../base/ControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';

export class UccncControlPoint extends ControlPoint {
    private command: string;
    private minValue?: number;
    private maxValue?: number;

    constructor({
        id,
        machineId,
        name,
        command,
        minValue,
        maxValue,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        command: string;
        minValue?: number;
        maxValue?: number;
        mqttClient: MqttClient;
    }) {
        super({
            id,
            machineId,
            name,
            mqttClient
        });
        this.command = command;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    getCommand(): string {
        return this.command;
    }

    getMinValue(): number | undefined {
        return this.minValue;
    }

    getMaxValue(): number | undefined {
        return this.maxValue;
    }

    toJSON(): any {
        return {
            id: this.getId(),
            machineId: this.getMachineId(),
            name: this.getName(),
            command: this.command,
            minValue: this.minValue,
            maxValue: this.maxValue
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): UccncControlPoint {
        return new UccncControlPoint({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            command: data.command,
            minValue: data.minValue,
            maxValue: data.maxValue,
            mqttClient
        });
    }
}