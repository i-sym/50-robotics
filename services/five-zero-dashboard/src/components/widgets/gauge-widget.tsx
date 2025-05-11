import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GaugeWidgetConfig } from '@/types/dashboard';
import { WidgetData } from '@/types/dashboard';
import { useTheme } from 'next-themes';
import { formatValue } from '@/lib/utils';

type GaugeWidgetProps = {
    widget: GaugeWidgetConfig;
    data: WidgetData;
};

export function GaugeWidget({ widget, data }: GaugeWidgetProps) {
    const { theme } = useTheme();
    const isDarkTheme = theme === 'dark';

    // Extract values from props
    const { minValue, maxValue, units, thresholds = [] } = widget;
    const value = typeof data.value === 'number' ? data.value : 0;

    // Normalize value to percentage for the gauge
    const normalizedValue = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));

    // Calculate color based on thresholds
    const getColor = (value: number) => {
        // If thresholds are defined, use them
        if (thresholds.length > 0) {
            // Sort thresholds by value
            const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);

            // Find the first threshold that is greater than the current value
            for (const threshold of sortedThresholds) {
                if (value <= threshold.value) {
                    return threshold.color;
                }
            }

            // If value is greater than all thresholds, use the last one
            return sortedThresholds[sortedThresholds.length - 1].color;
        }

        // Default colors if no thresholds are defined
        if (normalizedValue < 50) return '#22c55e'; // green-500
        if (normalizedValue < 80) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    // Prepare data for the gauge chart
    const gaugeData = [
        { name: 'value', value: normalizedValue },
        { name: 'remaining', value: 100 - normalizedValue },
    ];

    // Define colors for the gauge
    const COLORS = [getColor(value), isDarkTheme ? '#27272a' : '#f4f4f5']; // Value color and background

    const valueColor = getColor(value);

    // Customize tooltip to show actual value
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            if (payload[0].name === 'remaining') return null;

            return (
                <div className="bg-popover text-popover-foreground p-2 rounded shadow-md text-sm">
                    <p>{`${formatValue(value, 1)} ${units}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="relative h-full w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="60%"
                            outerRadius="80%"
                            paddingAngle={0}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                    <div className="text-xl mt-16 font-bold" style={{ color: valueColor }}>
                        {formatValue(value, 1)}
                    </div>
                    <div className="text-sm text-muted-foreground">{units}</div>
                </div>
            </div>
            <div className="w-full flex justify-between text-xs text-muted-foreground mt-2">
                <span>{minValue}{units}</span>
                <span>{maxValue}{units}</span>
            </div>
        </div>
    );
}