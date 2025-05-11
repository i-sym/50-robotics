# Configuration Guide

This guide explains how to create and customize configuration files for the Five-Zero Industrial IoT Platform.

## Overview

The Five-Zero platform uses JSON configuration files to define adapters, machines, data sources, and control points. Each adapter type (S7, Shelly, UCCNC, etc.) has its own configuration format, but they follow a common structure.

## Basic Configuration Structure

All adapter configurations follow this basic structure:

```json
{
  "adapter": {
    "name": "adapter-name",
    "type": "adapter-type",
    "pollIntervalMs": 1000
  },
  "mqtt": {
    "url": "mqtt://broker-address:1883",
    "clientId": "client-id",
    "username": "username",
    "password": "password"
  },
  "machines": [
    {
      "id": "machine-id",
      "name": "Machine Name",
      "connection": {
        // Connection details (specific to adapter type)
      },
      "dataSources": [
        // Data source definitions
      ],
      "controlPoints": [
        // Control point definitions
      ]
    }
  ]
}
```

## Common Configuration Properties

### Adapter Section

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Name of the adapter. Used for logging and identification. |
| `type` | string | Type of adapter. One of `"s7"`, `"shelly"`, `"uccnc"`, or a custom type. |
| `pollIntervalMs` | number | Polling interval in milliseconds. Default: 1000 |

### MQTT Section

| Property | Type | Description |
|----------|------|-------------|
| `url` | string | MQTT broker URL. Example: `"mqtt://localhost:1883"` |
| `clientId` | string | MQTT client ID. Should be unique. |
| `username` | string | MQTT username. Optional. |
| `password` | string | MQTT password. Optional. |

### Machine Section

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the machine. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the machine. |
| `connection` | object | Connection details. Format depends on adapter type. |
| `dataSources` | array | List of data source definitions. |
| `controlPoints` | array | List of control point definitions. |

## Adapter-Specific Configuration

### S7 Adapter

#### Connection Properties

| Property | Type | Description |
|----------|------|-------------|
| `ip` | string | IP address of the PLC |
| `rack` | number | Rack number of the PLC (typically 0) |
| `slot` | number | Slot number of the PLC (typically 0) |
| `localTSAP` | number | Local TSAP (optional, default: 0x0200) |
| `remoteTSAP` | number | Remote TSAP (optional, default: 0x0300) |
| `timeout` | number | Connection timeout in milliseconds (optional, default: 5000) |

#### Data Source Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the data source. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the data source. |
| `address` | string | S7 variable address (e.g., "DB1,WORD0") |
| `dataType` | string | S7 data type (BOOL, INT, DINT, REAL, WORD, BYTE, STRING) |
| `scaleFactor` | number | Factor to multiply raw value by (optional, default: 1) |
| `offset` | number | Offset to add to scaled value (optional, default: 0) |

#### Control Point Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the control point. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the control point. |
| `address` | string | S7 variable address (e.g., "DB2,BOOL0.0") |
| `dataType` | string | S7 data type (BOOL, INT, DINT, REAL, WORD, BYTE, STRING) |

#### Example

```json
{
  "adapter": {
    "name": "s7-adapter",
    "type": "s7",
    "pollIntervalMs": 1000
  },
  "mqtt": {
    "url": "mqtt://emqx:1883",
    "clientId": "s7-adapter",
    "username": "s7adapter",
    "password": "s7adapter"
  },
  "machines": [
    {
      "id": "cnc-machine",
      "name": "CNC Machine",
      "connection": {
        "ip": "10.10.10.3",
        "rack": 0,
        "slot": 0,
        "localTSAP": 512,
        "remoteTSAP": 768,
        "timeout": 10000
      },
      "dataSources": [
        {
          "id": "spindle-power",
          "name": "Spindle Power",
          "address": "DB1,WORD1136",
          "dataType": "WORD",
          "scaleFactor": 1,
          "offset": 0
        }
      ],
      "controlPoints": [
        {
          "id": "spindle-start",
          "name": "Spindle Start",
          "address": "DB2,BOOL0.0",
          "dataType": "BOOL"
        }
      ]
    }
  ]
}
```

### Shelly Adapter

#### Connection Properties

| Property | Type | Description |
|----------|------|-------------|
| `ip` | string | IP address of the Shelly device |
| `type` | string | Shelly device type (e.g., "shelly-rgbw2") |

#### Data Source Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the data source. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the data source. |
| `endpoint` | string | HTTP endpoint to call (e.g., "/status") |
| `valuePath` | string | JSON path to the value in the response (e.g., "meters[0].power") |
| `scaleFactor` | number | Factor to multiply raw value by (optional, default: 1) |
| `offset` | number | Offset to add to scaled value (optional, default: 0) |

#### Control Point Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the control point. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the control point. |
| `endpoint` | string | HTTP endpoint to call (e.g., "/light/0") |
| `valueKey` | string | Parameter name for the value (e.g., "turn") |
| `valueOn` | string | Value for ON state (optional, e.g., "on") |
| `valueOff` | string | Value for OFF state (optional, e.g., "off") |
| `minValue` | number | Min value for range controls (optional) |
| `maxValue` | number | Max value for range controls (optional) |

#### Example

