import { Machine } from '../domain/Machine';
import { ConfigLoader } from '../common/ConfigLoader';

export class MachineRepository {
    private machines: Map<string, Machine> = new Map();
    private config: ConfigLoader;

    constructor(config: ConfigLoader) {
        this.config = config;
        this.initialize();
    }

    private initialize(): void {
        // Initialize machines from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machine = new Machine({
                    id: machineConfig.id,
                    name: machineConfig.name,
                    connection: machineConfig.connection,
                    dataSources: machineConfig.dataSources?.map((ds: any) => ds.id) || [],
                    controlPoints: machineConfig.controlPoints?.map((cp: any) => cp.id) || []
                });

                this.machines.set(machine.getId(), machine);
            }
        }
    }

    async getAllMachines(): Promise<Machine[]> {
        return Array.from(this.machines.values());
    }

    async getMachineById(id: string): Promise<Machine | null> {
        const machine = this.machines.get(id);
        return machine || null;
    }

    async saveMachine(machine: Machine): Promise<Machine> {
        this.machines.set(machine.getId(), machine);
        return machine;
    }
}
