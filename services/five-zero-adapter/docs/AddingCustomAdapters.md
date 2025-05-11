# Adding Custom Adapters

The Five-Zero Industrial IoT Platform is designed to be extensible with support for custom adapters. This guide explains how to create a custom adapter for your specific industrial equipment or protocol.

## Overview

Creating a custom adapter involves these main steps:

1. Create the adapter domain models
2. Implement the protocol-specific connection
3. Create repositories for your adapter
4. Implement the adapter service
5. Register your adapter with the factory
6. Create the configuration schema

## Prerequisites

Before creating a custom adapter, you should:

1. Be familiar with TypeScript and object-oriented programming
2. Understand the Five-Zero adapter architecture
3. Have documentation for the protocol you're implementing
4. Have access to the equipment for testing

## Step 1: Create Adapter Domain Models

Start by creating domain model classes that extend the base classes:

### Custom Machine

```typescript
// src/domain/custom/CustomMachine.ts
import { Machine } from '../base/Machine';
import { CustomConnection } from '../../infrastructure/custom/CustomConnection';

export interface CustomConnectionConfig {
  // Define your connection properties here
  host: string;
  port: number;
  // Add any other required properties
}

export class CustomMachine extends Machine {
  private connection: CustomConnectionConfig;
  private customConnection: CustomConnection | null = null;
  
  constructor({
    id,
    name,
    connection,
    dataSources = [],
    controlPoints = []
  }: {
    id: string;
    name: string;
    connection: CustomConnectionConfig;
    dataSources?: string[];
    controlPoints?: string[];
  }) {
    super({
      id,
      name,
      dataSources,
      controlPoints
    });
    this.connection = connection;
  }
  
  getConnection(): CustomConnectionConfig {
    return this.connection;
  }
  
  getCustomConnection(): CustomConnection | null {
    return this.customConnection;
  }
  
  async connect(): Promise<void> {
    if (!this.customConnection) {
      this.customConnection = new CustomConnection(this);
    }
    
    if (!this.customConnection.isConnected()) {
      await this.customConnection.connect();
    }
  }
  
  disconnect(): void {
    if (this.customConnection) {
      this.customConnection.disconnect();
      this.customConnection = null;
    }
  }
  
  isConnected(): boolean {
    return this.customConnection !== null && this.customConnection.isConnected();
  }
  
  // Add any protocol-specific methods here
  
  toJSON(): any {
    return {
      id: this.getId(),
      name: this.getName(),
      connection: this.connection,
      dataSources: this.getDataSources(),
      controlPoints: this.getControlPoints()
    };
  }
  
  static fromJSON(data: any): CustomMachine {
    return new CustomMachine({
      id: data.id,
      name: data.name,
      connection: data.connection,
      dataSources: data.dataSources || [],
      controlPoints: data.controlPoints || []
    });
  }
}
```

### Custom Data Source

```typescript
// src/domain/custom/CustomDataSource.ts
import { DataSource } from '../base/DataSource';
import { MqttClient } from '../../infrastructure/MqttClient';

export class CustomDataSource extends DataSource {
  private parameter: string;
  // Add any other custom properties
  
  constructor({
    id,
    machineId,
    name,
    parameter,
    scaleFactor = 1,
    offset = 0,
    mqttClient
  }: {
    id: string;
    machineId: string;
    name: string;
    parameter: string;
    scaleFactor?: number;
    offset?: number;
    mqttClient: MqttClient;
  }) {
    super({
      id,
      machineId,
      name,
      scaleFactor,
      offset,
      mqttClient
    });
    this.parameter = parameter;
  }
  
  getParameter(): string {
    return this.parameter;
  }
  
  // Add any other protocol-specific methods
  
  toJSON(): any {
    return {
      id: this.getId(),
      machineId: this.getMachineId(),
      name: this.getName(),
      parameter: this.parameter,
      scaleFactor: this.getScaleFactor(),
      offset: this.getOffset()
    };
  }
  
  static fromJSON(data: any, mqttClient: MqttClient): CustomDataSource {
    return new CustomDataSource({
      id: data.id,
      machineId: data.machineId,
      name: data.name,
      parameter: data.parameter,
      scaleFactor: data.scaleFactor,
      offset: data.offset,
      mqttClient
    });
  }
}
```

### Custom Control Point

