import { Adapter } from '../base/Adapter';
import { ShellyMachine } from './ShellyMachine';
import { ShellyDataSource } from './ShellyDataSource';
import { ShellyControlPoint } from './ShellyControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ConfigLoader } from '../../common/ConfigLoader';
import { getValueFromPath } from '../../utils/dataUtils';

export class ShellyAdapter extends Adapter {
    constructor({
        mqttClient,
        config,
        pollIntervalMs = 5000
    }: {
        mqttClient: MqttClient;
        config: ConfigLoader;
        pollIntervalMs?: number;
    }) {
        super({
            name: 'shelly-adapter',
            mqttClient,
            config,
            pollIntervalMs
        });
    }

    async initialize(): Promise<void> {
        // Initialize machines from configuration
        const machinesConfig = this.config.getMachines();

        for (const machineConfig of machinesConfig) {
            const machine = new ShellyMachine({
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
                    const dataSource = new ShellyDataSource({
                        id: dataSourceConfig.id,
                        machineId: machine.getId(),
                        name: dataSourceConfig.name,
                        endpoint: dataSourceConfig.endpoint,
                        valuePath: dataSourceConfig.valuePath,
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
                    const controlPoint = new ShellyControlPoint({
                        id: controlPointConfig.id,
                        machineId: machine.getId(),
                        name: controlPointConfig.name,
                        endpoint: controlPointConfig.endpoint,
                        valueKey: controlPointConfig.valueKey,
                        valueOn: controlPointConfig.valueOn,
                        valueOff: controlPointConfig.valueOff,
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

            // Connect to the Shelly device
            try {
                await machine.connect();
                console.log(`Connected to machine ${machine.getId()} at ${machine.getConnection().ip}`);

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
            if (machine instanceof ShellyMachine) {
                await this.pollMachine(machine.getId());
            }
        }
    }

    private async pollMachine(machineId: string): Promise<void> {
        const machine = this.getMachine(machineId);

        if (!(machine instanceof ShellyMachine)) {
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
                if (dataSource instanceof ShellyDataSource) {
                    try {
                        // Fetch data from the Shelly device
                        const data = await machine.fetchData(dataSource.getEndpoint());

                        // Extract the value using the specified path
                        const value = getValueFromPath(data, dataSource.getValuePath());

                        // Update the data source
                        dataSource.updateValue(value);
                        dataSource.updateStatus('OK');
                    } catch (error) {
                        console.error(`Error polling data source ${dataSource.getId()}:`, error);
                        dataSource.updateStatus('ERROR');
                    }
                }
            }

            // Poll all control points for this machine to get their current reported state
            const controlPoints = this.getControlPointsByMachine(machineId);

            for (const controlPoint of controlPoints) {
                if (controlPoint instanceof ShellyControlPoint) {
                    try {
                        // Fetch current state from the Shelly device
                        const data = await machine.fetchData(controlPoint.getEndpoint());

                        // Extract the reported value
                        let reportedValue;

                        if (typeof data === 'object' && controlPoint.getValueKey() in data) {
                            reportedValue = data[controlPoint.getValueKey()];
                        } else {
                            reportedValue = data;
                        }

                        // Update the control point
                        controlPoint.updateReported(reportedValue);
                        controlPoint.updateStatus('OK');
                    } catch (error) {
                        console.error(`Error polling control point ${controlPoint.getId()}:`, error);
                        controlPoint.updateStatus('ERROR');
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

        if (!(machine instanceof ShellyMachine) || !(controlPoint instanceof ShellyControlPoint)) {
            console.error(`Cannot handle target change for ${controlPointId}: invalid machine or control point`);
            return;
        }

        if (!machine.isConnected()) {
            controlPoint.updateStatus('DISCONNECTED');
            console.error(`Cannot handle target change for ${controlPointId}: not connected to Shelly device`);
            return;
        }

        try {
            // Prepare parameters
            const params: Record<string, any> = {};

            // Handle boolean values for on/off controls
            if (typeof targetValue === 'boolean') {
                if (controlPoint.getValueOn() && controlPoint.getValueOff()) {
                    params[controlPoint.getValueKey()] = targetValue ? controlPoint.getValueOn() : controlPoint.getValueOff();
                } else {
                    params[controlPoint.getValueKey()] = targetValue ? 'on' : 'off';
                }
            }
            // Handle RGB colors
            else if (typeof targetValue === 'object' && 'red' in targetValue && 'green' in targetValue && 'blue' in targetValue) {
                params.red = targetValue.red;
                params.green = targetValue.green;
                params.blue = targetValue.blue;
            }
            // Handle numeric values
            else if (typeof targetValue === 'number') {
                // Check if value is within min/max range if specified

                const minValue = controlPoint.getMinValue();
                const maxValue = controlPoint.getMaxValue();

                if (minValue !== undefined && targetValue < minValue) {
                    targetValue = minValue;
                }

                if (maxValue !== undefined && targetValue > maxValue) {
                    targetValue = maxValue;
                }

                params[controlPoint.getValueKey()] = targetValue;
            }
            // Handle string values
            else if (typeof targetValue === 'string') {
                params[controlPoint.getValueKey()] = targetValue;
            }

            // Send command to the Shelly device
            await machine.sendCommand(controlPoint.getEndpoint(), params);

            // Update reported value (will be corrected on next poll if write failed)
            controlPoint.updateReported(targetValue);
            controlPoint.updateStatus('OK');

            console.log(`Control point ${controlPointId} target value set to:`, targetValue);
        } catch (error) {
            console.error(`Error setting target value for ${controlPointId}:`, error);
            controlPoint.updateStatus('ERROR');
        }
    }
}