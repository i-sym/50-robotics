# Five-Zero Industrial IoT Dashboard

Dashboard UI for real-time monitoring and control of industrial equipment with support for data visualization, camera streams, and anomaly detection.

## Features

- Real-time data visualization via MQTT
- Configurable dashboard layouts
- Multiple visualization widgets including gauges, charts, and status indicators
- Equipment control capabilities
- Live camera streams integration
- Anomaly and intrusion detection visualization

## Installation

### Prerequisites

- Node.js 18.x or higher
- MQTT broker running (EMQX, which is included in the project)
- LiveKit server (optional, for camera streams)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/five-zero/dashboard.git
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` to match your environment.

4. Start the development server:
   ```bash
   yarn run dev
   ```

5. For production:
   ```bash
   yarn run build
   yarn start
   ```

## Configuration

### Environment Variables

Create a `.env.local` file with these variables:

```bash
# MQTT Configuration
NEXT_PUBLIC_MQTT_BROKER_URL=ws://localhost:8083/mqtt
NEXT_PUBLIC_MQTT_USERNAME=dashboarduser
NEXT_PUBLIC_MQTT_PASSWORD=password

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# LiveKit Configuration (optional, for camera streams)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

## Dashboard

Five-Zero Dashboard allows creation of multiple customized dashboards, each with its own layout and widget configuration.

### Dashboard Configuration

Dashboards are configured using JSON objects:

```json
{
  "id": "main-dashboard",
  "name": "Machine Monitoring",
  "layout": {
    "columns": 12,
    "rowHeight": 50
  },
  "widgets": [
    {
      "id": "gauge-1",
      "type": "gauge",
      "title": "Spindle Power",
      "dataSource": "/machines/cnc-1/datasources/spindle-power/value",
      "minValue": 0,
      "maxValue": 100,
      "units": "%",
      "position": { "x": 0, "y": 0, "width": 4, "height": 4 }
    },
    // More widgets...
  ]
}
```

### Available Dashboards

- **Main Dashboard**: General equipment monitoring dashboard (`/dashboard/demo`)
- **Machine Status**: Detailed status for a specific machine (`/dashboard/machine-status`)
- **Camera Dashboard**: Live camera feeds monitoring (`/dashboard/cameras`)
- **Intrusion Detection**: Security monitoring with anomaly detection (`/dashboard/intrusion-detection`)

## Widgets

Five-Zero Dashboard offers the following widget types:

### Data Visualization Widgets

- **Gauge Widget**: Circular gauge for displaying a single numeric value
- **Chart Widget**: Line chart for time-series data visualization
- **Status Widget**: Visual indicator for binary states
- **Text Widget**: Simple text display for numeric or string values

### Control Widgets

- **Control Widget**: Interactive controls for equipment operation (buttons, toggles, sliders)

### Camera and Detection Widgets

- **Camera Widget**: Live video stream from machine cameras
- **Intrusion Detection Widget**: Visualization of object detection from AI models

See [Widgets Documentation](./docs/widgets.md) for detailed configuration options for each widget type.

## MQTT Integration

The dashboard connects to MQTT to receive real-time data updates and send control commands.

### Topic Structure

- **Data Values**: `/machines/{machineId}/datasources/{dataSourceId}/value`
- **Control Points**: `/machines/{machineId}/controlPoints/{controlPointId}/target`

See [Messages.md](./Messages.md) for detailed message format documentation.

### Message Example

```json
{
  "value": 42.5,
  "timestamp": "2023-11-01T12:34:56.789Z"
}
```

## LiveKit Camera Integration

The dashboard integrates with LiveKit to display real-time camera streams from machines.

### Setup

1. Install LiveKit server using [their documentation](https://docs.livekit.io/server/installation/)
2. Configure your `.env.local` file with LiveKit credentials
3. Navigate to the Cameras page (`/cameras`) to manage camera connections
4. Use the Camera Simulator page (`/camera-simulator`) for testing without physical cameras

### Camera Widget

Add camera widgets to dashboards:

```json
{
  "id": "camera-1",
  "type": "camera",
  "title": "Main Camera",
  "cameraName": "Camera-Main",
  "position": { "x": 0, "y": 0, "width": 6, "height": 4 }
}
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── dashboard/       # Dashboard components
│   ├── widgets/         # Widget implementations
│   └── ui/              # UI components (shadcn/ui)
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Helper functions and utilities
└── types/               # TypeScript type definitions
```

### Adding New Widgets

1. Define the widget type in `src/types/dashboard.ts`
2. Create a new widget component in `src/components/widgets/`
3. Add the widget to the widget renderer in `src/components/dashboard/widget-renderer.tsx`
4. Document the widget in the docs directory

See [Widget Development Guide](./docs/widget-development.md) for detailed instructions.

### Building for Production

The app features a dockerfile to be run on docker. Use

```bash
docker build -t "5.0robotics/dashboard" .
```

Or if you wish to use it outside of docker use

```bash
yarn run build
```

This creates an optimized production build in the `.next` directory.

For running in docker-compose, you might use the following preset:

```
dashboard:
    build:
      context: ./five-zero-dashboard
      dockerfile: Dockerfile
    container_name: five-zero-dashboard
    depends_on:
      - mqtt-broker
    environment:
      - NODE_ENV=production
      - MQTT_BROKER_URL=ws://localhost:8083/mqtt
      - MQTT_CLIENT_ID=dashboard-client
      - MQTT_USERNAME=dev
      - MQTT_PASSWORD=dev

      # For Cloud LiveKit setup
      # - LIVEKIT_URL=wss://cnc-demo-7wj97mwz.livekit.cloud
      # - LIVEKIT_BACKEND_URL=wss://cnc-demo-7wj97mwz.livekit.cloud
      # - LIVEKIT_API_KEY=APIeNJYiSJnTXTD
      # - LIVEKIT_API_SECRET=3kTnOeRPRfXyenmRcjlGXg57obwcEL9mSljHyzEn1RYA
     
      # For Local LiveKit Setup
      - LIVEKIT_URL=ws://10.10.10.10:7880
      - LIVEKIT_BACKEND_URL=ws://10.10.10.10:7880
      - LIVEKIT_API_KEY=devkey
      - LIVEKIT_API_SECRET=secret
  
    ports:
      - "3000:3000"
    # volumes:
    #   - ./config/dashboard.json:/app/config/dashboard.json
    restart: unless-stopped
    networks:
      - five-zero-network
```