import { MachineRepository } from '../repositories/MachineRepository';
import { DataSourceRepository } from '../repositories/DataSourceRepository';
import { ControlPointRepository } from '../repositories/ControlPointRepository';
import { MqttClient } from '../infrastructure/MqttClient';
import { S7Connection } from '../infrastructure/S7Connection';

export class S7AdapterService {
    private static instance: S7AdapterService;
    private machineRepository: MachineRepository;
    private dataSourceRepository: DataSourceRepository;
    private controlPointRepository: ControlPointRepository;
    private mqttClient: MqttClient;
    private connections: Map<string, S7Connection> = new Map();
    private pollingInterval: NodeJS.Timeout | null = null;
    private pollIntervalMs: number;

    private constructor({
        machineRepository,
        dataSourceRepository,
        controlPointRepository,
        mqttClient,
        pollIntervalMs = 1000
    }: {
        machineRepository: MachineRepository;
        dataSourceRepository: DataSourceRepository;
        controlPointRepository: ControlPointRepository;
        mqttClient: MqttClient;
        pollIntervalMs?: number;
    }) {
        this.machineRepository = machineRepository;
        this.dataSourceRepository = dataSourceRepository;
        this.controlPointRepository = controlPointRepository;
        this.mqttClient = mqttClient;
        this.pollIntervalMs = pollIntervalMs;
    }

    public static getInstance({
        machineRepository,
        dataSourceRepository,
        controlPointRepository,
        mqttClient,
        pollIntervalMs = 1000
    }: {
        machineRepository: MachineRepository;
        dataSourceRepository: DataSourceRepository;
        controlPointRepository: ControlPointRepository;
        mqttClient: MqttClient;
        pollIntervalMs?: number;
    }): S7AdapterService {
        if (!S7AdapterService.instance) {
            S7AdapterService.instance = new S7AdapterService({
                machineRepository,
                dataSourceRepository,
                controlPointRepository,
                mqttClient,
                pollIntervalMs
            });
        }
        return S7AdapterService.instance;
    }

    /**
     * Initialize the adapter by setting up connections and subscriptions
     */
    async initialize(): Promise<void> {
        const machines = await this.machineRepository.getAllMachines();

        for (const machine of machines) {
            // Create S7 connection for each machine
            const connection = new S7Connection(machine);
            this.connections.set(machine.getId(), connection);

            // Set up variable addresses in the connection
            const dataSources = await this.dataSourceRepository.getDataSourcesByMachine(machine.getId());
            for (const dataSource of dataSources) {
                connection.addVariable(dataSource.getId(), dataSource.getAddress());
            }

            const controlPoints = await this.controlPointRepository.getControlPointsByMachine(machine.getId());
            for (const controlPoint of controlPoints) {
                connection.addVariable(controlPoint.getId(), controlPoint.getAddress());

                // Set up target change callback for the control point
                controlPoint.setTargetChangeCallback(async (value: any) => {
                    await this.handleControlPointTargetChange(machine.getId(), controlPoint.getId(), value);
                });
            }

            // Connect to the PLC
            try {
                await connection.connect();
                console.log(`Connected to machine ${machine.getId()} at ${machine.getConnection().ip}`);

                // Set up variables after connection
                connection.setupVariables();

                // Update status for data sources and control points
                this.updateMachineComponentsStatus(machine.getId(), 'OK');
            } catch (error) {
                console.error(`Failed to connect to machine ${machine.getId()}:`, error);

                // Update status for data sources and control points
                this.updateMachineComponentsStatus(machine.getId(), 'DISCONNECTED');
            }
        }
    }

