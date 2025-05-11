import { useEffect, useState } from 'react';
import { useMQTT } from './use-mqtt';
import { WidgetData, MQTTMessage } from '@/types/dashboard';

// Function to parse time range string (e.g., '15m', '1h', '24h') to milliseconds
function parseTimeRange(timeRange: string): number {
    const value = parseInt(timeRange.slice(0, -1));
    const unit = timeRange.slice(-1);

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 15 * 60 * 1000; // Default to 15 minutes
    }
}

export function useWidgetData(dataSource?: string, options?: {
    storeHistory?: boolean;
    timeRange?: string;
    throttle?: number;
}): WidgetData {
    const {
        storeHistory = false,
        timeRange = '15m',
        throttle = 0
    } = options || {};

    // Default state
    const [widgetData, setWidgetData] = useState<WidgetData>({
        value: 0,
        timestamp: new Date().toISOString(),
        history: [],
        isLoading: true,
        error: null
    });

    // Subscribe to MQTT topic if dataSource is provided
    const { data, history, isConnected, error } = useMQTT({
        topic: dataSource || '',
        enabled: !!dataSource,
        storeHistory: storeHistory,
        throttle
    });

    // For demo/development, generate random data if no dataSource is provided
    useEffect(() => {
        if (!dataSource && process.env.NODE_ENV === 'development') {
            // Create some random data for demonstration
            const interval = setInterval(() => {
                const now = new Date();
                const newValue = Math.random() * 100;

                setWidgetData(prev => {
                    const newHistory = prev.history ? [...prev.history] : [];

                    // Add new point to history
                    if (storeHistory) {
                        newHistory.push({
                            value: newValue,
                            timestamp: now.toISOString()
                        });

                        // Remove old data points outside the time range
                        const timeRangeMs = parseTimeRange(timeRange);
                        const cutoffTime = now.getTime() - timeRangeMs;

                        while (newHistory.length > 0 && new Date(newHistory[0].timestamp).getTime() < cutoffTime) {
                            newHistory.shift();
                        }
                    }

                    return {
                        value: newValue,
                        timestamp: now.toISOString(),
                        history: newHistory,
                        isLoading: false,
                        error: null
                    };
                });
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [dataSource, storeHistory, timeRange]);

    // Update widget data when MQTT data changes
    useEffect(() => {
        if (data) {
            setWidgetData(prev => ({
                value: data.value,
                timestamp: data.timestamp,
                history: storeHistory ? history : [],
                isLoading: false,
                error: null
            }));
        }
    }, [data, history, storeHistory]);

    // Update loading and error states
    useEffect(() => {
        setWidgetData(prev => ({
            ...prev,
            isLoading: dataSource ? !isConnected : false,
            error
        }));
    }, [isConnected, error, dataSource]);

    return widgetData;
}

// Custom hook to filter history data based on time range
export function useTimeRangeData(data: MQTTMessage[], timeRange: string) {
    const [filteredData, setFilteredData] = useState<MQTTMessage[]>([]);

    useEffect(() => {
        if (!data || data.length === 0) {
            setFilteredData([]);
            return;
        }

        const timeRangeMs = parseTimeRange(timeRange);
        const now = new Date().getTime();
        const cutoffTime = now - timeRangeMs;

        const filtered = data.filter(point =>
            new Date(point.timestamp).getTime() >= cutoffTime
        );

        setFilteredData(filtered);
    }, [data, timeRange]);

    return filteredData;
}