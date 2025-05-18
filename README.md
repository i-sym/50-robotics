# 5.0 Robotics Machine Monitoring Infrastructure

This repository contains a modular and scalable infrastructure for monitoring industrial machines at 5.0 Robotics. The system is designed to collect data from various sources (PLCs, CNC controllers, sensors), process it, and visualize it in a unified dashboard.

## Architecture Overview

The infrastructure follows a microservices architecture with MQTT as the primary communication protocol and LiveKit for video streaming. The system is designed to be easily extensible with new data sources and AI capabilities.

### Key Components

- **Protocol Adapters**: Standardized interfaces for different industrial protocols (S7, HTTP, etc.)
- **MQTT Broker**: Central message broker for system-wide communication
- **LiveKit**: Video streaming server for camera feeds
- **Dashboard**: Web interface for monitoring and control
- **Orchestrator**: Service managing machine logic and operations
- **AI Services**: Microservices for anomaly detection and other AI capabilities

### Communication Pattern

The system uses MQTT topics with the following structure:

- Data Sources: `/machines/[adapterName]/datasources/[dataSourceId]/value` and `/status`
- Control Points: `/machines/[adapterName]/controlPoints/[controlPointId]/reported`, `/target`, and `/status`
- Adapter Status: `/machines/[adapterName]/connectionStatus`

Both equipment and AI adapters work in the same way. Running AI models that are connected to the infrastrucutre, create their own udapters, such as `/machines/anomaly-detection/...` and can subsribe to necessary data topics

## Repository Structure

```
/
├── services/                        # Microservices
│   ├── five-zero-adapter/           # A universal protocol adapter
│   ├── five-zero-anomaly-detection/ # AI model for anomaly tracking
│   ├── five-zero-dashboard/         # Web dashboard (Next.js)
│   ├── config/                      # Files with adapter and dashboard dynamic configurations
│   └── docker-compose.yaml          # Docker Compose file to run all together
│
├── apps/                          # Applications that run independently form docker
│   ├── camera-streamer/           # Camera streaming application
│   └── livekit/                   # LiveKit Server
│
├── dev/                           # Simulation tools
│   └── machine-logical-simulator/ # Machine simulator
│
├── docs/                        # Documentation
│   ├── architecture.md          # System architecture
│   ├── adapter-development.md   # Guide for creating new adapters
│   ├── mqtt-topics.md           # MQTT topic structure

```

## Microservices

### five-zero-adapter

A Node.js service that provides a unified interface for different industrial protocols. It includes adapter implementations for:
- Siemens S7 PLC protocol
- Shelly HTTP API
- UCCNC (placeholder)

Each adapter converts device-specific data into a standard format and publishes it to MQTT topics.

### emqx

An industrial MQTT broker that serves as the central communication hub for the entire system. It is an open-source broker that supports MQTT 3.1.1 and 5.0 protocols which is considered a standard for modern IIoT applications.


### five-zero-dashboard

A Next.js web application that provides a configurable interface for monitoring and controlling machines.

### five-zero-anomaly-detection

A n instance of AI model that uses LiveKit video stream to predict foreign objects, such as humans and report to MQTT

## Apps

### LiveKit

An open-source video streaming server used for camera feeds designed for large video streaming projects involving AI agents. It provides low-latency video (and if needed data) streaming over WebRTC and provides SDKs for browsers and AI agents

### video-streaming-app

A python application allowing to select the camera from machine (such as webcam, GoPro, etc) and stream it to LiveKit


## Getting Started

1. Clone this repository
2. Configure adapter settings in `/config/adapters/` if needed. The default configurations are provided for S7 and Shelly adapters.
   - For S7, ensure you have the correct IP address and connection settings in `s7.adapter.json`.
   - For Shelly, update the IP address and API key in `shelly.adapter.json`.
3. Configure dashboard settings in `/config/dashboard.config.json` if needed. The default configuration is provided.
4. Start the services with Docker Compose:

```bash
cd services
docker-compose up
```

## Docs

Each service features its own README.md file. Please check them out to get more information about particular component

## Development

For information on extending the system with new adapters or functionality, refer to the documentation in the `/docs` directory.
