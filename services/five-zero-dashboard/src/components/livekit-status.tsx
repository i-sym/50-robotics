'use client';

import { useState } from 'react';
import { useLiveKit } from '@/store/use-livekit-store';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, RefreshCw } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

export function LiveKitStatus() {
    const { isConnected, isConnecting, cameras, error, connect, disconnect } = useLiveKit();
    const [showPopover, setShowPopover] = useState(false);

    const handleConnect = async () => {
        try {
            // Get LIVEKIT_URL from environment or use default one
            const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';

            // Connect to LiveKit with default room
            await connect({
                url: liveKitUrl,
                roomName: 'machine-cameras' // Default room name
            });
        } catch (err) {
            console.error('Error connecting to LiveKit:', err);
        }
    };

    const handleDisconnect = () => {
        disconnect();
    };

    return (
        <TooltipProvider>
            <Popover open={showPopover} onOpenChange={setShowPopover}>
                <PopoverTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`
              flex items-center gap-1 cursor-pointer
              ${isConnected
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'}
            `}
                    >
                        {isConnecting ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : isConnected ? (
                            <Video className="h-3 w-3" />
                        ) : (
                            <VideoOff className="h-3 w-3" />
                        )}
                        <span>
                            {isConnecting
                                ? 'Connecting'
                                : isConnected
                                    ? `LiveKit (${cameras.length})`
                                    : 'LiveKit'}
                        </span>
                    </Badge>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="w-64">
                    <div className="space-y-2">
                        <h4 className="font-medium">Camera Streaming</h4>
                        <p className="text-sm text-muted-foreground">
                            {isConnected
                                ? `Connected to ${cameras.length} cameras`
                                : "Camera system disconnected"}
                        </p>

                        {isConnected && cameras.length > 0 && (
                            <div className="mt-1">
                                <h5 className="text-xs font-medium">Available cameras:</h5>
                                <ul className="text-xs text-muted-foreground">
                                    {cameras.slice(0, 3).map(camera => (
                                        <li key={camera.id}>• {camera.name}</li>
                                    ))}
                                    {cameras.length > 3 && <li>• ...</li>}
                                </ul>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                        )}

                        <div className="flex gap-2 mt-2">
                            {isConnected ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDisconnect}
                                    className="w-full"
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="w-full"
                                >
                                    {isConnecting ? "Connecting..." : "Connect"}
                                </Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
}