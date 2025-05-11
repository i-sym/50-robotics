import { DataSource } from '../../domain/base/DataSource';

export abstract class DataSourceRepository<T extends DataSource> {
    protected dataSources: Map<string, T> = new Map();

    async getAllDataSources(): Promise<T[]> {
        return Array.from(this.dataSources.values());
    }

    async getDataSourceById(id: string): Promise<T | null> {
        const dataSource = this.dataSources.get(id);
        return dataSource || null;
    }

    async getDataSourcesByMachine(machineId: string): Promise<T[]> {
        return Array.from(this.dataSources.values())
            .filter(ds => ds.getMachineId() === machineId);
    }

    async saveDataSource(dataSource: T): Promise<T> {
        this.dataSources.set(dataSource.getId(), dataSource);
        return dataSource;
    }

    abstract initialize(): void;
}