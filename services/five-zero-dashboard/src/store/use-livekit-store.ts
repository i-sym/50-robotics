'use client';

import { create } from 'zustand';
import {
    Room,
    RoomEvent,
    RemoteTrackPublication,
    Track,
    Participant,
    ConnectionState
} from 'livekit-client';
import { LiveKitConfig, CameraStreamInfo } from '@/types/livekit';
import { generateLiveKitToken } from '@/lib/livekit-token';
import { getLiveKitConfig } from '@/actions/config';

interface LiveKitStore {
    // State
    room: Room | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    cameras: CameraStreamInfo[];

    // Actions
    connect: (config: LiveKitConfig) => Promise<void>;
    disconnect: () => void;

    // Internal helpers
    extractCamerasFromRoom: (room: Room) => CameraStreamInfo[];
}

// Helper to persist LiveKit URL and room settings
const loadSavedSettings = () => {
    if (typeof window !== 'undefined') {
        return {
            liveKitUrl: localStorage.getItem('liveKitUrl') || '',
            roomName: localStorage.getItem('liveKitRoom') || '50robotics-cameras'
        };
    }
    return {
        liveKitUrl: '',
        roomName: '50robotics-cameras'
    };
};

// Helper to save LiveKit settings
const saveLiveKitSettings = (url: string, room: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('liveKitUrl', url);
        localStorage.setItem('liveKitRoom', room);
    }
};

export const useLiveKitStore = create<LiveKitStore>((set, get) => {
    // Load saved settings
    const { liveKitUrl, roomName } = loadSavedSettings();

    return {
        // Initial state
        room: null,
        isConnected: false,
        isConnecting: false,
        error: null,
        cameras: [],

        // Helper to extract camera information from room
        extractCamerasFromRoom: (room: Room): CameraStreamInfo[] => {
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
        },

        // Connect to LiveKit room
        connect: async (config: LiveKitConfig) => {
            try {
                set({ isConnecting: true, error: null });

                // Save settings
                saveLiveKitSettings(config.url, config.roomName || roomName);

                // Disconnect from current room if exists
                const currentRoom = get().room;
                if (currentRoom) {
                    await currentRoom.disconnect();
                }

                // Create new room with optimal settings
                const newRoom = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    publishDefaults: {
                        // videoSimulcastLayers: [
                        //   { width: 640, height: 360, fps: 15 },
                        //   { width: 320, height: 180, fps: 15 }
                        // ]
                    }
                });

                // Set up event listeners
                newRoom.on(RoomEvent.ParticipantConnected, () => {
                    set({ cameras: get().extractCamerasFromRoom(newRoom) });
                });

                newRoom.on(RoomEvent.ParticipantDisconnected, () => {
                    set({ cameras: get().extractCamerasFromRoom(newRoom) });
                });

                newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === Track.Kind.Video) {
                        set({ cameras: get().extractCamerasFromRoom(newRoom) });
                    }
                });

                newRoom.on(RoomEvent.TrackUnsubscribed, () => {
                    set({ cameras: get().extractCamerasFromRoom(newRoom) });
                });

                newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
                    set({
                        isConnected: state === ConnectionState.Connected,
                        isConnecting: state === ConnectionState.Connecting
                    });

                    if (state === ConnectionState.Disconnected) {
                        set({ cameras: [] });
                    }
                });

                // Connect with provided token or generate one
                if (config.token) {
                    await newRoom.connect(config.url, config.token);
                } else {
                    const username = `dashboard-${Math.random().toString(16).slice(2, 10)}`;
                    const { token, url } = await generateLiveKitToken({
                        room: config.roomName || roomName,
                        username: username,
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

                // Update state
                set({
                    room: newRoom,
                    cameras: get().extractCamerasFromRoom(newRoom)
                });

            } catch (err) {
                set({
                    error: err instanceof Error ? err : new Error('Failed to connect to LiveKit room')
                });
                console.error('LiveKit connection error:', err);
            } finally {
                set({ isConnecting: false });
            }
        },

        // Disconnect from room
        disconnect: () => {
            const { room } = get();
            if (room) {
                room.disconnect();
                set({
                    room: null,
                    isConnected: false,
                    cameras: []
                });
            }
        }
    };
});

// Export a React hook-compatible version for easier access to the LiveKit store
export const useLiveKit = useLiveKitStore;