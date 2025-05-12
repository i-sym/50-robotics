"use client";

import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { MQTTMessage } from '@/types/dashboard';
import { getMqttConfig } from '@/actions/config';

// Singleton pattern for MQTT client
class MQTTClientManager {
    private static instance: MQTTClientManager;
    private client: MqttClient | null = null;
    private topics = new Set<string>();
    private messageListeners: Record<string, ((message: MQTTMessage) => void)[]> = {};
    private connectionListeners: ((connected: boolean) => void)[] = [];
    private connected = false;
    private connecting = false;
    private reconnectTimer: NodeJS.Timeout | null = null;

    private constructor() { }

    public static getInstance(): MQTTClientManager {
        if (!MQTTClientManager.instance) {
            MQTTClientManager.instance = new MQTTClientManager();
        }
        return MQTTClientManager.instance;
    }

    public async connect(): Promise<void> {

        const mqttConfig = await getMqttConfig();
        const brokerUrl = mqttConfig.MQTT_BROKER_URL;
        const clientId = mqttConfig.MQTT_CLIENT_ID;
        const username = mqttConfig.MQTT_USERNAME;
        const password = mqttConfig.MQTT_PASSWORD;



        console.log('Connecting to MQTT broker:', brokerUrl, 'with client ID:', clientId);

        if (this.client || this.connecting) return;

        this.connecting = true;



        try {
            this.client = mqtt.connect(brokerUrl, {
                clientId: `${clientId}-${Math.random().toString(16).slice(2, 8)}`,
                username,
                password,
                clean: true,
                connectTimeout: 30 * 1000,
                reconnectPeriod: 0, // Disable automatic reconnection
            } as IClientOptions);

            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');
                this.connected = true;
                this.connecting = false;

                // Resubscribe to all topics
                if (this.topics.size > 0) {
                    this.client?.subscribe(Array.from(this.topics));
                }

                // Notify listeners
                this.connectionListeners.forEach(listener => listener(true));
            });

            this.client.on('disconnect', () => {
                console.log('Disconnected from MQTT broker');
                this.connected = false;
                this.connectionListeners.forEach(listener => listener(false));
            });

            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                this.connected = false;
                this.connecting = false;
                this.connectionListeners.forEach(listener => listener(false));
            });

            this.client.on('message', (topic, payload) => {
                try {
                    const message = JSON.parse(payload.toString()) as MQTTMessage;

                    // Notify listeners for this topic
                    if (this.messageListeners[topic]) {
                        this.messageListeners[topic].forEach(listener => listener(message));
                    }

                    // Also handle wildcard subscriptions
                    Object.keys(this.messageListeners).forEach(listenerTopic => {
                        if (listenerTopic.includes('+') || listenerTopic.includes('#')) {
                            const regex = new RegExp('^' + listenerTopic.replace(/\+/g, '[^/]+').replace(/#/g, '.*') + '$');
                            if (regex.test(topic)) {
                                this.messageListeners[listenerTopic].forEach(listener => listener(message));
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error parsing message from ${topic}:`, error);
                }
            });
        } catch (error) {
            console.error('Failed to connect to MQTT broker:', error);
            this.connecting = false;

            // Try reconnecting after a delay
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => this.connect(), 5000);
        }
    }

    public subscribe(topic: string, listener: (message: MQTTMessage) => void): () => void {
        // Add to topics set
        this.topics.add(topic);

        // Subscribe if connected
        if (this.connected && this.client) {
            this.client.subscribe(topic);
        }

        // Add message listener
        if (!this.messageListeners[topic]) {
            this.messageListeners[topic] = [];
        }
        this.messageListeners[topic].push(listener);

        // Return unsubscribe function
        return () => {
            // Remove listener
            if (this.messageListeners[topic]) {
                this.messageListeners[topic] = this.messageListeners[topic].filter(l => l !== listener);

                // If no more listeners for this topic, unsubscribe and remove from topics set
                if (this.messageListeners[topic].length === 0) {
                    delete this.messageListeners[topic];
                    this.topics.delete(topic);

                    if (this.connected && this.client) {
                        this.client.unsubscribe(topic);
                    }
                }
            }
        };
    }

    public publishMessage(topic: string, value: any): void {
        if (!this.connected || !this.client) {
            console.error('Cannot publish: not connected to MQTT broker');
            return;
        }

        try {
            const message: MQTTMessage = {
                value,
                timestamp: new Date().toISOString()
            };

            this.client.publish(topic, JSON.stringify(message));
        } catch (error) {
            console.error(`Error publishing message to ${topic}:`, error);
        }
    }

    public onConnectionChange(listener: (connected: boolean) => void): () => void {
        this.connectionListeners.push(listener);

        // Immediately notify with current state
        listener(this.connected);

        // Return remove function
        return () => {
            this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
        };
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.client) {
            this.client.end();
            this.client = null;
        }

        this.connected = false;
        this.connecting = false;
        this.connectionListeners.forEach(listener => listener(false));
    }
}

export const mqttClient = MQTTClientManager.getInstance();