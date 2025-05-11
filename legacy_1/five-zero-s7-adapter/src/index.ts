import { serve } from '@hono/node-server';
import { ConfigLoader } from './common/ConfigLoader';
import { MqttClient } from './infrastructure/MqttClient';
import { MachineRepository } from './repositories/MachineRepository';
import { DataSourceRepository } from './repositories/DataSourceRepository';
import { ControlPointRepository } from './repositories/ControlPointRepository';
import { MachineService } from './services/MachineService';
import { DataSourceService } from './services/DataSourceService';
import { ControlPointService } from './services/ControlPointService';
import { S7AdapterService } from './services/S7AdapterService';
import { setupApi } from './api';

async function main() {
  // Load configuration
  const config = new ConfigLoader();
  console.log(`Starting ${config.getAdapterName()}...`);

  // Initialize MQTT client
  const mqttClient = new MqttClient({
    url: config.getMqttConfig().url,
    clientId: config.getMqttConfig().clientId,
    username: config.getMqttConfig().username,
    password: config.getMqttConfig().password
  });

  await mqttClient.connect();
  console.log('Connected to MQTT broker');

  // Initialize repositories
  const machineRepository = new MachineRepository(config);
  const dataSourceRepository = new DataSourceRepository(config, mqttClient);
  const controlPointRepository = new ControlPointRepository(config, mqttClient);

  // Initialize services
  const machineService = MachineService.getInstance(machineRepository);
  const dataSourceService = DataSourceService.getInstance(dataSourceRepository, machineRepository);
  const controlPointService = ControlPointService.getInstance(
    controlPointRepository,
    machineRepository,
    mqttClient
  );

  // Initialize adapter service
  const adapterService = S7AdapterService.getInstance({
    machineRepository,
    dataSourceRepository,
    controlPointRepository,
    mqttClient,
    pollIntervalMs: config.getPollIntervalMs()
  });

  await adapterService.initialize();

  // Set up API
  const app = setupApi({
    machineService,
    dataSourceService,
    controlPointService
  });

  // Start the server
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  serve({
    fetch: app.fetch,
    port
  });

  console.log(`API server listening on port ${port}`);

  // Start polling
  adapterService.startPolling();
  console.log(`${config.getAdapterName()} started successfully`);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    adapterService.stopPolling();
    await adapterService.disconnect();
    mqttClient.disconnect();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Error starting adapter:', err);
  process.exit(1);
});