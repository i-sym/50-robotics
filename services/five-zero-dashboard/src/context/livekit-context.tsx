'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    Room,
    RoomEvent,
    RemoteParticipant,
    RemoteTrackPublication,
    Track,
    Participant,
    RemoteTrack,
    ConnectionState
} from 'livekit-client';
import { LiveKitContextType, LiveKitConfig, CameraStreamInfo } from '@/types/livekit';
import { generateLiveKitToken } from '@/lib/livekit-token';

// Create context with default values
const LiveKitContext = createContext<LiveKitContextType>({
    room: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    cameras: [],
    connect: async () => { },
    disconnect: () => { }
});

// Hook to use the LiveKit context
export const useLiveKit = () => useContext(LiveKitContext);

// Provider component
export function LiveKitProvider({ children }: { children: React.ReactNode }) {
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [cameras, setCameras] = useState<CameraStreamInfo[]>([]);

    // Function to extract camera info from participants
    const extractCamerasFromRoom = useCallback((room: Room): CameraStreamInfo[] => {
        const cameraList: CameraStreamInfo[] = [];

        // Process participants to find camera tracks
        for (const participant of room.remoteParticipants.values()) {
            for (const track of participant.videoTrackPublications.values()) {
                if (track.kind === Track.Kind.Video) {
                    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};

                    cameraList.push({
                        id: track.trackSid,
                        name: metadata.cameraName || participant.identity || `Camera-${track.trackSid}`,
                        isActive: track.isSubscribed && !track.isMuted,
                        metadata
                    });
                }
            }
        }

        return cameraList;
    }, []);

    // Effect to cleanup room on unmount
    useEffect(() => {
        return () => {
            if (room) {
                room.disconnect();
                setRoom(null);
                setIsConnected(false);
            }
        };
    }, [room]);

    const [liveKitUrl, setLiveKitUrl] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('liveKitUrl') || process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
            : process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
    );
    const [roomName, setRoomName] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('liveKitRoom') || ''
            : '50robotics-cameras'
    );

    // Save LiveKit settings to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('liveKitUrl', liveKitUrl);
            localStorage.setItem('liveKitRoom', roomName);
        }
    }, [liveKitUrl, roomName]);

    // Connect to LiveKit room
    const connect = useCallback(async (config: LiveKitConfig) => {
        try {
            setIsConnecting(true);
            setError(null);

            // Create a new room if none exists or disconnect from current
            if (room) {
                await room.disconnect();
            }

            // Create new room
            const newRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
                publishDefaults: {
                    // videoSimulcastLayers: [
                    //     { width: 640, height: 360, fps: 15 },
                    //     { width: 320, height: 180, fps: 15 }
                    // ]
                }
            });

            // Set up event listeners
            newRoom.on(RoomEvent.ParticipantConnected, () => {
                setCameras(extractCamerasFromRoom(newRoom));
            });

            newRoom.on(RoomEvent.ParticipantDisconnected, () => {
                setCameras(extractCamerasFromRoom(newRoom));
            });

            newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === Track.Kind.Video) {
                    setCameras(extractCamerasFromRoom(newRoom));
                }
            });

            newRoom.on(RoomEvent.TrackUnsubscribed, () => {
                setCameras(extractCamerasFromRoom(newRoom));
            });

            newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
                setIsConnected(state === ConnectionState.Connected);
                setIsConnecting(state === ConnectionState.Connecting);

                if (state === ConnectionState.Disconnected) {
                    setCameras([]);
                }
            });

            // If token is provided, use it directly
            if (config.token) {
                await newRoom.connect(config.url, config.token);
            }
            // Otherwise, generate a token automatically
            else {
                const username = `dashboard-${Math.random().toString(16).slice(2, 10)}`;
                const { token, url } = await generateLiveKitToken({
                    room: config.roomName,
                    username: username,
                    // metadata: JSON.stringify({ type: 'dashboard-viewer' })
                });

                await newRoom.connect(url, token);
            }

            // Subscribe to all video tracks
            newRoom.remoteParticipants.forEach(participant => {
                participant.videoTrackPublications.forEach(track => {
                    if (!track.isSubscribed) {
                        track.setSubscribed(true);
                    }
                });
            });

            // Set room and extract cameras
            setRoom(newRoom);
            setCameras(extractCamerasFromRoom(newRoom));

        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to connect to LiveKit room'));
            console.error('LiveKit connection error:', err);
        } finally {
            setIsConnecting(false);
        }
    }, [room, extractCamerasFromRoom]);
    // Disconnect from room
    const disconnect = useCallback(() => {
        if (room) {
            room.disconnect();
            setRoom(null);
            setIsConnected(false);
            setCameras([]);
        }
    }, [room]);




    // Context value
    const value = {
        room,
        isConnected,
        isConnecting,
        error,
        cameras,
        connect,
        disconnect
    };

    return (
        <LiveKitContext.Provider value={value}>
            {children}
        </LiveKitContext.Provider>
    );
}