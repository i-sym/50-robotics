import { ControlPoint } from '../../domain/base/ControlPoint';

export abstract class ControlPointRepository<T extends ControlPoint> {
    protected controlPoints: Map<string, T> = new Map();

    async getAllControlPoints(): Promise<T[]> {
        return Array.from(this.controlPoints.values());
    }

    async getControlPointById(id: string): Promise<T | null> {
        const controlPoint = this.controlPoints.get(id);
        return controlPoint || null;
    }

    async getControlPointsByMachine(machineId: string): Promise<T[]> {
        return Array.from(this.controlPoints.values())
            .filter(cp => cp.getMachineId() === machineId);
    }

    async saveControlPoint(controlPoint: T): Promise<T> {
        this.controlPoints.set(controlPoint.getId(), controlPoint);
        return controlPoint;
    }

    abstract initialize(): void;
}