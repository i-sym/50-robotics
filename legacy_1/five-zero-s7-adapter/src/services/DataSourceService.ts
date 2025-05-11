import { DataSource } from '../domain/DataSource';
import { DataSourceRepository } from '../repositories/DataSourceRepository';
import { MachineRepository } from '../repositories/MachineRepository';
import { NotFoundError } from '../common/errors';
import { DataSourceData, DataSourceValueData } from '../schemas';

export class DataSourceService {
    private static instance: DataSourceService;
    private dataSourceRepository: DataSourceRepository;
    private machineRepository: MachineRepository;

    private constructor(dataSourceRepository: DataSourceRepository, machineRepository: MachineRepository) {
        this.dataSourceRepository = dataSourceRepository;
        this.machineRepository = machineRepository;
    }

    public static getInstance(
        dataSourceRepository: DataSourceRepository,
        machineRepository: MachineRepository
    ): DataSourceService {
        if (!DataSourceService.instance) {
            DataSourceService.instance = new DataSourceService(dataSourceRepository, machineRepository);
        }
        return DataSourceService.instance;
    }

    /**
     * Get all data sources for a machine
     * @param machineId Machine ID
     */
    async getDataSourcesByMachine({ machineId }: { machineId: string }): Promise<DataSourceData[]> {
        const machine = await this.machineRepository.getMachineById(machineId);
        if (!machine) {
            throw new NotFoundError(`Machine with ID ${machineId} not found`);
        }

        const dataSources = await this.dataSourceRepository.getDataSourcesByMachine(machineId);
        return dataSources.map(dataSource => dataSource.toJSON());
    }

    /**
     * Get current value of a data source
     * @param machineId Machine ID
     * @param dataSourceId Data source ID
     */
    async getDataSourceValue({
        machineId,
        dataSourceId
    }: {
        machineId: string;
        dataSourceId: string
    }): Promise<DataSourceValueData> {
        const dataSource = await this.dataSourceRepository.getDataSourceById(dataSourceId);

        if (!dataSource) {
            throw new NotFoundError(`Data source with ID ${dataSourceId} not found`);
        }

        if (dataSource.getMachineId() !== machineId) {
            throw new Error(`Data source ${dataSourceId} does not belong to machine ${machineId}`);
        }

        return {
            id: dataSourceId,
            value: dataSource.getCurrentValue(),
            status: dataSource.getCurrentStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get the data source repository
     */
    getDataSourceRepository(): DataSourceRepository {
        return this.dataSourceRepository;
    }
}
