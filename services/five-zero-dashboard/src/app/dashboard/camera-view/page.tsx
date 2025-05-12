'use client';

import { useEffect, useState } from 'react';
import { useLiveKit } from '@/store/use-livekit-store';
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

    // Handle disconnect button
    const handleDisconnect = () => {
        disconnect();
        setSelectedCamera(null);
    };

    // Create a mock camera widget config
    const createCameraWidget = (cameraName: string): CameraWidgetConfig => ({
        id: `camera-${cameraName}`,
        type: 'camera',
        title: cameraName,
        position: { x: 0, y: 0, width: 2, height: 2 },
        cameraName: cameraName,
        showControls: true,
        autoPlay: true,
        muted: false
    });

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Camera Streaming</h1>
                <div>
                    {isConnected ? (
                        <Button
                            variant="outline"
                            onClick={handleDisconnect}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleConnect}
                            disabled={isConnecting || !liveKitUrl || !roomName}
                        >
                            {isConnecting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4 mr-2" />
                                    Connect
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue={isConnected ? "cameras" : "settings"} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="cameras">Cameras</TabsTrigger>
                    <TabsTrigger value="settings">Connection Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="cameras" className="space-y-4">
                    {!isConnected && (
                        <div className="rounded-lg border bg-card p-10 text-center">
                            <CameraOff className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">Not connected to camera system</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Please connect to the LiveKit server to view available cameras.
                            </p>
                            <Button onClick={handleConnect} disabled={isConnecting || !liveKitUrl || !roomName}>
                                {isConnecting ? "Connecting..." : "Connect"}
                            </Button>
                        </div>
                    )}

                    {isConnected && cameras.length === 0 && (
                        <div className="rounded-lg border bg-card p-10 text-center">
                            <CameraOff className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">No cameras available</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Connected to LiveKit, but no camera streams were found.
                            </p>
                        </div>
                    )}

                    {isConnected && cameras.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {cameras.map(camera => (
                                    <Card
                                        key={camera.id}
                                        className={`cursor-pointer transition ${selectedCamera === camera.id ?
                                                'ring-2 ring-primary' : 'hover:bg-accent/50'
                                            }`}
                                        onClick={() => setSelectedCamera(
                                            selectedCamera === camera.id ? null : camera.id
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            <div className="aspect-video bg-muted mb-2 rounded relative">
                                                <CameraWidget
                                                    widget={createCameraWidget(camera.name)}
                                                />
                                            </div>
                                            <h3 className="font-medium text-sm">{camera.name}</h3>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {selectedCamera && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>
                                            {cameras.find(c => c.id === selectedCamera)?.name || 'Camera View'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video bg-muted rounded">
                                            <CameraWidget
                                                widget={createCameraWidget(
                                                    cameras.find(c => c.id === selectedCamera)?.name || ''
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>LiveKit Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LiveKit URL</label>
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