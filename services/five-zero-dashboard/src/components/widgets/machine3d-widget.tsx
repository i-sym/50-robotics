'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Box, Environment, OrthographicCamera } from '@react-three/drei';
import { Cnc } from '@/components/3d/cnc';
import { Machine3DWidgetConfig } from '@/types/dashboard';
import { mqttClient } from '@/lib/mqtt-client';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kuka } from '../3d/Kuka';
import { WorkDesk } from '../3d/WorkDesk';

// Schema for validating incoming MQTT messages
const positionSchema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
});

type MachinePosition = z.infer<typeof positionSchema>;

export function Machine3DWidget({ widget }: { widget: Machine3DWidgetConfig }) {
    const [position, setPosition] = useState<MachinePosition>({ x: 100, y: 100, z: 0 });
    // const [isConnected, setIsConnected] = useState(false);

    return (
        <div className="w-full h-full overflow-hidden">
            {/* <CardHeader className="px-4 py-2">
                <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            </CardHeader> */}
            <div className="p-0 h-[calc(100%-40px)]">
                {/* {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80">
                        <div className="text-center p-4">
                            <p className="text-sm text-muted-foreground">
                                Waiting for MQTT connection...
                            </p>
                        </div>
                    </div>
                )} */}

                <Canvas shadows>
                    <OrthographicCamera makeDefault position={[5, 5, 5]} zoom={90} />
                    <Environment preset="city" />
                    <OrbitControls />
                    {/* <color attach="background" args={['#000000']} /> */}

                    <Suspense fallback={null}>
                        <Cnc
                            x={position.x}
                            y={position.y}
                        // z={position.z}
                        />

                    </Suspense>

                    <Suspense fallback={null}>
                        <Kuka />
                    </Suspense>

                    <Suspense fallback={null}>
                        <WorkDesk />
                    </Suspense>

                    {widget.showGrid !== false && (
                        <Grid
                            infiniteGrid
                            cellSize={0.5}
                            sectionSize={3}
                            fadeDistance={30}
                        />
                    )}

                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                    />
                </Canvas>
            </div>
        </div>
    );
}