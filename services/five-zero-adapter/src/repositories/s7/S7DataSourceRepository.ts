import { DataSourceRepository } from '../base/DataSourceRepository';
import { S7DataSource } from '../../domain/s7/S7DataSource';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class S7DataSourceRepository extends DataSourceRepository<S7DataSource> {
    private config: ConfigLoader;
    private mqttClient: MqttClient;

    constructor(config: ConfigLoader, mqttClient: MqttClient) {
        super();
        this.config = config;
        this.mqttClient = mqttClient;
        this.initialize();
    }

    initialize(): void {
        // Initialize data sources from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machineId = machineConfig.id;

                if (machineConfig.dataSources && Array.isArray(machineConfig.dataSources)) {
                    for (const dataSourceConfig of machineConfig.dataSources) {
                        const dataSource = new S7DataSource({
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
}