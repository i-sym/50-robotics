# Five-Zero Simulator

This is a simulation environment for the Five-Zero Industrial IoT Platform that creates:

1. An S7 server emulating industrial equipment with realistic data patterns
2. HTTP endpoints resembling Shelly IoT devices

## Features

- **S7 Simulator:**
  - Implements a Siemens S7 server using node-snap7
  - Provides realistic data for key industrial metrics:
    - Spindle Power (watts)
    - Spindle RPM
    - Motor Load (%)
    - Vibration
  - Values change gradually with realistic patterns

- **Shelly RGBW Simulator:**
  - Mimics a Shelly RGBW device's API endpoints
  - Maintains state for on/off, RGB colors, and brightness
  - Responds to the same API commands as a real Shelly device

- **API Documentation:**
  - OpenAPI documentation available at `/doc`
  - Zod schema validation for all requests

- **Swagger UI:**
  - Interactive API documentation with Swagger UI
  - Accessible at `/ui`

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

### Running the Simulator

```bash
npm start
```

The simulator will start running on port 8099 with the following services:
- S7 server on the default port (102)
- HTTP server for Shelly simulation and API on port 8099

## API Endpoints

### OpenAPI Documentation
- `GET /api/doc` - OpenAPI documentation

### S7 Simulator
- `GET /api/simulation/s7` - Get current S7 values
- `POST /api/simulation/s7` - Update a specific S7 value
  ```json
  {
    "key": "SPINDLE_POWER", // One of: SPINDLE_POWER, SPINDLE_RPM, MOTOR_LOAD, VIBRATION
    "value": 2500
  }
  ```

### Shelly Simulator
- `GET /api/simulation/shelly` - Get current Shelly state
- `POST /api/simulation/shelly` - Update Shelly state
  ```json
  {
    "turn": "on", // "on" or "off"
    "red": 255,   // 0-255
    "green": 0,   // 0-255
    "blue": 0,    // 0-255
    "brightness": 80 // 0-100
  }
  ```

### Direct Shelly Device Simulation
- `GET /light/0` - Get current light state
- `POST /light/0?turn=on&red=255&green=0&blue=0` - Control the light (query parameters)

## Integration with Five-Zero Platform

This simulator can be used to test the Five-Zero platform without physical hardware by:

1. Configuring the S7 adapter to connect to the simulator (default: localhost:102)
2. Configuring the Shelly adapter to connect to the simulator (http://localhost:8099)

## Troubleshooting

- If the S7 server fails to start, ensure port 102 is not in use
- The S7 simulation requires administrative privileges on some systems due to the low port number (102)
- For production use, consider changing the port using environment variables
