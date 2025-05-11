import { useState, useEffect, useRef } from 'react';
import { IntrusionDetectionWidgetConfig, WidgetData, IntrusionData } from '@/types/dashboard';
import { useWidgetData } from '@/hooks/use-widget-data';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type IntrusionDetectionWidgetProps = {
    widget: IntrusionDetectionWidgetConfig;
    data: WidgetData;
};

type IntrusionDetectionData = {
    timestamp: string;
    intrusions: IntrusionData[];
    resolution: [number, number];
    frame: {
        mime: string;
        data: string;
    };
};

export function IntrusionDetectionWidget({ widget, data }: IntrusionDetectionWidgetProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract configuration options
    const {
        showConfidence = true,
        highlightColor = '#ff0000',
        showLabels = true,
        maxDetections = 10
    } = widget;

    // Process intrusion detection data
    useEffect(() => {

        console.log('Processing intrusion detection data:', data);

        if (!data || !data.value) return;

        setLoading(true);
        setError(null);

        try {
            let detectionData: IntrusionDetectionData;

            // Parse data if it's a string
            if (typeof data.value === 'string') {
                try {
                    detectionData = JSON.parse(data.value);
                } catch (err) {
                    throw new Error('Invalid JSON data format');
                }
            } else if (typeof data.value === 'object') {
                detectionData = data.value as IntrusionDetectionData;
            } else {
                throw new Error('Unsupported data format');
            }

            if (!detectionData.frame || !detectionData.frame.data) {
                throw new Error('Missing frame data');
            }

            if (!detectionData.intrusions || !Array.isArray(detectionData.intrusions)) {
                throw new Error('Missing or invalid intrusions data');
            }

            // Load image
            const img = new Image();

            img.onload = () => {
                // Draw image and bounding boxes once image is loaded
                drawDetectionResults(img, detectionData);
                setLoading(false);
            };

            img.onerror = () => {
                setError('Failed to load image');
                setLoading(false);
            };

            // Set image source - handle both base64 and URL formats
            if (detectionData.frame.data.startsWith('/')) {
                // Already a base64 data URL
                img.src = `data:${detectionData.frame.mime || 'image/jpeg'};base64,${detectionData.frame.data}`;
            } else if (detectionData.frame.data.startsWith('data:')) {
                // Already a complete data URL
                img.src = detectionData.frame.data;
            } else {
                // Assume it's a direct URL
                img.src = detectionData.frame.data;
            }

            // Store image reference
            imageRef.current = img;

        } catch (err) {
            console.error('Error processing intrusion detection data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setLoading(false);
        }
    }, [data, showConfidence, highlightColor, showLabels, maxDetections]);

    // Draw detection results on canvas
    const drawDetectionResults = (img: HTMLImageElement, detectionData: IntrusionDetectionData) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get intrusions and limit to max
        const intrusions = detectionData.intrusions.slice(0, maxDetections);

        // Get image dimensions
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Set canvas dimensions to match image
        canvas.width = imgWidth;
        canvas.height = imgHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw bounding boxes
        intrusions.forEach(intrusion => {
            const [x1, y1, x2, y2] = intrusion.box;

            // Convert normalized coordinates to pixel coordinates
            const boxX = x1 * imgWidth;
            const boxY = y1 * imgHeight;
            const boxWidth = (x2 - x1) * imgWidth;
            const boxHeight = (y2 - y1) * imgHeight;

            // Draw bounding box
            ctx.lineWidth = Math.max(2, imgWidth / 100); // Scale line width based on image size
            ctx.strokeStyle = highlightColor;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Draw semi-transparent background for label
            if (showLabels) {
                const fontSize = Math.max(12, imgWidth / 40); // Scale font size based on image size
                const label = `${intrusion.class_name}${showConfidence ? ` ${Math.round(intrusion.confidence * 100)}%` : ''}`;
                ctx.font = `${fontSize}px sans-serif`;
                const labelWidth = ctx.measureText(label).width + 10;
                const labelHeight = fontSize + 10;

                ctx.fillStyle = `${highlightColor}B3`; // Add 70% opacity
                ctx.fillRect(boxX, boxY - labelHeight, labelWidth, labelHeight);

                // Draw label text
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, boxX + 5, boxY - 5);
            }
        });
    };

    // For development/demo, use placeholder if no data or in error state
    // const usePlaceholder = !data?.value || error || (process.env.NODE_ENV === 'development' && !imageRef.current);

    // // Render a fallback image in development mode
    // const renderPlaceholder = () => {
    //     if (canvasRef.current) {
    //         const ctx = canvasRef.current.getContext('2d');
    //         if (!ctx) return;

    //         // Set canvas size
    //         canvasRef.current.width = 580;
    //         canvasRef.current.height = 580;

    //         // Fill with gradient background
    //         const gradient = ctx.createLinearGradient(0, 0, 580, 580);
    //         gradient.addColorStop(0, '#1a1a1a');
    //         gradient.addColorStop(1, '#333333');
    //         ctx.fillStyle = gradient;
    //         ctx.fillRect(0, 0, 580, 580);

    //         // Draw placeholder text
    //         ctx.font = '24px sans-serif';
    //         ctx.fillStyle = '#ffffff';
    //         ctx.textAlign = 'center';
    //         ctx.fillText('Detection Image Placeholder', 290, 280);

    //         // Draw sample detection box
    //         ctx.lineWidth = 4;
    //         ctx.strokeStyle = highlightColor;
    //         ctx.strokeRect(290 - 174, 290 - 87, 348, 174);

    //         // Draw label
    //         ctx.fillStyle = `${highlightColor}B3`;
    //         ctx.fillRect(290 - 174, 290 - 87 - 34, 100, 34);
    //         ctx.fillStyle = '#ffffff';
    //         ctx.textAlign = 'left';
    //         ctx.font = '16px sans-serif';
    //         ctx.fillText('luchok 100%', 290 - 174 + 5, 290 - 87 - 10);
    //     }
    // };

    // Use placeholder in development mode
    // useEffect(() => {
    //     if (usePlaceholder) {
    //         renderPlaceholder();
    //     }
    // }, [usePlaceholder]);

    // If there's an error, show error message
    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="relative flex-1 overflow-hidden">
                {/* Canvas for displaying image and annotations */}
                <canvas
                    ref={canvasRef}
                    className={cn(
                        "w-full h-full object-contain",
                        { "opacity-50": loading }
                    )}
                />

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {/* Timestamp footer */}
            <div className="mt-2 text-xs text-right text-muted-foreground">
                Last detection: {new Date(data?.timestamp || '').toLocaleString()}
            </div>
        </div>
    );
}