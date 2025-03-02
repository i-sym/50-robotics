'use client'
import { Cnc } from "@/components/Cnc";
import { Kuka } from "@/components/Kuka";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Model } from "@/components/WorkDesk";
import { Environment, OrbitControls, OrthographicCamera, Wireframe } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { MovableCNCMachine } from "../moveable-cnc-machine/MovableCNCMachine";
export default function Machine3DView() {

    const store = createXRStore()


    const [x, setX] = useState(-850);
    const [y, setY] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setX(Number(event.target.value));
    };

    return (


        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>3D View</CardTitle>
                <CardDescription>View the 3D model of the Workcell.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-square">
                    <Canvas camera={{ position: [2, 2, 2], zoom: 100 }} orthographic>
                        {/* <XR store={store} > */}
                        <ambientLight intensity={0.5} />
                        <Environment preset="city" environmentIntensity={0.5} background={false} />
                        <group position={[-0.3, 0, 0]}>
                            <Model />
                            <Kuka />

                            <MovableCNCMachine />
                            {/* </XR> */}
                        </group>

                        {/* <OrbitControls /> */}
                    </Canvas>
                </div>
            </CardContent>
        </Card >
    )
}