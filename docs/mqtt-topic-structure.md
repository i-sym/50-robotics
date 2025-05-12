# Five-Zero Industrial IoT Platform

The Five-Zero Industrial IoT Platform is a modular, extensible system for connecting industrial equipment to a unified monitoring and control infrastructure. It bridges the gap between legacy industrial systems and modern IoT technologies.

## Features

- **Protocol Support**: Connect to S7 PLCs, Shelly devices, UCCNC systems and more
- **Real-time Monitoring**: Collect and analyze real-time data from machines
- **Automation**: Create rules that trigger actions based on machine conditions
- **REST API**: Comprehensive API for integration with other systems
- **MQTT Communication**: Event-based messaging for real-time updates
- **OpenAPI Documentation**: Self-documenting API with Swagger UI

## Architecture

The platform follows a microservices architecture with these components:

- **Adapter Services**: Connect to equipment using protocol-specific adapters
- **Message Broker**: MQTT broker for real-time communication
- **API**: RESTful API for configuration and control
- **Dashboards**: Visualization interface for monitoring (optional)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/five-zero/industrial-iot-platform.git
cd industrial-iot-platform
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Configuration

Create a configuration file for your adapter. Examples are provided in the `config` directory:

- `s7-adapter.json`: For connecting to S7 PLCs
- `shelly-adapter.json`: For connecting to Shelly devices
- `uccnc-adapter.json`: For connecting to UCCNC systems

See the [Configuration Guide](./docs/configuration.md) for more details.

### Running the Platform

#### Using npm:

```bash
# Start with a specific configuration file
CONFIG_PATH=./config/s7-adapter.json npm start
```

#### Using Docker:

```bash
# Build the Docker image
docker build -t five-zero/adapter .

# Run with a specific configuration
docker run -p 3000:3000 -v $(pwd)/config/s7-adapter.json:/app/config/default.json five-zero/adapter
```

#### Using Docker Compose:

```bash
# Start all components
docker-compose up

# Or start a specific adapter
docker-compose up s7-adapter
```

### Accessing the API

The API is available at:

- **Base URL**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## API Documentation

The API documentation is available through Swagger UI at the `/docs` endpoint. This provides an interactive interface to explore and test the API.

The main API endpoints include:

- `/machines`: List all machines
- `/machines/{machineId}`: Get machine details
- `/machines/{machineId}/datasources`: List data sources for a machine
- `/machines/{machineId}/datasources/{dataSourceId}/value`: Get data source value
- `/machines/{machineId}/controlPoints`: List control points for a machine
- `/machines/{machineId}/controlPoints/{controlPointId}`: Get control point state
- `/machines/{machineId}/controlPoints/{controlPointId}/target`: Set control point target value

## Data Output

### API Output

API responses are in JSON format. For example, a data source value might look like:

```json
{
  "id": "spindle-power",
  "value": 42.5,
  "status": "OK",
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

### MQTT Output

MQTT messages are also in JSON format. See the [MQTT Documentation](./docs/mqtt.md) for details on topic structure and message formats.

## Project Structure

```
.
├── config/                  # Configuration files
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── api/                 # API endpoints and documentation
│   ├── common/              # Shared utilities and types
│   ├── domain/              # Domain models and business logic
│   │   ├── base/            # Base classes for adapters
│   │   ├── s7/              # S7 specific implementations
│   │   ├── shelly/          # Shelly specific implementations
│   │   └── uccnc/           # UCCNC specific implementations
│   ├── infrastructure/      # External systems integration
│   ├── repositories/        # Data access layer
│   ├── schemas/             # Validation schemas
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── Dockerfile               # Docker build instructions
├── docker-compose.yml       # Docker Compose configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For questions, issues, or feature requests, please open an issue on the GitHub repository or contact support@five-zero.io.