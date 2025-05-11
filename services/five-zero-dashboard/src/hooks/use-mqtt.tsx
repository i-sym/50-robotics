import { useEffect, useState, useCallback } from 'react';
import { mqttClient } from '@/lib/mqtt-client';
import { MQTTMessage } from '@/types/dashboard';

// Maximum number of historical data points to store per topic
const MAX_HISTORY_POINTS = 100;

export type MQTTSubscriptionOptions = {
    topic: string;
    enabled?: boolean;
    storeHistory?: boolean;
    throttle?: number; // milliseconds
};

export type MQTTSubscriptionState<T = any> = {
    data: MQTTMessage | null;
    history: MQTTMessage[];
    isConnected: boolean;
    publish: (value: T) => void;
    error: Error | null;
};

export function useMQTT<T = any>({
    topic,
    enabled = true,
    storeHistory = false,
    throttle = 0,
}: MQTTSubscriptionOptions): MQTTSubscriptionState<T> {
    const [data, setData] = useState<MQTTMessage | null>(null);
    const [history, setHistory] = useState<MQTTMessage[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

    // Handle incoming messages
    const handleMessage = useCallback((message: MQTTMessage) => {
        const now = Date.now();

        // Apply throttling if specified
        if (throttle > 0 && now - lastUpdateTime < throttle) {
            return;
        }

        setLastUpdateTime(now);
        setData(message);

        if (storeHistory) {
            setHistory(prev => {
                const newHistory = [...prev, message];
                if (newHistory.length > MAX_HISTORY_POINTS) {
                    return newHistory.slice(newHistory.length - MAX_HISTORY_POINTS);
                }
                return newHistory;
            });
        }
    }, [lastUpdateTime, throttle, storeHistory]);

    // Connect to MQTT broker and subscribe to topic
    useEffect(() => {
        if (!enabled) return;

        try {
            // Connect if not already connected
            mqttClient.connect();

            // Subscribe to connection status
            const connectionCleanup = mqttClient.onConnectionChange(connected => {
                setIsConnected(connected);
                if (!connected) {
                    setError(new Error('Disconnected from MQTT broker'));
                } else {
                    setError(null);
                }
            });

            // Subscribe to the topic
            const subscriptionCleanup = mqttClient.subscribe(topic, handleMessage);

            // Cleanup subscriptions on unmount
            return () => {
                connectionCleanup();
                subscriptionCleanup();
            };
        } catch (err) {
            console.error('Error in MQTT hook:', err);
            setError(err instanceof Error ? err : new Error('Unknown MQTT error'));
            return () => { };
        }
    }, [topic, enabled, handleMessage]);

    // Function to publish a message to the topic
    const publish = useCallback((value: T) => {
        try {
            mqttClient.publishMessage(topic, value);
        } catch (err) {
            console.error('Error publishing message:', err);
            setError(err instanceof Error ? err : new Error('Failed to publish message'));
        }
    }, [topic]);

    return { data, history, isConnected, publish, error };
}

// Custom hook for control topics (separates target from actual value)
export function useControlPoint<T = any>(options: {
    valueTopic: string;
    controlTopic: string;
    enabled?: boolean;
    confirmationCallback?: (value: T) => Promise<boolean>;
}) {
    const { valueTopic, controlTopic, enabled = true, confirmationCallback } = options;

    // Subscribe to value topic to know current state
    const valueSubscription = useMQTT<T>({ topic: valueTopic, enabled });

    // Function to send control commands
    const sendCommand = useCallback(async (value: T): Promise<boolean> => {
        // If confirmation callback is provided, wait for confirmation
        if (confirmationCallback) {
            const confirmed = await confirmationCallback(value);
            if (!confirmed) return false;
        }

        // Send command to control topic
        try {
            mqttClient.publishMessage(controlTopic, value);
            return true;
        } catch (err) {
            console.error('Error sending control command:', err);
            return false;
        }
    }, [controlTopic, confirmationCallback]);

    return {
        currentValue: valueSubscription.data?.value as T,
        timestamp: valueSubscription.data?.timestamp,
        isConnected: valueSubscription.isConnected,
        sendCommand,
        error: valueSubscription.error
    };
}