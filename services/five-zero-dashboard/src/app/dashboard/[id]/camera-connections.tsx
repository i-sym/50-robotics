'use client';

import { useEffect } from 'react';
import { useLiveKit } from '@/context/livekit-context';
import { DashboardConfig } from '@/types/dashboard';

// This component connects to LiveKit when a dashboard has camera widgets
export function CameraConnectionManager({ dashboard }: { dashboard: DashboardConfig }) {
    const { connect, isConnected, isConnecting } = useLiveKit();

    // Check if dashboard has camera widgets
    const hasCameraWidgets = dashboard.widgets.some(widget => widget.type === 'camera');

    // Connect to LiveKit if dashboard has camera widgets
    useEffect(() => {
        if (hasCameraWidgets && !isConnected && !isConnecting) {
            try {
                // Get LIVEKIT_URL from environment or use default one
                const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

                // Use auto-token generation by only providing URL and room name
                connect({
                    url: liveKitUrl,
                    roomName: 'machine-cameras' // Default room name
                }).catch(err => {
                    console.error('Failed to connect to LiveKit:', err);
                });
            } catch (err) {
                console.error('Error setting up camera connection:', err);
            }
        }
    }, [hasCameraWidgets, isConnected, isConnecting, connect]);

    // This component doesn't render anything
    return null;
}