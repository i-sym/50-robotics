import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ChartWidgetConfig, WidgetData, MQTTMessage } from '@/types/dashboard';
import { useTimeRangeData } from '@/hooks/use-widget-data';
import { useTheme } from 'next-themes';
import { formatValue } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

type ChartWidgetProps = {
    widget: ChartWidgetConfig;
    data: WidgetData;
};

export function ChartWidget({ widget, data }: ChartWidgetProps) {
    const { theme } = useTheme();
    const isDarkTheme = theme === 'dark';

    // Extract values from props
    const { timeRange, units } = widget;

    // Format chart data from history
    const filteredData = useTimeRangeData(data.history || [], timeRange);

    // If no data, show empty state
    if (!filteredData || filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Format data for the chart
    const chartData = filteredData.map((item) => ({
        timestamp: new Date(item.timestamp),
        value: typeof item.value === 'number' ? item.value : 0,
    }));

    // Calculate min and max for better Y axis scaling
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // Add 10% padding

    // Format time for X axis
    const formatXAxis = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover text-popover-foreground p-2 rounded shadow-md text-sm">
                    <p>{formatXAxis(data.timestamp)}</p>
                    <p className="font-medium">{`${formatValue(data.value, 2)} ${units}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#27272a' : '#e5e5e5'} />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 10 }}
                        tickMargin={10}
                        stroke={isDarkTheme ? '#71717a' : '#a1a1aa'}
                    />
                    <YAxis
                        domain={[Math.max(0, min - padding), max + padding]}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `${formatValue(value, 1)}`}
                        stroke={isDarkTheme ? '#71717a' : '#a1a1aa'}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                        y={typeof data.value === 'number' ? data.value : 0}
                        stroke="#ff9800"
                        strokeDasharray="3 3"
                        label={{
                            value: 'Current',
                            position: 'insideBottomRight',
                            fill: '#ff9800',
                            fontSize: 10
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-right text-muted-foreground">
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
}