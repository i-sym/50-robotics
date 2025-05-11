# 5.0 Robotics Monitoring System Architecture

## System Overview

The 5.0 Robotics monitoring infrastructure is designed as a modular, scalable system for industrial machine monitoring. It follows a microservices architecture pattern with standardized communication protocols to enable easy extension and integration of new components.


## Core Principles

1. **Modularity**: Each component has a single responsibility and can be developed, deployed, and scaled independently.
2. **Standardized Communication**: MQTT serves as the primary communication protocol with a well-defined topic structure.
3. **Configurability**: All components are configurable via JSON files, allowing for system adaptation without code changes.
4. **Extensibility**: The system is designed to easily accommodate new data sources, protocols, and AI capabilities.

## Component Architecture

### Protocol Adapter Service

The five-zero-protocol-adapter service implements the Adapter pattern to provide a unified interface for various industrial protocols.

#### Architecture

```
five-zero-protocol-adapter/
├── src/
│   ├── modules/
│   │   ├── adapter-common/          # Common adapter functionality
│   │   │   ├── AbstractAdapter.ts   # Base adapter class
│   │   │   ├── AdapterManager.ts    # Manages all adapter instances
│   │   │   ├── DataSource.ts        # Data source representation
│   │   │   └── ControlPoint.ts      # Control point representation
│   │   │
│   │   ├── s7-adapter/              # S7 protocol implementation
│   │   │   ├── S7AdapterModule.ts   # Module definition
│   │   │   ├── S7Adapter.ts         # S7-specific adapter
│   │   │   └── S7ControlPoint.ts    # S7 control point implementation
│   │   │
│   │   ├── shelly-adapter/          # Shelly protocol implementation
│   │   │   ├── ShellyAdapterModule.ts
│   │   │   ├── ShellyAdapter.ts
│   │   │   └── ShellyControlPoint.ts
│   │   │
│   │   └── uccnc-adapter/           # UCCNC placeholder
│   │       ├── UCCNCAdapterModule.ts
│   │       ├── UCCNCAdapter.ts
│   │       └── UCCNCControlPoint.ts
│   │
│   ├── common/                      # Shared utilities
│   │   ├── mqtt/
│   │   │   └── MQTTClient.ts        # MQTT client wrapper
│   │   ├── config/
│   │   │   └── ConfigLoader.ts      # Configuration loader
│   │   └── utils/
│   │
│   └── index.ts                     # Entry point
```

#### Data Flow

1. The adapter reads its configuration from the corresponding JSON file.
2. It establishes connections to both the device (PLC, Shelly, etc.) and the MQTT broker.
3. For each data source:
   - The adapter polls the device at the specified interval
   - It transforms the data into a standardized format
   - It publishes the data to the appropriate MQTT topic
4. For each control point:
   - The adapter subscribes to the target topic
   - When a new target state is received, it sends the appropriate command to the device
   - It publishes the reported state back to MQTT

### Dashboard Service

The five-zero-dashboard provides a web interface for visualizing data and controlling machines.

#### Architecture

```
five-zero-dashboard/
├── src/
│   ├── app/                        # Next.js app directory
│   ├── components/                 # React components
│   │   ├── dashboard/
│   │   │   ├── DashboardGrid.tsx   # Main dashboard layout
│   │   │   ├── DashboardPanel.tsx  # Panel container
│   │   │   └── panels/             # Panel implementations
│   │   │       ├── GaugePanel.tsx
│   │   │       ├── VideoPanel.tsx
│   │   │       └── ControlPanel.tsx
│   │   └── common/
│   ├── hooks/
│   │   ├── useMQTT.ts              # MQTT connection hook
│   │   └── useLiveKit.ts           # LiveKit connection hook
│   ├── store/                      # State management
│   │   ├── dashboardSlice.ts
│   │   └── store.ts
│   └── utils/
│       ├── configLoader.ts         # Load dashboard configuration
│       └── mqttHelper.ts           # MQTT helper functions
```

#### Panel System

The dashboard uses a configurable panel system where each panel:
- Has a specific type (gauge, chart, video, control)
- Can be positioned on the grid
- Is configured with specific data sources or control points
- Updates in real-time based on MQTT messages

### Orchestrator Service

The five-zero-orchestrator service contains the machine logic and automation scripts.

#### Architecture

