import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { DashboardConfig, WidgetConfig } from '@/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        throw error;
    }
    return res.json();
};

export function useDashboardConfig(dashboardId: string) {
    const { data, error, isLoading, mutate } = useSWR<DashboardConfig>(
        `${API_BASE_URL}/dashboards/${dashboardId}`,
        fetcher
    );

    return {
        dashboard: data,
        isLoading,
        isError: error,
        mutate
    };
}

// For local testing/development, return a mock dashboard if dashboardId is 'demo'
export function useMockDashboardConfig(dashboardId: string) {
    const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            if (dashboardId === 'demo') {
                setDashboard({
                    id: 'demo',
                    name: 'Demo Dashboard',
                    layout: {
                        columns: 12,
                        rowHeight: 50
                    },
                    widgets: [
                        {
                            id: 'gauge-1',
                            type: 'gauge',
                            title: 'Spindle Rpm',
                            dataSource: '/machines/cnc-1/datasources/ds.spindle-power/value',
                            minValue: 0,
                            maxValue: 4000,
                            units: 'RPM',
                            position: { x: 0, y: 0, width: 4, height: 4 },
                            thresholds: [
                                { value: 50, color: '#22c55e' }, // Green
                                { value: 80, color: '#f59e0b' }, // Yellow
                                { value: 90, color: '#ef4444' }  // Red
                            ]
                        },
                        {
                            id: 'chart-1',
                            type: 'lineChart',
                            title: 'Vibration Data',
                            dataSource: '/machines/cnc-1/datasources/ds.vibration/value',
                            timeRange: '15m',
                            units: '',
                            position: { x: 4, y: 0, width: 8, height: 4 }
                        },
                        // {
                        //     id: 'status-1',
                        //     type: 'status',
                        //     title: 'Machine Status',
                        //     dataSource: '/machines/cnc-1/datasources/status/value',
                        //     position: { x: 0, y: 4, width: 4, height: 2 },
                        //     labels: {
                        //         true: 'Running',
                        //         false: 'Stopped'
                        //     },
                        //     colors: {
                        //         true: '#22c55e',
                        //         false: '#ef4444'
                        //     }
                        // },
                        {
                            id: 'camera-1',
                            type: 'camera',
                            title: 'Main Camera',
                            cameraName: 'camera-1-50robotics-cameras',
                            position: { x: 0, y: 4, width: 4, height: 8 },
                            showControls: true,
                            autoPlay: true,
                            muted: false
                        },

                        {
                            id: 'control-1',
                            type: 'control',
                            title: 'Light Control',
                            dataSource: '/machines/machine-lighting/datasources/light-state/value',
                            controlPoint: '/machines/machine-lighting/controlPoints/light-switch/target',
                            controlType: 'toggle',
                            position: { x: 4, y: 4, width: 4, height: 4 },
                            labels: {
                                true: 'ON',
                                false: 'OFF'
                            },
                            confirmationRequired: true,
                            confirmationMessage: 'Are you sure you want to change machine power state?'
                        },
                        {
                            id: 'text-1',
                            type: 'text',
                            title: 'Spindle Power',
                            dataSource: '/machines/cnc-1/datasources/ds.spindle-power/value',
                            position: { x: 8, y: 4, width: 4, height: 4 },
                            units: 'W',
                            prefix: 'Power: ',
                            decimalPlaces: 0
                        },
                        {
                            "id": "intrusion-1",
                            "type": "intrusionDetection",
                            "title": "Anomaly Detection",
                            "dataSource": "/machines/anomaly-tracker/reading/detected-objects",
                            "showConfidence": true,
                            "highlightColor": "#ff0000",
                            "showLabels": true,
                            "maxDetections": 10,
                            "position": { "x": 4, "y": 8, "width": 4, "height": 8 },
                        },
                        {
                            "id": "machine-3d",
                            "type": "machine3d",
                            "title": "CNC Machine Position",
                            "position": {
                                "x": 8,
                                "y": 8,
                                "width": 4,
                                "height": 6
                            },
                            "mqttTopic": "machine/position",
                            "showGrid": true,
                            "showAxes": true,
                            "cameraPosition": {
                                "x": 5,
                                "y": 5,
                                "z": 5
                            },
                            "initialRotation": 0
                        }
                    ]
                });
                setIsLoading(false);
            } else {
                setError(new Error(`Dashboard with ID "${dashboardId}" not found.`));
                setIsLoading(false);
            }
        }, 500);
    }, [dashboardId]);

    const mutate = () => {
        // For mock implementation, this is a no-op
    };

    return {
        dashboard,
        isLoading,
        isError: error,
        mutate
    };
}

// Custom hook to extract a specific widget by ID
export function useWidgetConfig(dashboardId: string, widgetId: string) {
    const { dashboard, isLoading, isError } =
        process.env.NODE_ENV === 'development'
            ? useMockDashboardConfig(dashboardId)
            : useDashboardConfig(dashboardId);

    const widget = dashboard?.widgets.find(w => w.id === widgetId) || null;

    return {
        widget,
        isLoading,
        isError
    };
}