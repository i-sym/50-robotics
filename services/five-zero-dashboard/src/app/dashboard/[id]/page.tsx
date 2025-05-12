'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { useMockDashboardConfig, useDashboardConfig } from '@/hooks/use-dashboard-config';
import { mqttClient } from '@/lib/mqtt-client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import {
    RefreshCw,
    MoreVertical,
    Download,
    Settings,
    Clock,
    SunMoon,
    Moon,
    Sun,
    Loader2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';


import { CameraConnectionManager } from './camera-connections';
import { LiveKitStatus } from '@/components/livekit-status';

export default function DashboardPage() {
    const params = useParams();
    const dashboardId = params.id as string;
    const { theme, setTheme } = useTheme();

    // In development mode, use mock data. In production, use real API.
    const {
        dashboard,
        isLoading,
        isError,
        mutate
    } = process.env.NODE_ENV === 'development'
            ? useMockDashboardConfig(dashboardId)
            : useDashboardConfig(dashboardId);

    // Connect to MQTT broker when the component mounts
    useEffect(() => {
        mqttClient.connect();

        // Cleanup on unmount
        return () => {
            // Don't disconnect on unmount to keep the connection alive
            // for better performance when switching between pages
            // mqttClient.disconnect();
        };
    }, []);

    // Handle refresh button click
    const handleRefresh = () => {
        mutate();
    };

    // Handle theme toggle
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Download dashboard configuration as JSON
    const downloadDashboardConfig = () => {
        if (!dashboard) return;

        const jsonString = JSON.stringify(dashboard, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${dashboard.id}-config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-20 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    // Render error state
    if (isError || !dashboard) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <div className="text-destructive text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-destructive mb-2">Dashboard Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    The dashboard "{dashboardId}" could not be loaded.
                </p>
                <Button onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Dashboard toolbar */}
            {dashboard && <CameraConnectionManager dashboard={dashboard} />}

            <div className="sticky top-0 z-10 bg-background border-b p-4 flex flex-wrap items-center justify-between gap-4">
                {/* <div className="flex items-center gap-4">
                    <Select defaultValue="15m">
                        <SelectTrigger className="w-[140px]">
                            <Clock className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5m">Last 5 minutes</SelectItem>
                            <SelectItem value="15m">Last 15 minutes</SelectItem>
                            <SelectItem value="1h">Last 1 hour</SelectItem>
                            <SelectItem value="6h">Last 6 hours</SelectItem>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <LiveKitStatus />

                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                            {theme === 'dark' ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={downloadDashboardConfig}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Configuration
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Dashboard Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div> */}

                {/* Dashboard content */}
                <DashboardGrid dashboard={dashboard} />
            </div>
        </div>
    );
}