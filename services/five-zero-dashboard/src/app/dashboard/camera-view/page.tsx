'use client';

import { useEffect, useState } from 'react';
import { useLiveKit } from '@/context/livekit-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CameraOff, RefreshCw, Video, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraWidgetConfig } from '@/types/dashboard';
import { CameraWidget } from '@/components/widgets/camera-widget';
import { Skeleton } from '@/components/ui/skeleton';

export default function CamerasPage() {
    const { room, isConnected, isConnecting, error, cameras, connect, disconnect } = useLiveKit();
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
    const [liveKitUrl, setLiveKitUrl] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('liveKitUrl') || process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
            : process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
    );
    const [roomName, setRoomName] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('liveKitRoom') || 'machine-cameras'
            : 'machine-cameras'
    );

    // Save LiveKit settings to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('liveKitUrl', liveKitUrl);
            localStorage.setItem('liveKitRoom', roomName);
        }
    }, [liveKitUrl, roomName]);
    const [liveKitToken, setLiveKitToken] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('liveKitToken') || ''
            : ''
    );

    // Save LiveKit settings to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('liveKitUrl', liveKitUrl);
            localStorage.setItem('liveKitToken', liveKitToken);
            localStorage.setItem('liveKitRoom', roomName);
        }
    }, [liveKitUrl, liveKitToken, roomName]);

    // Auto-connect on page load if we have settings
    useEffect(() => {
        if (liveKitUrl && liveKitToken && roomName && !isConnected && !isConnecting) {
            handleConnect();
        }
    }, []);

    // Handle connect button

    // Handle connect button
    const handleConnect = async () => {
        if (liveKitUrl && roomName) {
            try {
                await connect({
                    url: liveKitUrl,
                    roomName: roomName
                });
            } catch (err) {
                console.error('Failed to connect to LiveKit:', err);
            }
        }
    };

    // Select the first camera when cameras list changes
    useEffect(() => {
        if (cameras.length > 0 && !selectedCamera) {
            setSelectedCamera(cameras[0].name);
        }
    }, [cameras, selectedCamera]);

    // Create a camera widget config for the selected camera
    const createCameraWidgetConfig = (cameraName: string): CameraWidgetConfig => ({
        id: `camera-${cameraName}`,
        type: 'camera',
        title: cameraName,
        cameraName,
        position: { x: 0, y: 0, width: 6, height: 4 },
        showControls: true,
        autoPlay: true,
        muted: false
    });

    // Generate grid columns based on camera count
    const getGridColumns = () => {
        if (cameras.length <= 2) return 'grid-cols-1 md:grid-cols-1';
        if (cameras.length <= 4) return 'grid-cols-1 md:grid-cols-2';
        return 'grid-cols-1 md:grid-cols-3';
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Machine Cameras</h1>

            <Tabs defaultValue="cameras" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="cameras">Camera Feeds</TabsTrigger>
                    <TabsTrigger value="settings">Connection Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="cameras">
                    {/* Connection status */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg border">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                            {isConnecting && <RefreshCw className="ml-2 h-4 w-4 animate-spin" />}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleConnect}
                                disabled={isConnecting || isConnected}
                            >
                                Connect
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={disconnect}
                                disabled={isConnecting || !isConnected}
                            >
                                Disconnect
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
                            {error.message}
                        </div>
                    )}

                    {isConnected && cameras.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
                            <CameraOff className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No cameras found in room</p>
                        </div>
                    )}

                    {isConnected && cameras.length > 0 && (
                        <>
                            {/* Camera selector tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {cameras.map(camera => (
                                    <Button
                                        key={camera.id}
                                        variant={selectedCamera === camera.name ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCamera(camera.name)}
                                    >
                                        <Video className="h-4 w-4 mr-2" />
                                        {camera.name}
                                    </Button>
                                ))}
                            </div>

                            {/* Selected camera view */}
                            {selectedCamera && (
                                <div className="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
                                    <CameraWidget widget={createCameraWidgetConfig(selectedCamera)} />
                                </div>
                            )}

                            {/* All cameras grid */}
                            <h2 className="text-lg font-semibold mb-4">All Cameras</h2>
                            <div className={`grid grid-cols-3 gap-4`}>
                                {cameras.map(camera => (
                                    <Card key={camera.id} className="overflow-hidden">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-base flex items-center justify-between">
                                                <span>{camera.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => setSelectedCamera(camera.name)}
                                                >
                                                    <Video className="h-4 w-4" />
                                                </Button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 aspect-video bg-black">
                                            <CameraWidget
                                                widget={{
                                                    ...createCameraWidgetConfig(camera.name),
                                                    showControls: false,
                                                    muted: true
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Loading state */}
                    {isConnecting && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="aspect-video rounded-lg" />
                            <Skeleton className="aspect-video rounded-lg" />
                            <Skeleton className="aspect-video rounded-lg" />
                            <Skeleton className="aspect-video rounded-lg" />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>LiveKit Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LiveKit Server URL</label>
                                <Input
                                    value={liveKitUrl}
                                    onChange={(e) => setLiveKitUrl(e.target.value)}
                                    placeholder="wss://your-livekit-server.com"
                                    disabled={isConnected || isConnecting}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Room Name</label>
                                <Input
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="machine-cameras"
                                    disabled={isConnected || isConnecting}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleConnect}
                                disabled={isConnecting || isConnected}
                            >
                                Connect to Camera System
                            </Button>

                            <div className="text-sm text-muted-foreground">
                                <p>The dashboard will automatically generate authentication tokens for you.</p>
                                <p className="mt-1">Make sure your LiveKit server is configured correctly with the environment variables.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}