```typescript
// src/domain/custom/CustomControlPoint.ts
import { ControlPoint } from '../base/ControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';

export class CustomControlPoint extends ControlPoint {
  private command: string;
  private minValue?: number;
  private maxValue?: number;
  // Add any other custom properties
  
  constructor({
    id,
    machineId,
    name,
    command,
    minValue,
    maxValue,
    mqttClient
  }: {
    id: string;
    machineId: string;
    name: string;
    command: string;
    minValue?: number;
    maxValue?: number;
    mqttClient: MqttClient;
  }) {
    super({
      id,
      machineId,
      name,
      mqttClient
    });
    this.command = command;
    this.minValue = minValue;
    this.maxValue = maxValue;
  }
  
  getCommand(): string {
    return this.command;
  }
  
  getMinValue(): number | undefined {
    return this.minValue;
  }
  
  getMaxValue(): number | undefined {
    return this.maxValue;
  }
  
  // Add any other protocol-specific methods
  
  toJSON(): any {
    return {
      id: this.getId(),
      machineId: this.getMachineId(),
      name: this.getName(),
      command: this.command,
      minValue: this.minValue,
      maxValue: this.maxValue
    };
  }
  
  static fromJSON(data: any, mqttClient: MqttClient): CustomControlPoint {
    return new CustomControlPoint({
      id: data.id,
      machineId: data.machineId,
      name: data.name,
      command: data.command,
      minValue: data.minValue,
      maxValue: data.maxValue,
      mqttClient
    });
  }
}
```

## Step 2: Implement the Protocol-Specific Connection

Create a connection class that handles the communication with your device:

```typescript
// src/infrastructure/custom/CustomConnection.ts
import { CustomMachine } from '../../domain/custom/CustomMachine';
import { ConnectionError, ProtocolError } from '../../common/errors';

export class CustomConnection {
  private machine: CustomMachine;
  private connected: boolean = false;
  private client: any = null; // Replace with your protocol client library
  
  constructor(machine: CustomMachine) {
    this.machine = machine;
  }
  
  async connect(): Promise<void> {
    try {
      const { host, port } = this.machine.getConnection();
      
      // Initialize your protocol client
      // this.client = new YourProtocolClient();
      
      // Connect to the device
      // await this.client.connect({ host, port });
      
      // For this example, we'll simulate a successful connection
      this.connected = true;
    } catch (error) {
      this.connected = false;
      throw new ConnectionError(`Failed to connect to device at ${this.machine.getConnection().host}: ${error}`);
    }
  }
  
  async readParameter(parameter: string): Promise<any> {
    if (!this.connected) {
      throw new ConnectionError('Not connected to device');
    }
    
    try {
      // Implement your protocol-specific read logic
      // return await this.client.readParameter(parameter);
      
      // For this example, we'll return a random value
      return Math.random() * 100;
    } catch (error) {
      throw new ProtocolError(`Failed to read parameter ${parameter}: ${error}`);
    }
  }
  
  async writeCommand(command: string, value: any): Promise<void> {
    if (!this.connected) {
      throw new ConnectionError('Not connected to device');
    }
    
    try {
      // Implement your protocol-specific write logic
      // await this.client.writeCommand(command, value);
      
      // For this example, we'll just log the command
      console.log(`Writing command ${command} with value ${value}`);
    } catch (error) {
      throw new ProtocolError(`Failed to write command ${command}: ${error}`);
    }
  }
  
  disconnect(): void {
    if (this.client) {
      // Disconnect from the device
      // this.client.disconnect();
      this.client = null;
    }
    this.connected = false;
  }
  
  isConnected(): boolean {
    return this.connected;
  }
}
```

## Step 3: Create Adapter Class

Create your custom adapter class that extends the base Adapter class:

