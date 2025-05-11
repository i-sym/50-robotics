import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Sample dashboard configuration with camera widget
    const cameraDashboard = {
        id: "cameras",
        name: "Machine Cameras Dashboard",
        layout: {
            columns: 12,
            rowHeight: 50
        },
        widgets: [
            {
                id: "gauge-1",
                type: "gauge",
                title: "Spindle Power",
                dataSource: "/machines/cnc-1/datasources/spindle-power/value",
                minValue: 0,
                maxValue: 100,
                units: "%",
                position: { x: 0, y: 0, width: 4, height: 4 },
                thresholds: [
                    { value: 50, color: "#22c55e" },
                    { value: 80, color: "#f59e0b" },
                    { value: 90, color: "#ef4444" }
                ]
            },
            {
                id: "camera-1",
                type: "camera",
                title: "Main Camera",
                cameraName: "Camera-Main",
                position: { x: 4, y: 0, width: 8, height: 4 },
                showControls: true,
                autoPlay: true,
                muted: false
            },
            {
                id: "status-1",
                type: "status",
                title: "Machine Status",
                dataSource: "/machines/cnc-1/datasources/status/value",
                position: { x: 0, y: 4, width: 4, height: 2 },
                labels: {
                    true: "Running",
                    false: "Stopped"
                },
                colors: {
                    true: "#22c55e",
                    false: "#ef4444"
                }
            },
            {
                id: "camera-2",
                type: "camera",
                title: "Tool Area Camera",
                cameraName: "Camera-Tool",
                position: { x: 4, y: 4, width: 4, height: 4 },
                showControls: true,
                autoPlay: true,
                muted: true
            },
            {
                id: "camera-3",
                type: "camera",
                title: "Safety Zone Camera",
                cameraName: "Camera-Safety",
                position: { x: 8, y: 4, width: 4, height: 4 },
                showControls: true,
                autoPlay: true,
                muted: true
            }
        ]
    };

    return NextResponse.json(cameraDashboard);
}