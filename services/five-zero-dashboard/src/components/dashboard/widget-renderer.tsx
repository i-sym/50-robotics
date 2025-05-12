import { WidgetConfig } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeWidget } from '@/components/widgets/gauge-widget';
import { ChartWidget } from '@/components/widgets/chart-widget';
import { StatusWidget } from '@/components/widgets/status-widget';
import { ControlWidget } from '@/components/widgets/control-widget';
import { TextWidget } from '@/components/widgets/text-widget';
import { CameraWidget } from '@/components/widgets/camera-widget';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgetData } from '@/hooks/use-widget-data';
import { useState } from 'react';
import { IntrusionDetectionWidget } from '../widgets/intrusion-detection-widget';
import { Machine3DWidget } from '../widgets/machine3d-widget';

type WidgetRendererProps = {
    widget: WidgetConfig;
    dashboardId: string;
};

export function WidgetRenderer({ widget, dashboardId }: WidgetRendererProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch data for the widget
    const widgetData = useWidgetData(widget.dataSource, {
        storeHistory: widget.type === 'lineChart',
        timeRange: widget.type === 'lineChart' ? (widget as any).timeRange : undefined,
        throttle: 100, // Default throttle to prevent too frequent updates
    });

    // Handle widget refresh
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Render loading state
    if (widgetData.isLoading) {
        return (
            <Card className="h-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pb-4 flex items-center justify-center h-[calc(100%-60px)]">
                    <div className="animate-spin">
                        <RefreshCw className="h-6 w-6 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Render error state
    if (widgetData.error) {
        return (
            <Card className="h-full border-destructive">
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-4 pb-4 flex flex-col items-center justify-center h-[calc(100%-60px)]">
                    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                    <p className="text-sm text-destructive">Failed to load data</p>
                </CardContent>
            </Card>
        );
    }

    // Render different widget types
    // Render different widget types
    const renderWidget = () => {
        switch (widget.type) {
            case 'gauge':
                return <GaugeWidget widget={widget} data={widgetData} key={refreshKey} />;
            case 'lineChart':
                return <ChartWidget widget={widget} data={widgetData} key={refreshKey} />;
            case 'status':
                return <StatusWidget widget={widget} data={widgetData} key={refreshKey} />;
            case 'control':
                return <ControlWidget widget={widget} data={widgetData} key={refreshKey} />;
            case 'text':
                return <TextWidget widget={widget} data={widgetData} key={refreshKey} />;
            case 'camera':
                return <CameraWidget widget={widget} key={refreshKey} />;
            case 'machine3d':
                return <Machine3DWidget widget={widget} />;
            case 'intrusionDetection':
                return <IntrusionDetectionWidget widget={widget} data={widgetData} key={refreshKey} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Unknown widget type: {(widget as any).type}</p>
                    </div>
                );
        }
    }
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
                {/* <Button variant="ghost" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                </Button> */}
            </CardHeader>
            <CardContent className="h-full">
                {renderWidget()}
            </CardContent>
        </Card>
    );
}