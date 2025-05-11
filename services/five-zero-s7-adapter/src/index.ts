import { serve } from '@hono/node-server';
import { ConfigLoader } from './common/ConfigLoader';
import { MqttClient } from './infrastructure/MqttClient';
import { AdapterFactory } from './factories/AdapterFactory';
import { setupApi } from './api';

async function main() {
  // Load configuration
  const config = new ConfigLoader(process.env.CONFIG_PATH);
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

  // Create adapter service
  const adapterService = AdapterFactory.createAdapterService(config, mqttClient);

  // Initialize adapter
  await adapterService.initialize();

  // Set up API
  const app = setupApi(adapterService);

  // Start the server
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
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