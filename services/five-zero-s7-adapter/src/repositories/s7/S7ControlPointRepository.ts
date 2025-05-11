import { ControlPointRepository } from '../base/ControlPointRepository';
import { S7ControlPoint } from '../../domain/s7/S7ControlPoint';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class S7ControlPointRepository extends ControlPointRepository<S7ControlPoint> {
    private config: ConfigLoader;
    private mqttClient: MqttClient;

    constructor(config: ConfigLoader, mqttClient: MqttClient) {
        super();
        this.config = config;
        this.mqttClient = mqttClient;
        this.initialize();
    }

    initialize(): void {
        // Initialize control points from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machineId = machineConfig.id;

                if (machineConfig.controlPoints && Array.isArray(machineConfig.controlPoints)) {
                    for (const controlPointConfig of machineConfig.controlPoints) {
                        const controlPoint = new S7ControlPoint({
                            id: controlPointConfig.id,
                            machineId,
                            name: controlPointConfig.name,
                            address: controlPointConfig.address,
                            dataType: controlPointConfig.dataType,
                            mqttClient: this.mqttClient
                        });

                        this.controlPoints.set(controlPoint.getId(), controlPoint);
                    }
                }
            }
        }
    }
}