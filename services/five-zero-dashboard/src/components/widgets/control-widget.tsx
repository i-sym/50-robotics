import { useState } from 'react';
import { ControlWidgetConfig, WidgetData } from '@/types/dashboard';
import { useControlPoint } from '@/hooks/use-mqtt';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Power, RefreshCw } from 'lucide-react';
import { formatValue } from '@/lib/utils';

type ControlWidgetProps = {
    widget: ControlWidgetConfig;
    data: WidgetData;
};

export function ControlWidget({ widget, data }: ControlWidgetProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingValue, setPendingValue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Create data source and control topics from the widget config
    const valueTopic = widget.dataSource || '';
    const controlTopic = widget.controlPoint || '';

    // Get current value and control function
    const { currentValue, isConnected, sendCommand } = useControlPoint({
        valueTopic,
        controlTopic,
        enabled: !!valueTopic && !!controlTopic,
    });

    // Use the data from props if the control point hook doesn't have a value yet
    const value = currentValue !== undefined ? currentValue : data.value;

    // Convert value to boolean for toggle/button controls
    const getBooleanValue = (val: any): boolean => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val !== 0;
        if (typeof val === 'string') {
            return ['true', 'yes', 'on', '1'].includes(val.toLowerCase());
        }
        return !!val;
    };

    // Get labels from config or use defaults
    const trueLabel = widget.labels?.true || 'ON';
    const falseLabel = widget.labels?.false || 'OFF';

    // Convert current value to the appropriate type
    const getTypedValue = () => {
        switch (widget.controlType) {
            case 'toggle':
                return getBooleanValue(value);
            case 'slider':
                return typeof value === 'number' ? value : 0;
            case 'button':
                return getBooleanValue(value);
            default:
                return value;
        }
    };

    const typedValue = getTypedValue();

    // Handle value change request
    const handleValueChange = (newValue: any) => {
        if (widget.confirmationRequired) {
            setPendingValue(newValue);
            setIsConfirmOpen(true);
        } else {
            sendControlCommand(newValue);
        }
    };

    // Send command to control point
    const sendControlCommand = async (newValue: any) => {
        setIsLoading(true);
        await sendCommand(newValue);
        setIsLoading(false);
        setPendingValue(null);
    };

    // Confirmation dialog for critical actions
    const ConfirmationDialog = () => (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    <AlertDialogDescription>
                        {widget.confirmationMessage || 'Are you sure you want to perform this action?'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => sendControlCommand(pendingValue)}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    // Render different control types
    const renderControl = () => {
        switch (widget.controlType) {
            case 'toggle':
                return (
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{typedValue ? trueLabel : falseLabel}</span>
                        <Switch
                            checked={typedValue}
                            onCheckedChange={handleValueChange}
                            disabled={isLoading || !isConnected}
                        />
                    </div>
                );

            case 'slider':
                const { min = 0, max = 100, step = 1 } = widget.range || {};
                return (
                    <div className="w-full">
                        <div className="mb-2 flex justify-between items-center">
                            <span className="text-sm">{formatValue(typedValue, 1)}</span>
                            {widget.range && (
                                <span className="text-xs text-muted-foreground">
                                    {min} - {max}
                                </span>
                            )}
                        </div>
                        <Slider
                            value={[typedValue]}
                            min={min}
                            max={max}
                            step={step}
                            onValueChange={values => handleValueChange(values[0])}
                            disabled={isLoading || !isConnected}
                        />
                    </div>
                );

            case 'button':
                return (
                    <Button
                        variant={typedValue ? "default" : "outline"}
                        className="w-full h-16"
                        onClick={() => handleValueChange(!typedValue)}
                        disabled={isLoading || !isConnected}
                    >
                        {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Power className="h-4 w-4 mr-2" />
                        )}
                        {typedValue ? trueLabel : falseLabel}
                    </Button>
                );

            default:
                return <div>Unsupported control type: {widget.controlType}</div>;
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            {renderControl()}
            <ConfirmationDialog />

            {!isConnected && (
                <div className="mt-auto pt-4 text-xs text-destructive">
                    Not connected to control system
                </div>
            )}
        </div>
    );
}