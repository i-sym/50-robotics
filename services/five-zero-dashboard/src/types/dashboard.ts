// Dashboard and Widget type definitions

export type WidgetPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type BaseWidgetConfig = {
    id: string;
    type: string;
    title: string;
    position: WidgetPosition;
    dataSource?: string;
};

export type GaugeWidgetConfig = BaseWidgetConfig & {
    type: 'gauge';
    minValue: number;
    maxValue: number;
    units: string;
    thresholds?: {
        value: number;
        color: string;
    }[];
};

export type ChartWidgetConfig = BaseWidgetConfig & {
    type: 'lineChart';
    timeRange: string; // e.g., '15m', '1h', '24h'
    units: string;
    maxDataPoints?: number;
};

export type StatusWidgetConfig = BaseWidgetConfig & {
    type: 'status';
    labels?: {
        true?: string;
        false?: string;
    };
    colors?: {
        true?: string;
        false?: string;
    };
};

export type ControlWidgetConfig = BaseWidgetConfig & {
    type: 'control';
    controlType: 'button' | 'toggle' | 'slider';
    controlPoint: string;
    confirmationRequired?: boolean;
    confirmationMessage?: string;
    labels?: {
        true?: string;
        false?: string;
    };
    range?: {
        min: number;
        max: number;
        step: number;
    };
};

export type TextWidgetConfig = BaseWidgetConfig & {
    type: 'text';
    units?: string;
    decimalPlaces?: number;
    prefix?: string;
    suffix?: string;
    thresholds?: {
        value: number;
        color: string;
    }[];
};

export type CameraWidgetConfig = BaseWidgetConfig & {
    type: 'camera';
    cameraName: string;
    showControls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
};
export type IntrusionData = {
    class_name: string;
    confidence: number;
    box: [number, number, number, number]; // [x1, y1, x2, y2] normalized coordinates
};

export type IntrusionDetectionWidgetConfig = BaseWidgetConfig & {
    type: 'intrusionDetection';
    dataSource: string;
    showConfidence?: boolean;
    highlightColor?: string;
    showLabels?: boolean;
    maxDetections?: number;
};

export type Machine3DWidgetConfig = BaseWidgetConfig & {
    type: 'machine3d';
    mqttTopic: string; // MQTT topic for machine position
    showAxes?: boolean;
    showGrid?: boolean;
    cameraPosition?: {
        x: number;
        y: number;
        z: number;
    };
    initialRotation?: number;
};

export type WidgetConfig =
    | GaugeWidgetConfig
    | ChartWidgetConfig
    | StatusWidgetConfig
    | ControlWidgetConfig
    | TextWidgetConfig
    | CameraWidgetConfig
    | IntrusionDetectionWidgetConfig
    | Machine3DWidgetConfig;

export type DashboardLayout = {
    columns: number;
    rowHeight: number;
};

export type DashboardConfig = {
    id: string;
    name: string;
    layout: DashboardLayout;
    widgets: WidgetConfig[];
};

export type MQTTMessage = {
    value: number | boolean | string;
    timestamp: string;
};

export type WidgetData = {
    value: number | boolean | string;
    timestamp: string;
    history?: {
        value: number | boolean | string;
        timestamp: string;
    }[];
    isLoading: boolean;
    error: Error | null;
};