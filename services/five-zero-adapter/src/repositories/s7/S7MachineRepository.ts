import { MachineRepository } from '../base/MachineRepository';
import { S7Machine } from '../../domain/s7/S7Machine';
import { ConfigLoader } from '../../common/ConfigLoader';

export class S7MachineRepository extends MachineRepository<S7Machine> {
    private config: ConfigLoader;

    constructor(config: ConfigLoader) {
        super();
        this.config = config;
        this.initialize();
    }

    initialize(): void {
        // Initialize machines from configuration
        if (this.config.getMachines() && Array.isArray(this.config.getMachines())) {
            for (const machineConfig of this.config.getMachines()) {
                const machine = new S7Machine({
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
}