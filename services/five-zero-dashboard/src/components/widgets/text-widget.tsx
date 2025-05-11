import { TextWidgetConfig, WidgetData } from '@/types/dashboard';
import { formatValue } from '@/lib/utils';

type TextWidgetProps = {
    widget: TextWidgetConfig;
    data: WidgetData;
};

export function TextWidget({ widget, data }: TextWidgetProps) {
    // Extract values from props
    const { units, decimalPlaces = 2, prefix = '', suffix = '', thresholds = [] } = widget;

    // Format the value based on type
    const formatDisplayValue = () => {
        if (typeof data.value === 'boolean') {
            return data.value ? 'True' : 'False';
        }

        if (typeof data.value === 'number') {
            return formatValue(data.value, decimalPlaces);
        }

        return String(data.value);
    };

    // Get color based on thresholds
    const getColor = () => {
        // If value is not a number or thresholds aren't defined, use default color
        if (typeof data.value !== 'number' || thresholds.length === 0) {
            return 'inherit';
        }

        // Sort thresholds by value
        const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);

        // Find the first threshold that is greater than the current value
        for (const threshold of sortedThresholds) {
            if (data.value <= threshold.value) {
                return threshold.color;
            }
        }

        // If value is greater than all thresholds, use the last one
        return sortedThresholds[sortedThresholds.length - 1].color;
    };

    const displayValue = formatDisplayValue();
    const displayColor = getColor();

    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color: displayColor }}>
                {prefix}{displayValue}{units ? ` ${units}` : ''}{suffix}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
}