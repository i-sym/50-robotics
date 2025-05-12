'use client';

import { useState, useEffect } from 'react';
import { mqttClient } from '@/lib/mqtt-client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

export function MQTTStatus() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showPopover, setShowPopover] = useState(false);

    useEffect(() => {
        // Check initial connection state
        setIsConnected(mqttClient.isConnected());

        // Subscribe to connection changes
        const cleanup = mqttClient.onConnectionChange((connected) => {
            setIsConnected(connected);
            if (connected) {
                setIsConnecting(false);
            }
        });

        return cleanup;
    }, []);

    const handleConnect = () => {
        setIsConnecting(true);
        mqttClient.connect();
    };

    const handleDisconnect = () => {
        mqttClient.disconnect();
        setIsConnected(false);
        setIsConnecting(false);
    };

    return (
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
                        <Wifi className="h-3 w-3" />
                    ) : (
                        <WifiOff className="h-3 w-3" />
                    )}
                    <span>MQTT</span>
                </Badge>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="w-64">
                <div className="space-y-2">
                    <h4 className="font-medium">MQTT Connection</h4>
                    <p className="text-sm text-muted-foreground">
                        {isConnected
                            ? "Connected to MQTT broker"
                            : "Disconnected from MQTT broker"}
                    </p>
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
    );
}