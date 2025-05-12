'use client';

import { useEffect } from 'react';
import { useLiveKit } from '@/store/use-livekit-store';
import { DashboardConfig } from '@/types/dashboard';
import { getLiveKitConfig } from '@/actions/config';

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

                getLiveKitConfig().then((liveKitConfig) => {
                    const liveKitUrl = liveKitConfig.LIVEKIT_URL || '';

                    // Use auto-token generation by only providing URL and room name
                    connect({
                        url: liveKitUrl,
                        roomName: '50robotics-cameras' // Default room name
                    }).catch(err => {
                        console.error('Failed to connect to LiveKit:', err);
                    });
                }
                );
            } catch (err) {
                console.error('Error setting up camera connection:', err);
            }
        }
    }, [hasCameraWidgets, connect, isConnected, isConnecting]);

    // Component doesn't render anything visible
    return null;
}