'use client';

import { create } from 'zustand';
import { mqttClient } from '@/lib/mqtt-client';

interface MQTTStore {
    // State
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    mqttUrl: string;

    // Actions
    connect: (url: string) => Promise<void>;
    disconnect: () => void;
}



export const useMQTTStore = create<MQTTStore>((set, get) => {
    // Initialize with saved URL
    // const savedUrl = loadSavedMqttUrl();

    return {
        isConnected: mqttClient.isConnected(),
        isConnecting: false,
        error: null,
        mqttUrl: '', // savedUrl,

        connect: async (url: string) => {
            try {
                set({ isConnecting: true, error: null });
                await mqttClient.connect();
                set({
                    isConnected: true,
                    isConnecting: false,
                    mqttUrl: url
                });
            } catch (err) {
                set({
                    error: err instanceof Error ? err : new Error('Failed to connect to MQTT broker'),
                    isConnecting: false,
                    isConnected: false
                });
                console.error('MQTT connection error:', err);
            }
        },

        disconnect: () => {
            mqttClient.disconnect();
            set({ isConnected: false });
        }
    };
});

// Subscribe to connection changes
if (typeof window !== 'undefined') {
    mqttClient.onConnectionChange((connected) => {
        useMQTTStore.setState({ isConnected: connected });
    });
}

// Export a hook for easier access
export const useMQTT = useMQTTStore;