```typescript
// src/domain/custom/CustomAdapter.ts
import { Adapter } from '../base/Adapter';
import { CustomMachine } from './CustomMachine';
import { CustomDataSource } from './CustomDataSource';
import { CustomControlPoint } from './CustomControlPoint';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ConfigLoader } from '../../common/ConfigLoader';

export class CustomAdapter extends Adapter {
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
      name: 'custom-adapter',
      mqttClient,
      config,
      pollIntervalMs
    });
  }
  
  async initialize(): Promise<void> {
    // Initialize machines from configuration
    const machinesConfig = this.config.getMachines();
    
    for (const machineConfig of machinesConfig) {
      const machine = new CustomMachine({
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
          const dataSource = new CustomDataSource({
            id: dataSourceConfig.id,
            machineId: machine.getId(),
            name: dataSourceConfig.name,
            parameter: dataSourceConfig.parameter,
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
          const controlPoint = new CustomControlPoint({
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
      
      // Connect to the device
      try {
        await machine.connect();
        console.log(`Connected to machine ${machine.getId()} at ${machine.getConnection().host}`);
        
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
      if (machine instanceof CustomMachine) {
        await this.pollMachine(machine.getId());
      }
    }
  }
  
  private async pollMachine(machineId: string): Promise<void> {
    const machine = this.getMachine(machineId);
    
    if (!(machine instanceof CustomMachine)) {
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
        if (dataSource instanceof CustomDataSource) {
          try {
            // Read parameter from the device
            const customConnection = machine.getCustomConnection();
            if (customConnection) {
              const value = await customConnection.readParameter(dataSource.getParameter());
              
              // Update the data source
              dataSource.updateValue(value);
              dataSource.updateStatus('OK');
            }
          } catch (error) {
            console.error(`Error polling data source ${dataSource.getId()}:`, error);
            dataSource.updateStatus('ERROR');
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
    
    if (!(machine instanceof CustomMachine) || !(controlPoint instanceof CustomControlPoint)) {
      console.error(`Cannot handle target change for ${controlPointId}: invalid machine or control point`);
      return;
    }
    
    if (!machine.isConnected()) {
      controlPoint.updateStatus('DISCONNECTED');
      console.error(`Cannot handle target change for ${controlPointId}: not connected to device`);
      return;
    }
    
    try {
      // Validate target value if min/max specified
      if (typeof targetValue === 'number') {
        if (controlPoint.getMinValue() !== undefined && targetValue < controlPoint.getMinValue()) {
          targetValue = controlPoint.getMinValue();
        }
        if (controlPoint.getMaxValue() !== undefined && targetValue > controlPoint.getMaxValue()) {
          targetValue = controlPoint.getMaxValue();
        }
      }
      
      // Send command to the device
      const customConnection = machine.getCustomConnection();
      if (customConnection) {
        await customConnection.writeCommand(controlPoint.getCommand(), targetValue);
      }
      
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
```

## Step 4: Create Repositories for Your Adapter

Create repositories to manage your adapter's entities:

```typescript
// src/repositories/custom/CustomMachineRepository.ts
import { MachineRepository } from '../base/MachineRepository';
import { CustomMachine } from '../../domain/custom/CustomMachine';
import { ConfigLoader } from '../../common/ConfigLoader';

export class CustomMachineRepository extends MachineRepository<CustomMachine> {
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
        const machine = new CustomMachine({
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
```

Repeat this pattern for `CustomDataSourceRepository` and `CustomControlPointRepository`.

## Step 5: Implement the Adapter Service

Create a service class for your adapter:

```typescript
// src/services/custom/CustomAdapterService.ts
import { AdapterService } from '../base/AdapterService';
import { CustomAdapter } from '../../domain/custom/CustomAdapter';
import { ConfigLoader } from '../../common/ConfigLoader';
import { MqttClient } from '../../infrastructure/MqttClient';

export class CustomAdapterService extends AdapterService {
  constructor(adapter: CustomAdapter) {
    super(adapter);
  }
  
  static getInstance(config: ConfigLoader, mqttClient: MqttClient): CustomAdapterService {
    const adapter = new CustomAdapter({
      mqttClient,
      config,
      pollIntervalMs: config.getPollIntervalMs()
    });
    
    return new CustomAdapterService(adapter);
  }
}
```

## Step 6: Register Your Adapter with the Factory

Update the adapter factory to support your custom adapter:

```typescript
// src/factories/AdapterFactory.ts
import { AdapterService } from '../services/base/AdapterService';
import { S7AdapterService } from '../services/s7/S7AdapterService';
import { ShellyAdapterService } from '../services/shelly/ShellyAdapterService';
import { UccncAdapterService } from '../services/uccnc/UccncAdapterService';
import { CustomAdapterService } from '../services/custom/CustomAdapterService';
import { ConfigLoader } from '../common/ConfigLoader';
import { MqttClient } from '../infrastructure/MqttClient';

/**
 * Factory class for creating the appropriate adapter service based on configuration
 */
export class AdapterFactory {
  static createAdapterService(config: ConfigLoader, mqttClient: MqttClient): AdapterService {
    const adapterType = config.getAdapterType().toLowerCase();
    
    switch (adapterType) {
      case 's7':
        console.log('Creating S7 Protocol Adapter Service');
        return S7AdapterService.getInstance(config, mqttClient);
      
      case 'shelly':
        console.log('Creating Shelly Adapter Service');
        return ShellyAdapterService.getInstance(config, mqttClient);
      
      case 'uccnc':
        console.log('Creating UCCNC Adapter Service');
        return UccncAdapterService.getInstance(config, mqttClient);
      
      case 'custom':
        console.log('Creating Custom Adapter Service');
        return CustomAdapterService.getInstance(config, mqttClient);
      
      default:
        throw new Error(`Unsupported adapter type: ${adapterType}`);
    }
  }
}
```

## Step 7: Create a Configuration Schema for Your Adapter

