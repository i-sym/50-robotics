import { ControlPoint } from '../domain/ControlPoint';
import { ControlPointRepository } from '../repositories/ControlPointRepository';
import { MachineRepository } from '../repositories/MachineRepository';
import { MqttClient } from '../infrastructure/MqttClient';
import { NotFoundError } from '../common/errors';
import { ControlPointData, ControlPointStateData } from '../schemas';

export class ControlPointService {
    private static instance: ControlPointService;
    private controlPointRepository: ControlPointRepository;
    private machineRepository: MachineRepository;
    private mqttClient: MqttClient;

    private constructor(
        controlPointRepository: ControlPointRepository,
        machineRepository: MachineRepository,
        mqttClient: MqttClient
    ) {
        this.controlPointRepository = controlPointRepository;
        this.machineRepository = machineRepository;
        this.mqttClient = mqttClient;
    }

    public static getInstance(
        controlPointRepository: ControlPointRepository,
        machineRepository: MachineRepository,
        mqttClient: MqttClient
    ): ControlPointService {
        if (!ControlPointService.instance) {
            ControlPointService.instance = new ControlPointService(
                controlPointRepository,
                machineRepository,
                mqttClient
            );
        }
        return ControlPointService.instance;
    }

    /**
     * Get all control points for a machine
     * @param machineId Machine ID
     */
    async getControlPointsByMachine({ machineId }: { machineId: string }): Promise<ControlPointData[]> {
        const machine = await this.machineRepository.getMachineById(machineId);
        if (!machine) {
            throw new NotFoundError(`Machine with ID ${machineId} not found`);
        }

        const controlPoints = await this.controlPointRepository.getControlPointsByMachine(machineId);
        return controlPoints.map(controlPoint => controlPoint.toJSON());
    }

    /**
     * Get current state of a control point
     * @param machineId Machine ID
     * @param controlPointId Control point ID
     */
    async getControlPointState({
        machineId,
        controlPointId
    }: {
        machineId: string;
        controlPointId: string
    }): Promise<ControlPointStateData> {
        const controlPoint = await this.controlPointRepository.getControlPointById(controlPointId);

        if (!controlPoint) {
            throw new NotFoundError(`Control point with ID ${controlPointId} not found`);
        }

        if (controlPoint.getMachineId() !== machineId) {
            throw new Error(`Control point ${controlPointId} does not belong to machine ${machineId}`);
        }

        return {
            id: controlPointId,
            reported: controlPoint.getCurrentReported(),
            target: controlPoint.getCurrentTarget(),
            status: controlPoint.getCurrentStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Set target value for a control point
     * @param machineId Machine ID
     * @param controlPointId Control point ID
     * @param value Target value
     */
    async setControlPointTarget({
        machineId,
        controlPointId,
        value
    }: {
        machineId: string;
        controlPointId: string;
        value: any
    }): Promise<boolean> {
        const controlPoint = await this.controlPointRepository.getControlPointById(controlPointId);

        if (!controlPoint) {
            throw new NotFoundError(`Control point with ID ${controlPointId} not found`);
        }

        if (controlPoint.getMachineId() !== machineId) {
            throw new Error(`Control point ${controlPointId} does not belong to machine ${machineId}`);
        }

        // Publish to MQTT topic (this will trigger the control point handler)
        const topic = `/machines/${machineId}/controlPoints/${controlPointId}/target`;
        const message = JSON.stringify(value);

        this.mqttClient.publish(topic, message);

        return true;
    }

    /**
     * Get the control point repository
     */
    getControlPointRepository(): ControlPointRepository {
        return this.controlPointRepository;
    }
}