import { MqttClient } from '../../infrastructure/MqttClient';

export abstract class Machine {
    private id: string;
    private name: string;
    private dataSources: string[] = [];
    private controlPoints: string[] = [];

    constructor({
        id,
        name,
        dataSources = [],
        controlPoints = []
    }: {
        id: string;
        name: string;
        dataSources?: string[];
        controlPoints?: string[];
    }) {
        this.id = id;
        this.name = name;
        this.dataSources = dataSources;
        this.controlPoints = controlPoints;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getDataSources(): string[] {
        return this.dataSources;
    }

    getControlPoints(): string[] {
        return this.controlPoints;
    }

    addDataSource(dataSourceId: string): void {
        if (!this.dataSources.includes(dataSourceId)) {
            this.dataSources.push(dataSourceId);
        }
    }

    addControlPoint(controlPointId: string): void {
        if (!this.controlPoints.includes(controlPointId)) {
            this.controlPoints.push(controlPointId);
        }
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): void;
    abstract isConnected(): boolean;

    abstract toJSON(): any;

    static fromJSON(data: any, mqttClient: MqttClient): Machine {
        // Factory method to be implemented by child classes
        throw new Error('Method not implemented');
    }
}