    /**
     * Start polling for data from all machines
     */
    startPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            await this.pollAllMachines();
        }, this.pollIntervalMs);

        console.log(`Started polling with interval ${this.pollIntervalMs}ms`);
    }

    /**
     * Stop polling
     */
    stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Stopped polling');
        }
    }

    /**
     * Poll all machines for data
     */
    private async pollAllMachines(): Promise<void> {
        const machines = await this.machineRepository.getAllMachines();

        for (const machine of machines) {
            await this.pollMachine(machine.getId());
        }
    }

    /**
     * Poll a specific machine for data
     * @param machineId Machine ID
     */
    private async pollMachine(machineId: string): Promise<void> {
        const connection = this.connections.get(machineId);

        if (!connection || !connection.isConnected()) {
            this.updateMachineComponentsStatus(machineId, 'DISCONNECTED');

            // Try to reconnect
            try {
                await connection?.connect();
                connection?.setupVariables();
                this.updateMachineComponentsStatus(machineId, 'OK');
            } catch (error) {
                console.error(`Failed to reconnect to machine ${machineId}:`, error);
                return;
            }
        }

        try {

            if (!connection) {
                console.error(`No connection found for machine ${machineId}`);
                return;
            }

            // Read all variables from the PLC
            const values = await connection.readVariables();

            // Update data sources
            const dataSources = await this.dataSourceRepository.getDataSourcesByMachine(machineId);
            for (const dataSource of dataSources) {
                if (dataSource.getId() in values) {
                    dataSource.updateValue(values[dataSource.getId()]);
                    dataSource.updateStatus('OK');
                }
            }

            // Update control points reported values
            const controlPoints = await this.controlPointRepository.getControlPointsByMachine(machineId);
            for (const controlPoint of controlPoints) {
                if (controlPoint.getId() in values) {
                    controlPoint.updateReported(values[controlPoint.getId()]);
                    controlPoint.updateStatus('OK');
                }
            }
        } catch (error) {
            console.error(`Error polling machine ${machineId}:`, error);
            this.updateMachineComponentsStatus(machineId, 'ERROR');
        }
    }

    /**
     * Handle a target change for a control point
     * @param machineId Machine ID
     * @param controlPointId Control point ID
     * @param targetValue Target value
     */
    private async handleControlPointTargetChange(
        machineId: string,
        controlPointId: string,
        targetValue: any
    ): Promise<void> {
        const connection = this.connections.get(machineId);
        const controlPoint = await this.controlPointRepository.getControlPointById(controlPointId);

        if (!connection || !controlPoint) {
            console.error(`Cannot handle target change for ${controlPointId}: connection or control point not found`);
            return;
        }

        if (!connection.isConnected()) {
            controlPoint.updateStatus('DISCONNECTED');
            console.error(`Cannot handle target change for ${controlPointId}: not connected to PLC`);
            return;
        }

        try {
            // Write value to PLC
            await connection.writeVariable(controlPointId, targetValue);

            // Update reported value (will be corrected on next poll if write failed)
            controlPoint.updateReported(targetValue);
            controlPoint.updateStatus('OK');

            console.log(`Control point ${controlPointId} target value ${targetValue} written to PLC`);
        } catch (error) {
            console.error(`Error writing target value for ${controlPointId}:`, error);
            controlPoint.updateStatus('ERROR');
        }
    }

    /**
     * Update the status of all data sources and control points for a machine
     * @param machineId Machine ID
     * @param status Status to set
     */
    private async updateMachineComponentsStatus(
        machineId: string,
        status: 'OK' | 'ERROR' | 'DISCONNECTED'
    ): Promise<void> {
        // Update data sources status
        const dataSources = await this.dataSourceRepository.getDataSourcesByMachine(machineId);
        for (const dataSource of dataSources) {
            dataSource.updateStatus(status);
        }

        // Update control points status
        const controlPoints = await this.controlPointRepository.getControlPointsByMachine(machineId);
        for (const controlPoint of controlPoints) {
            controlPoint.updateStatus(status);
        }
    }

    /**
     * Disconnect all connections
     */
    async disconnect(): Promise<void> {
        // Stop polling
        this.stopPolling();

        // Disconnect all connections
        for (const [machineId, connection] of this.connections.entries()) {
            connection.disconnect();
            await this.updateMachineComponentsStatus(machineId, 'DISCONNECTED');
        }

        console.log('All PLC connections closed');
    }

    /**
     * Get the MQTT client
     */
    getMqttClient(): MqttClient {
        return this.mqttClient;
    }
}