# MQTT Documentation

The Five-Zero Industrial IoT Platform uses MQTT (Message Queuing Telemetry Transport) as its central communication protocol. This document describes the topic structure and message formats used by the platform.

## Overview

MQTT is a lightweight publish/subscribe messaging protocol designed for constrained devices and low-bandwidth, high-latency, or unreliable networks. The Five-Zero platform uses MQTT to:

1. Publish real-time data from machines
2. Control machines through command messages
3. Report machine and connection status
4. Facilitate inter-service communication

## MQTT Broker

The platform requires an MQTT broker. By default, it uses:

- **Broker address**: mqtt://emqx:1883
- **Username**: (defined in config)
- **Password**: (defined in config)

You can configure the MQTT broker settings in your adapter's configuration file.

## Topic Structure

The platform uses a standardized topic structure to organize messages:

### Data Sources

Data sources publish their values and status to these topics:

- **Value**: `/machines/{machineId}/datasources/{dataSourceId}/value`
- **Status**: `/machines/{machineId}/datasources/{dataSourceId}/status`

### Control Points

Control points use these topics:

- **Reported State**: `/machines/{machineId}/controlPoints/{controlPointId}/reported`
- **Target State**: `/machines/{machineId}/controlPoints/{controlPointId}/target`
- **Status**: `/machines/{machineId}/controlPoints/{controlPointId}/status`

### System Topics

System-wide information is published to:

- **Adapter Status**: `/adapters/{adapterId}/status`
- **Machine Status**: `/machines/{machineId}/status`

## Message Formats

All messages are in JSON format with a consistent structure:

### Data Source Value Message

```json
{
  "value": 42.5,
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

Where:
- `value`: The current value of the data source (can be any data type)
- `timestamp`: ISO 8601 timestamp when the value was read

### Status Message

```json
{
  "status": "OK",
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

Where:
- `status`: One of `"OK"`, `"ERROR"`, or `"DISCONNECTED"`
- `timestamp`: ISO 8601 timestamp when the status was updated

### Control Point Target Message

```json
{
  "value": true,
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

Where:
- `value`: The target value for the control point (can be any data type)
- `timestamp`: ISO 8601 timestamp when the target was set

### Example Messages

#### Numeric Value (Spindle Power)

```json
// Topic: /machines/cnc-machine/datasources/spindle-power/value
{
  "value": 57.2,
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

#### Boolean Value (Door State)

```json
// Topic: /machines/door-control/datasources/door-state/value
{
  "value": true,
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

#### Object Value (RGB Color)

```json
// Topic: /machines/machine-lighting/controlPoints/rgb-color/target
{
  "value": {
    "red": 255,
    "green": 0,
    "blue": 0
  },
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

#### Status Message

```json
// Topic: /machines/cnc-machine/status
{
  "status": "OK",
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

## Quality of Service (QoS)

The platform uses different QoS levels for different types of messages:

- **Data Source Values**: QoS 0 (At most once) - For high-frequency data updates
- **Control Point Commands**: QoS 1 (At least once) - For reliable command delivery
- **Status Updates**: QoS 1 (At least once) - For reliable status tracking

## Retained Messages

Some messages are published with the `retained` flag set to true:

- **Machine Status**: So new subscribers immediately know the machine status
- **Data Source Status**: So new subscribers know the reliability of data sources

## Subscribing to Topics

You can subscribe to topics using any MQTT client. For example, using the `mosquitto_sub` command-line tool:

```bash
# Subscribe to all data source values for a machine
mosquitto_sub -h localhost -t "/machines/cnc-machine/datasources/+/value"

# Subscribe to a specific data source
mosquitto_sub -h localhost -t "/machines/cnc-machine/datasources/spindle-power/value"

# Subscribe to all machine statuses
mosquitto_sub -h localhost -t "/machines/+/status"
```

## Publishing to Topics

You can publish to control point target topics to control machines. For example, using the `mosquitto_pub` command-line tool:

```bash
# Turn on a light
mosquitto_pub -h localhost -t "/machines/machine-lighting/controlPoints/light-switch/target" -m '{"value":"on","timestamp":"2023-11-01T12:34:56.789Z"}'

# Set spindle speed
mosquitto_pub -h localhost -t "/machines/cnc-machine/controlPoints/spindle-speed/target" -m '{"value":2000,"timestamp":"2023-11-01T12:34:56.789Z"}'
```

## Wildcard Subscriptions

You can use MQTT wildcards to subscribe to multiple topics:

- **Single-level wildcard** (`+`): Matches exactly one topic level
  - Example: `/machines/+/status` matches status topics for all machines
- **Multi-level wildcard** (`#`): Matches any number of topic levels
  - Example: `/machines/cnc-machine/#` matches all topics for the CNC machine

## Persistence and History

By default, the platform does not store historical values. However, you can:

1. Configure your MQTT broker to enable message persistence
2. Use a dedicated MQTT client to subscribe to topics and store values in a database
3. Enable the optional History Service component of the Five-Zero platform

## Debugging MQTT Communications

To debug MQTT communications:

1. Use the MQTT Explorer tool to visualize the topic structure and messages
2. Enable verbose logging in your adapter configuration
3. Use the `mosquitto_sub` tool with the `-v` flag to see both topics and messages

## Integration with External Systems

You can integrate external systems with the Five-Zero platform via MQTT:

1. **Dashboards**: Subscribe to data source value topics to display real-time data
2. **Historians**: Subscribe to value topics and store data in time-series databases
3. **Custom Control Interfaces**: Publish to control point target topics to control machines