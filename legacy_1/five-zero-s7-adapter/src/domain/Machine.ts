import { MachineData, S7Connection } from '../schemas';

export class Machine {
    private id: string;
    private name: string;
    private connection: S7Connection;
    private dataSources: string[] = [];
    private controlPoints: string[] = [];

    constructor({
        id,
        name,
        connection,
        dataSources = [],
        controlPoints = []
    }: {
        id: string;
        name: string;
        connection: S7Connection;
        dataSources?: string[];
        controlPoints?: string[];
    }) {
        this.id = id;
        this.name = name;
        this.connection = connection;
        this.dataSources = dataSources;
        this.controlPoints = controlPoints;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getConnection(): S7Connection {
        return this.connection;
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

    toJSON(): MachineData {
        return {
            id: this.id,
            name: this.name,
            connection: this.connection,
            dataSources: this.dataSources,
            controlPoints: this.controlPoints
        };
    }

    static fromJSON(data: MachineData): Machine {
        return new Machine({
            id: data.id,
            name: data.name,
            connection: data.connection,
            dataSources: data.dataSources || [],
            controlPoints: data.controlPoints || []
        });
    }
}