```
five-zero-orchestrator/
├── src/
│   ├── modules/
│   │   ├── machine/
│   │   │   ├── MachineModule.ts
│   │   │   ├── CNCMachine.ts      # CNC machine representation
│   │   │   └── MachineState.ts    # Machine state management
│   │   └── scripts/
│   │       ├── ScriptManager.ts   # Script execution manager
│   │       └── ScriptRunner.ts    # Script execution engine
│   ├── common/
│   │   ├── mqtt/
│   │   └── utils/
│   └── index.ts
```

## Communication Architecture

### MQTT Topic Structure

All system communication follows a standard MQTT topic structure:

#### Adapter Topics

- Data source values: `/adapters/[adapterName]/datasources/[dataSourceId]/value`
- Data source status: `/adapters/[adapterName]/datasources/[dataSourceId]/status`
- Control point reported state: `/adapters/[adapterName]/controlPoints/[controlPointId]/reported`
- Control point target state: `/adapters/[adapterName]/controlPoints/[controlPointId]/target`
- Control point status: `/adapters/[adapterName]/controlPoints/[controlPointId]/status`
- Adapter connection status: `/adapters/[adapterName]/connectionStatus`

#### AI Topics

- AI inference results: `/ai/[aiModelId]/inference/result`
- AI model status: `/ai/[aiModelId]/status`

### Message Formats

All MQTT messages use JSON format with a standard envelope:

```json
{
  "timestamp": "2023-05-07T10:15:30.123Z",
  "value": <actual-value>,
  "metadata": {
    "source": "string",
    "unit": "string",
    "min": "number",
    "max": "number"
  }
}
```

## Video Streaming Architecture

Video streaming is handled by LiveKit, with:
- A dedicated room named "five-zero-cameras"
- Each camera represented as a participant
- Stream metadata containing camera information

## Configuration System

All system components are configured through JSON files:

### Adapter Configuration

Example S7 adapter configuration:

```json
{
  "name": "s7",
  "displayName": "Siemens S7 PLC",
  "enabled": true,
  "connection": {
    "ip": "10.10.10.3",
    "rack": 0,
    "slot": 1
  },
  "pollingInterval": 1000,
  "dataSources": [
    {
      "id": "motor_speed",
      "name": "Motor Speed",
      "address": "DB1,INT0",
      "dataType": "int16",
      "unit": "RPM",
      "min": 0,
      "max": 3000
    }
  ],
  "controlPoints": [
    {
      "id": "motor_enable",
      "name": "Motor Enable",
      "address": "DB1,X0.0",
      "dataType": "boolean"
    }
  ]
}
```

### Dashboard Configuration

The dashboard is configured through a JSON file that defines the layout and panels:

```json
{
  "layout": {
    "rows": 12,
    "cols": 12
  },
  "panels": [
    {
      "id": "motor_speed_gauge",
      "type": "gauge",
      "title": "Motor Speed",
      "gridPos": { "x": 0, "y": 0, "w": 4, "h": 4 },
      "dataSource": {
        "adapter": "s7",
        "dataSourceId": "motor_speed"
      }
    },
    {
      "id": "camera_feed",
      "type": "video",
      "title": "Machine Camera",
      "gridPos": { "x": 4, "y": 0, "w": 8, "h": 8 },
      "videoSource": {
        "roomName": "five-zero-cameras",
        "participantName": "main-camera"
      }
    }
  ]
}
```

## Deployment Architecture

The system is deployed using Docker Compose with each microservice in its own container. This allows for:
- Independent scaling of components
- Easy updates and rollbacks
- Consistent development and production environments

### Container Dependencies

- Protocol Adapter -> MQTT Broker
- Dashboard -> MQTT Broker, LiveKit
- AI Services -> MQTT Broker, LiveKit
- Orchestrator -> MQTT Broker

## Extension Points

The system is designed to be extended in the following ways:

1. **New Protocol Adapters**: By implementing the AbstractAdapter interface and creating adapter-specific configuration
2. **New Dashboard Panels**: By adding new panel types to the dashboard
3. **New AI Models**: By creating new AI microservices that follow the standard MQTT topic structure
4. **Machine Logic**: By adding new scripts to the orchestrator service

## Security Considerations

- All services run in an isolated network
- Authentication and authorization for the MQTT broker
- TLS encryption for all communication
- Access control for the dashboard

## Monitoring and Logging

- All services log to stdout/stderr in a structured format
- Logs are collected and centralized
- Health checks are implemented for each service
- Metrics are collected for system monitoring

## Future Considerations

- Scaling to multiple machines
- Cloud integration
- Advanced analytics and reporting
- Mobile applications