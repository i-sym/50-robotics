// src/infrastructure/MqttClient.ts
import mqtt from 'mqtt';

export class MqttClient {
    private client: mqtt.MqttClient | null = null;
    private url: string;
    private clientId: string;
    private username?: string;
    private password?: string;
    private subscriptions: Map<string, (message: Buffer) => void> = new Map();

    constructor({
        url,
        clientId,
        username,
        password
    }: {
        url: string;
        clientId: string;
        username?: string;
        password?: string;
    }) {
        this.url = url;
        this.clientId = clientId;
        this.username = username;
        this.password = password;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(this.url, {
                clientId: this.clientId,
                username: this.username,
                password: this.password,
                clean: true
            });

            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');

                // Resubscribe to topics if reconnecting
                if (this.subscriptions.size > 0) {
                    const topics = Array.from(this.subscriptions.keys());
                    this.client?.subscribe(topics, (err) => {
                        if (err) {
                            console.error('Error resubscribing to topics:', err);
                        } else {
                            console.log(`Resubscribed to ${topics.length} topics`);
                        }
                    });
                }

                resolve();
            });

            this.client.on('error', (err) => {
                console.error('MQTT connection error:', err);
                reject(err);
            });

            this.client.on('message', (topic, message) => {
                const handler = this.subscriptions.get(topic);
                if (handler) {
                    handler(message);
                }
            });
        });
    }

    publish(topic: string, message: string): void {
        if (!this.client || !this.client.connected) {
            console.error('MQTT client not connected, cannot publish');
            return;
        }

        this.client.publish(topic, message, { qos: 1, retain: false }, (err) => {
            if (err) {
                console.error(`Error publishing to ${topic}:`, err);
            }
        });
    }

    subscribe(topic: string, handler: (message: Buffer) => void): void {
        if (!this.client || !this.client.connected) {
            console.error('MQTT client not connected, cannot subscribe');
            return;
        }

        this.subscriptions.set(topic, handler);

        this.client.subscribe(topic, (err) => {
            if (err) {
                console.error(`Error subscribing to ${topic}:`, err);
            } else {
                console.log(`Subscribed to ${topic}`);
            }
        });
    }

    unsubscribe(topic: string): void {
        if (!this.client || !this.client.connected) {
            console.error('MQTT client not connected, cannot unsubscribe');
            return;
        }

        this.subscriptions.delete(topic);

        this.client.unsubscribe(topic, (err) => {
            if (err) {
                console.error(`Error unsubscribing from ${topic}:`, err);
            } else {
                console.log(`Unsubscribed from ${topic}`);
            }
        });
    }

    disconnect(): void {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }
}
