'use client';

import { useState } from 'react';
import { useMQTT } from '@/store/use-mqtt-store';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';

export function MQTTStatus() {
    const { isConnected, isConnecting, error, mqttUrl, connect, disconnect } = useMQTT();
    const [showPopover, setShowPopover] = useState(false);
    const [urlInput, setUrlInput] = useState(mqttUrl);

    const handleConnect = async () => {
        await connect(urlInput);
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

                        {!isConnected && (
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="mqtt://broker-address"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                // size="sm"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500">{error.message}</p>
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
                                    disabled={isConnecting || !urlInput}
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