```json
{
  "adapter": {
    "name": "shelly-adapter",
    "type": "shelly",
    "pollIntervalMs": 5000
  },
  "mqtt": {
    "url": "mqtt://emqx:1883",
    "clientId": "shelly-adapter",
    "username": "shellyadapter",
    "password": "shellyadapter"
  },
  "machines": [
    {
      "id": "machine-lighting",
      "name": "Machine Lighting System",
      "connection": {
        "ip": "10.10.10.100",
        "type": "shelly-rgbw2"
      },
      "dataSources": [
        {
          "id": "light-state",
          "name": "Light State",
          "endpoint": "/light/0",
          "valuePath": "ison",
          "scaleFactor": 1,
          "offset": 0
        }
      ],
      "controlPoints": [
        {
          "id": "light-switch",
          "name": "Light Switch",
          "endpoint": "/light/0",
          "valueKey": "turn",
          "valueOn": "on",
          "valueOff": "off"
        }
      ]
    }
  ]
}
```

### UCCNC Adapter

#### Connection Properties

| Property | Type | Description |
|----------|------|-------------|
| `ip` | string | IP address of the machine running UCCNC |
| `port` | number | Port number of the UCCNC API service |
| `apiKey` | string | API key for authentication (optional) |

#### Data Source Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the data source. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the data source. |
| `variable` | string | UCCNC variable name |
| `scaleFactor` | number | Factor to multiply raw value by (optional, default: 1) |
| `offset` | number | Offset to add to scaled value (optional, default: 0) |

#### Control Point Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the control point. Use a URL-friendly slug. |
| `name` | string | Human-readable name of the control point. |
| `command` | string | UCCNC command name |
| `minValue` | number | Min value for range controls (optional) |
| `maxValue` | number | Max value for range controls (optional) |

#### Example

```json
{
  "adapter": {
    "name": "uccnc-adapter",
    "type": "uccnc",
    "pollIntervalMs": 1000
  },
  "mqtt": {
    "url": "mqtt://emqx:1883",
    "clientId": "uccnc-adapter",
    "username": "uccncadapter",
    "password": "uccncadapter"
  },
  "machines": [
    {
      "id": "cnc-router",
      "name": "CNC Router",
      "connection": {
        "ip": "10.10.10.4",
        "port": 8080,
        "apiKey": "ucncapikey123456"
      },
      "dataSources": [
        {
          "id": "spindle-rpm",
          "name": "Spindle RPM",
          "variable": "SPINDLE_RPM",
          "scaleFactor": 1,
          "offset": 0
        }
      ],
      "controlPoints": [
        {
          "id": "start-spindle",
          "name": "Start Spindle",
          "command": "START_SPINDLE",
          "minValue": 0,
          "maxValue": 24000
        }
      ]
    }
  ]
}
```

## System-Level Configuration

For more advanced setups, you can use a system-level configuration that defines multiple adapters, dashboards, and automation rules:

```json
{
  "system": {
    "name": "Five-Zero Industrial IoT Platform",
    "version": "1.0.0"
  },
  "mqtt": {
    "broker": {
      "url": "mqtt://emqx:1883",
      "username": "fivezero",
      "password": "fivezero"
    }
  },
  "adapters": [
    {
      "name": "s7-adapter",
      "type": "s7",
      "enabled": true,
      "port": 3001,
      "config": {
        // S7 adapter configuration
      }
    },
    {
      "name": "shelly-adapter",
      "type": "shelly",
      "enabled": true,
      "port": 3002,
      "config": {
        // Shelly adapter configuration
      }
    }
  ],
  "dashboards": [
    // Dashboard definitions
  ],
  "rules": [
    // Automation rule definitions
  ]
}
```

## Best Practices

1. **Use Slugs for IDs**: Use lowercase, hyphenated slugs for IDs (e.g., `"spindle-power"`) instead of UUIDs or spaces. This makes them more readable and URL-friendly.

2. **Descriptive Names**: Use clear, descriptive names for all entities to improve maintainability.

3. **Proper Data Types**: Ensure you specify the correct data types for your variables.

4. **Security**: Never store sensitive information like passwords in plain text in production configurations. Use environment variables or a secrets manager.

5. **Network Security**: Restrict network access to industrial equipment to authorized adapters only.

6. **Polling Intervals**: Set appropriate polling intervals to balance responsiveness and network load.
   - Fast-changing values: 100-1000ms
   - Slow-changing values: 5000-60000ms

7. **Error Handling**: Implement proper error handling by setting appropriate timeouts and reconnect strategies.

8. **Testing**: Test your configuration thoroughly before deploying to production.

## Configuration File Location

By default, the platform looks for configuration files in these locations:

1. Path specified in the `CONFIG_PATH` environment variable
2. `./config/default.json` (relative to the current working directory)
3. `/app/config/default.json` (when running in a Docker container)

## Validating Configuration

You can validate your configuration file using the built-in validation tool:

```bash
npm run validate-config -- --file=./config/my-config.json
```

This will check the structure and values in your configuration file and report any errors.

## Environment Variable Substitution

You can use environment variables in your configuration file using the `${ENV_VAR}` syntax:

```json
{
  "mqtt": {
    "url": "mqtt://${MQTT_HOST}:${MQTT_PORT}",
    "username": "${MQTT_USERNAME}",
    "password": "${MQTT_PASSWORD}"
  }
}
```

This allows you to keep sensitive information out of your configuration files.

## Configuration Templates

The repository includes configuration templates for common scenarios:

- `config/templates/s7-siemens-1200.json`: Template for Siemens S7-1200 PLCs
- `config/templates/s7-siemens-300.json`: Template for Siemens S7-300 PLCs
- `config/templates/shelly-rgbw2.json`: Template for Shelly RGBW2 devices
- `config/templates/shelly-1pm.json`: Template for Shelly 1PM devices
- `config/templates/uccnc-basic.json`: Template for basic UCCNC setups

You can use these templates as a starting point for your own configuration.