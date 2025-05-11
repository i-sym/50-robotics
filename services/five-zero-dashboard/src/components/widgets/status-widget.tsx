import { StatusWidgetConfig, WidgetData } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';

type StatusWidgetProps = {
    widget: StatusWidgetConfig;
    data: WidgetData;
};

export function StatusWidget({ widget, data }: StatusWidgetProps) {
    // Convert any value type to boolean
    const getBooleanValue = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') {
            return ['true', 'yes', 'on', '1'].includes(value.toLowerCase());
        }
        return !!value;
    };

    const isActive = getBooleanValue(data.value);

    // Get labels from config or use defaults
    const trueLabel = widget.labels?.true || 'Active';
    const falseLabel = widget.labels?.false || 'Inactive';

    // Get colors from config or use defaults
    const trueColor = widget.colors?.true || '#22c55e'; // green-500
    const falseColor = widget.colors?.false || '#ef4444'; // red-500

    // Determine status color, label and icon
    const statusColor = isActive ? trueColor : falseColor;
    const statusLabel = isActive ? trueLabel : falseLabel;
    const StatusIcon = isActive ? Check : X;

    // Function to determine the badge variant based on the status
    const getBadgeVariant = () => {
        if (isActive) {
            return 'default';
        }
        return 'destructive';
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${statusColor}20` }} // Use color with transparency
            >
                <StatusIcon
                    className="h-10 w-10"
                    style={{ color: statusColor }}
                />
            </div>

            <Badge
                variant={getBadgeVariant()}
                className="px-3 py-1 text-sm font-medium"
            >
                {statusLabel}
            </Badge>

            <div className="mt-4 text-sm text-muted-foreground">
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
}