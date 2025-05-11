import { Adapter } from '../base/Adapter';
import { UccncMachine } from './UccncMachine';
import { UccncDataSource } from './UccncDataSource';
import { UccncControlPoint } from './UccncControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ConfigLoader } from '../../common/ConfigLoader';

export class UccncAdapter extends Adapter {
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
            name: 'uccnc-adapter',
            mqttClient,
            config,
            pollIntervalMs
        });
    }

    async initialize(): Promise<void> {
        // Initialize machines from configuration
        const machinesConfig = this.config.getMachines();

        for (const machineConfig of machinesConfig) {
            const machine = new UccncMachine({
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
                    const dataSource = new UccncDataSource({
                        id: dataSourceConfig.id,
                        machineId: machine.getId(),
                        name: dataSourceConfig.name,
                        variable: dataSourceConfig.variable,
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
                    const controlPoint = new UccncControlPoint({
                        id: controlPointConfig.id,
                        machineId: machine.getId(),
                        name: controlPointConfig.name,
                        command: controlPointConfig.command,
                        minValue: controlPointConfig.minValue,
                        maxValue: controlPointConfig.maxValue,
                        mqttClient: this.mqttClient
                    });

                    // Set callback for handling target change
                    controlPoint.setTargetChangeCallback(async (value: any) => {
                        await this.handleControlPointTargetChange(machine.getId(), controlPoint.getId(), value);
                    });

                    this.controlPoints.set(controlPoint.getId(), controlPoint);
                }
            }

            // Connect to the UCCNC machine
            try {
                await machine.connect();
                console.log(`Connected to machine ${machine.getId()} at ${machine.getConnection().ip}:${machine.getConnection().port}`);

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
            if (machine instanceof UccncMachine) {
                await this.pollMachine(machine.getId());
            }
        }
    }

    private async pollMachine(machineId: string): Promise<void> {
        const machine = this.getMachine(machineId);

        if (!(machine instanceof UccncMachine)) {
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
            // Poll all data sources for this machine
            const dataSources = this.getDataSourcesByMachine(machineId);

            for (const dataSource of dataSources) {
                if (dataSource instanceof UccncDataSource) {
                    try {
                        // Fetch variable value from UCCNC
                        const value = await machine.getVariable(dataSource.getVariable());

                        // Update the data source
                        dataSource.updateValue(value);
                        dataSource.updateStatus('OK');
                    } catch (error) {
                        console.error(`Error polling data source ${dataSource.getId()}:`, error);
                        dataSource.updateStatus('ERROR');
                    }
                }
            }

            // For control points, we don't need to poll for reported values
            // In a real implementation, you might want to fetch the current state of control points
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

        if (!controlPoint) {
            console.error(`Control point ${controlPointId} not found`);
            return;
        }

        if (!(machine instanceof UccncMachine) || !(controlPoint instanceof UccncControlPoint)) {
            console.error(`Cannot handle target change for ${controlPointId}: invalid machine or control point`);
            return;
        }

        if (!machine.isConnected()) {
            controlPoint.updateStatus('DISCONNECTED');
            console.error(`Cannot handle target change for ${controlPointId}: not connected to UCCNC machine`);
            return;
        }

        try {
            // Validate target value if min/max specified
            if (typeof targetValue === 'number') {

                const minValue = controlPoint.getMinValue();
                const maxValue = controlPoint.getMaxValue();

                if (minValue !== undefined && targetValue < minValue) {
                    targetValue = controlPoint.getMinValue();
                }
                if (maxValue !== undefined && targetValue > maxValue) {
                    targetValue = controlPoint.getMaxValue();
                }
            }

            // Send command to UCCNC
            await machine.sendCommand(controlPoint.getCommand(), targetValue);

            // Update reported value
            controlPoint.updateReported(targetValue);
            controlPoint.updateStatus('OK');

            console.log(`Control point ${controlPointId} target value set to:`, targetValue);
        } catch (error) {
            console.error(`Error setting target value for ${controlPointId}:`, error);
            controlPoint.updateStatus('ERROR');
        }
    }
}