import { ControlPoint } from '../domain/ControlPoint';
import { ConfigLoader } from '../common/ConfigLoader';
import { MqttClient } from '../infrastructure/MqttClient';

export class ControlPointRepository {
    private controlPoints: Map<string, ControlPoint> = new Map();
    private config: ConfigLoader;
    private mqttClient: MqttClient;

    constructor(config: ConfigLoader, mqttClient: MqttClient) {
        this.config = config;
        this.mqttClient = mqttClient;
        this.initialize();
    }

    private initialize(): void {
        // Initialize control points from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machineId = machineConfig.id;

                if (machineConfig.controlPoints && Array.isArray(machineConfig.controlPoints)) {
                    for (const controlPointConfig of machineConfig.controlPoints) {
                        const controlPoint = new ControlPoint({
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

    async getAllControlPoints(): Promise<ControlPoint[]> {
        return Array.from(this.controlPoints.values());
    }

    async getControlPointById(id: string): Promise<ControlPoint | null> {
        const controlPoint = this.controlPoints.get(id);
        return controlPoint || null;
    }

    async getControlPointsByMachine(machineId: string): Promise<ControlPoint[]> {
        return Array.from(this.controlPoints.values())
            .filter(cp => cp.getMachineId() === machineId);
    }

    async saveControlPoint(controlPoint: ControlPoint): Promise<ControlPoint> {
        this.controlPoints.set(controlPoint.getId(), controlPoint);
        return controlPoint;
    }
}