import { ControlPointRepository } from '../base/ControlPointRepository';
import { UccncControlPoint } from '../../domain/uccnc/UccncControlPoint';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class UccncControlPointRepository extends ControlPointRepository<UccncControlPoint> {
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
                        const controlPoint = new UccncControlPoint({
                            id: controlPointConfig.id,
                            machineId,
                            name: controlPointConfig.name,
                            command: controlPointConfig.command,
                            minValue: controlPointConfig.minValue,
                            maxValue: controlPointConfig.maxValue,
                            mqttClient: this.mqttClient
                        });

                        this.controlPoints.set(controlPoint.getId(), controlPoint);
                    }
                }
            }
        }
    }
}