import { Room } from 'livekit-client';

export type LiveKitConfig = {
    url: string;       // LiveKit server URL
    token?: string;    // Auth token (optional if auto-generating)
    roomName: string;  // Room name to connect to
};

export type CameraStreamInfo = {
    id: string;
    name: string;
    isActive: boolean;
    metadata?: Record<string, any>;
};

export interface LiveKitContextType {
    room: Room | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    cameras: CameraStreamInfo[];
    connect: (config: LiveKitConfig) => Promise<void>;
    disconnect: () => void;
}

export type CameraWidgetConfig = {
    id: string;
    type: 'camera';
    title: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    cameraName: string;
    showControls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
};