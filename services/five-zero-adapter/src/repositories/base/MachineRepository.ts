import { Machine } from '../../domain/base/Machine';

export abstract class MachineRepository<T extends Machine> {
    protected machines: Map<string, T> = new Map();

    async getAllMachines(): Promise<T[]> {
        return Array.from(this.machines.values());
    }

    async getMachineById(id: string): Promise<T | null> {
        const machine = this.machines.get(id);
        return machine || null;
    }

    async saveMachine(machine: T): Promise<T> {
        this.machines.set(machine.getId(), machine);
        return machine;
    }

    abstract initialize(): void;
}