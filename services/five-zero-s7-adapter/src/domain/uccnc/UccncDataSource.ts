import { DataSource } from '../base/DataSource';
import { MqttClient } from '../../infrastructure/MqttClient';

export class UccncDataSource extends DataSource {
    private variable: string;

    constructor({
        id,
        machineId,
        name,
        variable,
        scaleFactor = 1,
        offset = 0,
        mqttClient
    }: {
        id: string;
        machineId: string;
        name: string;
        variable: string;
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
        this.variable = variable;
    }

    getVariable(): string {
        return this.variable;
    }

    toJSON(): any {
        return {
            id: this.getId(),
            machineId: this.getMachineId(),
            name: this.getName(),
            variable: this.variable,
            scaleFactor: this.getScaleFactor(),
            offset: this.getOffset()
        };
    }

    static fromJSON(data: any, mqttClient: MqttClient): UccncDataSource {
        return new UccncDataSource({
            id: data.id,
            machineId: data.machineId,
            name: data.name,
            variable: data.variable,
            scaleFactor: data.scaleFactor,
            offset: data.offset,
            mqttClient
        });
    }
}