Create a JSON schema for your adapter's configuration:

```typescript
// src/schemas/CustomSchema.ts
import { z } from 'zod';

export const CustomConnectionSchema = z.object({
  host: z.string().describe('Hostname or IP address of the device'),
  port: z.number().int().describe('Port number of the device'),
  // Add other connection properties
});

export const CustomDataSourceSchema = z.object({
  id: z.string().describe('Unique identifier for the data source'),
  name: z.string().min(1).describe('Name of the data source'),
  parameter: z.string().min(1).describe('Parameter to read from the device'),
  scaleFactor: z.number().optional().default(1).describe('Scale factor to apply to the raw value'),
  offset: z.number().optional().default(0).describe('Offset to apply to the raw value after scaling')
});

export const CustomControlPointSchema = z.object({
  id: z.string().describe('Unique identifier for the control point'),
  name: z.string().min(1).describe('Name of the control point'),
  command: z.string().min(1).describe('Command to send to the device'),
  minValue: z.number().optional().describe('Minimum allowed value'),
  maxValue: z.number().optional().describe('Maximum allowed value')
});

export const CustomMachineSchema = z.object({
  id: z.string().describe('Unique identifier for the machine'),
  name: z.string().min(1).describe('Name of the machine'),
  connection: CustomConnectionSchema,
  dataSources: z.array(CustomDataSourceSchema).optional().default([]),
  controlPoints: z.array(CustomControlPointSchema).optional().default([])
});
```

## Step 8: Create a Sample Configuration

Create a sample configuration JSON file for your adapter:

```json
{
  "adapter": {
    "name": "custom-adapter",
    "type": "custom",
    "pollIntervalMs": 5000
  },
  "mqtt": {
    "url": "mqtt://emqx:1883",
    "clientId": "custom-adapter",
    "username": "customadapter",
    "password": "customadapter"
  },
  "machines": [
    {
      "id": "custom-device",
      "name": "Custom Device",
      "connection": {
        "host": "10.10.10.5",
        "port": 1234
      },
      "dataSources": [
        {
          "id": "temperature",
          "name": "Temperature",
          "parameter": "temp",
          "scaleFactor": 1,
          "offset": 0
        },
        {
          "id": "pressure",
          "name": "Pressure",
          "parameter": "press",
          "scaleFactor": 0.1,
          "offset": 0
        }
      ],
      "controlPoints": [
        {
          "id": "valve",
          "name": "Valve",
          "command": "valve",
          "minValue": 0,
          "maxValue": 100
        },
        {
          "id": "pump",
          "name": "Pump",
          "command": "pump"
        }
      ]
    }
  ]
}
```

## Testing Your Custom Adapter

To test your custom adapter:

1. Build the project:
   ```bash
   npm run build
   ```

2. Run with your custom configuration:
   ```bash
   CONFIG_PATH=./config/custom-adapter.json npm start
   ```

3. Check logs to ensure your adapter is connecting to the device and polling data.

4. Use the Swagger UI at http://localhost:3000/docs to interact with your adapter's API.

5. Use an MQTT client to subscribe to the topics:
   ```bash
   mosquitto_sub -h localhost -t "/machines/custom-device/#" -v
   ```

## Integration with the Platform

Your custom adapter will be fully integrated with the Five-Zero platform:

1. **API**: All standard API endpoints will work with your adapter
2. **MQTT**: Your adapter will use the same MQTT topic structure
3. **Dashboards**: You can create dashboards using your adapter's data sources
4. **Rules**: You can create automation rules that use your adapter's data sources and control points

## Tips for Protocol Implementation

When implementing your protocol-specific logic:

1. **Error Handling**: Implement robust error handling for connection issues
2. **Reconnection**: Handle disconnections and reconnections gracefully
3. **Caching**: Consider caching data to reduce load on the device
4. **Batching**: If possible, batch read/write operations for efficiency
5. **Logging**: Use detailed logging to help with debugging
6. **Timeout Handling**: Implement proper timeout handling for operations
7. **Rate Limiting**: Respect any rate limits imposed by the device

## Publishing Your Adapter

If you want to share your adapter with the community:

1. Create a repository for your adapter
2. Document the adapter configuration format
3. Provide examples of how to use your adapter
4. Submit a pull request to the Five-Zero documentation to add your adapter to the list of available adapters

## Example Adapters

For more examples, look at these existing adapter implementations:

1. **S7 Adapter**: For Siemens S7 PLCs
2. **Shelly Adapter**: For Shelly IoT devices
3. **UCCNC Adapter**: For UCCNC CNC controllers
4. **Modbus Adapter**: For Modbus TCP/RTU devices
5. **OPC UA Adapter**: For OPC UA servers