import { DataSource } from '../domain/DataSource';
import { ConfigLoader } from '../common/ConfigLoader';
import { MqttClient } from '../infrastructure/MqttClient';

export class DataSourceRepository {
    private dataSources: Map<string, DataSource> = new Map();
    private config: ConfigLoader;
    private mqttClient: MqttClient;

    constructor(config: ConfigLoader, mqttClient: MqttClient) {
        this.config = config;
        this.mqttClient = mqttClient;
        this.initialize();
    }

    private initialize(): void {
        // Initialize data sources from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machineId = machineConfig.id;

                if (machineConfig.dataSources && Array.isArray(machineConfig.dataSources)) {
                    for (const dataSourceConfig of machineConfig.dataSources) {
                        const dataSource = new DataSource({
                            id: dataSourceConfig.id,
                            machineId,
                            name: dataSourceConfig.name,
                            address: dataSourceConfig.address,
                            dataType: dataSourceConfig.dataType,
                            scaleFactor: dataSourceConfig.scaleFactor,
                            offset: dataSourceConfig.offset,
                            mqttClient: this.mqttClient
                        });

                        this.dataSources.set(dataSource.getId(), dataSource);
                    }
                }
            }
        }
    }

    async getAllDataSources(): Promise<DataSource[]> {
        return Array.from(this.dataSources.values());
    }

    async getDataSourceById(id: string): Promise<DataSource | null> {
        const dataSource = this.dataSources.get(id);
        return dataSource || null;
    }

    async getDataSourcesByMachine(machineId: string): Promise<DataSource[]> {
        return Array.from(this.dataSources.values())
            .filter(ds => ds.getMachineId() === machineId);
    }

    async saveDataSource(dataSource: DataSource): Promise<DataSource> {
        this.dataSources.set(dataSource.getId(), dataSource);
        return dataSource;
    }
}
