import { ControlPoint } from '../base/ControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';

export class ShellyControlPoint extends ControlPoint {
    private endpoint: string;
    private valueKey: string;
    private valueOn?: string;
    private valueOff?: string;
    private minValue?: number;
    private maxValue?: number;

    constructor({
        id,
        machineId,
        name,
        endpoint,
        valueKey,
        valueOn,
        valueOff,
        minValue,
        maxValue,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        endpoint: string;
        valueKey: string;
        valueOn?: string;
        valueOff?: string;
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
        this.endpoint = endpoint;
        this.valueKey = valueKey;
        this.valueOn = valueOn;
        this.valueOff = valueOff;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    getEndpoint(): string {
        return this.endpoint;
    }

    getValueKey(): string {
        return this.valueKey;
    }

    getValueOn(): string | undefined {
        return this.valueOn;
    }

    getValueOff(): string | undefined {
        return this.valueOff;
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
            endpoint: this.endpoint,
            valueKey: this.valueKey,
            valueOn: this.valueOn,
            valueOff: this.valueOff,
            minValue: this.minValue,
            maxValue: this.maxValue
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): ShellyControlPoint {
        return new ShellyControlPoint({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            endpoint: data.endpoint,
            valueKey: data.valueKey,
            valueOn: data.valueOn,
            valueOff: data.valueOff,
            minValue: data.minValue,
            maxValue: data.maxValue,
            mqttClient
        });
    }
}