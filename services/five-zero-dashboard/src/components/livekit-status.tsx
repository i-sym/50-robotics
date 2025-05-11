'use client';

import { useState, useEffect } from 'react';
import { useLiveKit } from '@/context/livekit-context';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

export function LiveKitStatus() {
    const { isConnected, isConnecting, cameras, error } = useLiveKit();
    const [showDetails, setShowDetails] = useState(false);

    // Auto-hide details after 5 seconds
    useEffect(() => {
        if (showDetails) {
            const timer = setTimeout(() => {
                setShowDetails(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showDetails]);

    // If no camera widgets are used, don't show status
    if (!isConnected && !isConnecting && !error) {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip open={showDetails} onOpenChange={setShowDetails}>
                <TooltipTrigger asChild>
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
                                    ? `Cameras (${cameras.length})`
                                    : 'Cameras Offline'}
                        </span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <div className="text-sm p-1">
                        {isConnected ? (
                            <>
                                <p className="font-medium">Connected Cameras: {cameras.length}</p>
                                {cameras.length > 0 && (
                                    <ul className="mt-1">
                                        {cameras.slice(0, 3).map(camera => (
                                            <li key={camera.id} className="text-xs">• {camera.name}</li>
                                        ))}
                                        {cameras.length > 3 && <li className="text-xs">• ...</li>}
                                    </ul>
                                )}
                                <Link href="/cameras" className="text-xs text-primary block mt-2">
                                    Manage Cameras
                                </Link>
                            </>
                        ) : error ? (
                            <>
                                <p className="font-medium text-red-500">Connection Error</p>
                                <p className="text-xs mt-1">{error.message}</p>
                                <Link href="/cameras" className="text-xs text-primary block mt-2">
                                    Check Camera Settings
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="font-medium">Camera System Disconnected</p>
                                <Link href="/cameras" className="text-xs text-primary block mt-2">
                                    Connect to Cameras
                                </Link>
                            </>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}