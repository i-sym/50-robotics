import { Adapter } from '../base/Adapter';
import { S7Machine } from './S7Machine';
import { S7DataSource } from './S7DataSource';
import { S7ControlPoint } from './S7ControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ConfigLoader } from '../../common/ConfigLoader';

export class S7Adapter extends Adapter {
    constructor({
        mqttClient,
        config,
        pollIntervalMs = 1000
    }: {
        mqttClient: MqttClient;
        config: ConfigLoader;
        pollIntervalMs?: number;
    }) {
        super({
            name: 's7-adapter',
            mqttClient,
            config,
            pollIntervalMs
        });
    }

    async initialize(): Promise<void> {
        // Initialize machines from configuration
        const machinesConfig = this.config.getMachines();

        for (const machineConfig of machinesConfig) {
            const machine = new S7Machine({
                id: machineConfig.id,
                name: machineConfig.name,
                connection: machineConfig.connection,
                dataSources: machineConfig.dataSources?.map((ds: any) => ds.id) || [],
                controlPoints: machineConfig.controlPoints?.map((cp: any) => cp.id) || []
            });

            this.machines.set(machine.getId(), machine);

            // Initialize data sources
            if (machineConfig.dataSources && Array.isArray(machineConfig.dataSources)) {
                for (const dataSourceConfig of machineConfig.dataSources) {
                    const dataSource = new S7DataSource({
                        id: dataSourceConfig.id,
                        machineId: machine.getId(),
                        name: dataSourceConfig.name,
                        address: dataSourceConfig.address,
                        dataType: dataSourceConfig.dataType,
                        scaleFactor: dataSourceConfig.scaleFactor,
                        offset: dataSourceConfig.offset,
                        mqttClient: this.mqttClient
                    });

                    this.dataSources.set(dataSource.getId(), dataSource);
                }
            }

            // Initialize control points
            if (machineConfig.controlPoints && Array.isArray(machineConfig.controlPoints)) {
                for (const controlPointConfig of machineConfig.controlPoints) {
                    const controlPoint = new S7ControlPoint({
                        id: controlPointConfig.id,
                        machineId: machine.getId(),
                        name: controlPointConfig.name,
                        address: controlPointConfig.address,
                        dataType: controlPointConfig.dataType,
                        mqttClient: this.mqttClient
                    });

                    // Set callback for handling target change
                    controlPoint.setTargetChangeCallback(async (value: any) => {
                        await this.handleControlPointTargetChange(machine.getId(), controlPoint.getId(), value);
                    });

                    this.controlPoints.set(controlPoint.getId(), controlPoint);
                }
            }

            // Connect to the PLC
            try {
                await machine.connect();
                console.log(`Connected to machine ${machine.getId()} at ${machine.getConnection().ip}`);

                // Setup variables after connection
                const s7Connection = machine.getS7Connection();
                if (s7Connection) {
                    // Add all data sources as variables
                    for (const dataSource of this.getDataSourcesByMachine(machine.getId())) {
                        if (dataSource instanceof S7DataSource) {
                            s7Connection.addVariable(dataSource.getId(), dataSource.getAddress());
                        }
                    }

                    // Add all control points as variables
                    for (const controlPoint of this.getControlPointsByMachine(machine.getId())) {
                        if (controlPoint instanceof S7ControlPoint) {
                            s7Connection.addVariable(controlPoint.getId(), controlPoint.getAddress());
                        }
                    }

                    // Set up variables after adding them
                    s7Connection.setupVariables();
                }

                // Update status for data sources and control points
                await this.updateMachineComponentsStatus(machine.getId(), 'OK');
            } catch (error) {
                console.error(`Failed to connect to machine ${machine.getId()}:`, error);

                // Update status for data sources and control points
                await this.updateMachineComponentsStatus(machine.getId(), 'DISCONNECTED');
            }
        }
    }

    async pollAllMachines(): Promise<void> {
        for (const machine of this.getAllMachines()) {
            if (machine instanceof S7Machine) {
                await this.pollMachine(machine.getId());
            }
        }
    }

    private async pollMachine(machineId: string): Promise<void> {
        const machine = this.getMachine(machineId);

        if (!(machine instanceof S7Machine)) {
            return;
        }

        if (!machine.isConnected()) {
            await this.updateMachineComponentsStatus(machineId, 'DISCONNECTED');

            // Try to reconnect
            try {
                await machine.connect();
                await this.updateMachineComponentsStatus(machineId, 'OK');
            } catch (error) {
                console.error(`Failed to reconnect to machine ${machineId}:`, error);
                return;
            }
        }

        try {
            // Read all variables from the PLC
            const values = await machine.readVariables();

            // Update data sources
            for (const dataSource of this.getDataSourcesByMachine(machineId)) {
                if (dataSource instanceof S7DataSource) {
                    if (dataSource.getId() in values) {
                        dataSource.updateValue(values[dataSource.getId()]);
                        dataSource.updateStatus('OK');
                    }
                }
            }

            // Update control points reported values
            for (const controlPoint of this.getControlPointsByMachine(machineId)) {
                if (controlPoint instanceof S7ControlPoint) {
                    if (controlPoint.getId() in values) {
                        controlPoint.updateReported(values[controlPoint.getId()]);
                        controlPoint.updateStatus('OK');
                    }
                }
            }
        } catch (error) {
            console.error(`Error polling machine ${machineId}:`, error);
            await this.updateMachineComponentsStatus(machineId, 'ERROR');
        }
    }

    private async handleControlPointTargetChange(
        machineId: string,
        controlPointId: string,
        targetValue: any
    ): Promise<void> {
        const machine = this.getMachine(machineId);
        const controlPoint = this.getControlPoint(controlPointId);

        if (!(machine instanceof S7Machine) || !(controlPoint instanceof S7ControlPoint)) {
            console.error(`Cannot handle target change for ${controlPointId}: invalid machine or control point`);
            return;
        }

        if (!machine.isConnected()) {
            controlPoint.updateStatus('DISCONNECTED');
            console.error(`Cannot handle target change for ${controlPointId}: not connected to PLC`);
            return;
        }

        try {
            // Write value to PLC
            await machine.writeVariable(controlPointId, targetValue);

            // Update reported value (will be corrected on next poll if write failed)
            controlPoint.updateReported(targetValue);
            controlPoint.updateStatus('OK');

            console.log(`Control point ${controlPointId} target value ${targetValue} written to PLC`);
        } catch (error) {
            console.error(`Error writing target value for ${controlPointId}:`, error);
            controlPoint.updateStatus('ERROR');
        }
    }
}