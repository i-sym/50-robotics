export type BoundingBox = [number, number, number, number]; // [x, y, width, height] normalized 0-1

export type Intrusion = {
    class_name: string;
    confidence: number;
    box: BoundingBox;
};

export type AnomalyDetectionData = {
    timestamp: string;
    intrusions: Intrusion[];
    resolution: [number, number];
    frame: {
        mime: string;
        data: string;
    };
};

export type AnomalyDetectionState = {
    current: AnomalyDetectionData | null;
    history: AnomalyDetectionData[];
    lastUpdate: string;
    isLoading: boolean;
    error: Error | null;
};