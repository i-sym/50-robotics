import { Machine } from '../domain/Machine';
import { MachineRepository } from '../repositories/MachineRepository';
import { NotFoundError } from '../common/errors';
import { MachineData } from '../schemas';

export class MachineService {
    private static instance: MachineService;
    private machineRepository: MachineRepository;

    private constructor(machineRepository: MachineRepository) {
        this.machineRepository = machineRepository;
    }

    public static getInstance(machineRepository: MachineRepository): MachineService {
        if (!MachineService.instance) {
            MachineService.instance = new MachineService(machineRepository);
        }
        return MachineService.instance;
    }

    /**
     * Get all machines
     */
    async getMachines(): Promise<MachineData[]> {
        const machines = await this.machineRepository.getAllMachines();
        return machines.map(machine => machine.toJSON());
    }

    /**
     * Get a machine by ID
     * @param id Machine ID
     */
    async getMachineById({ id }: { id: string }): Promise<MachineData | null> {
        const machine = await this.machineRepository.getMachineById(id);
        if (!machine) {
            throw new NotFoundError(`Machine with ID ${id} not found`);
        }
        return machine.toJSON();
    }

    /**
     * Get the machine repository
     */
    getMachineRepository(): MachineRepository {
        return this.machineRepository;
    }
}
