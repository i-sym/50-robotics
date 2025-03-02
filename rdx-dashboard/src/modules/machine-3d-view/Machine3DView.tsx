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
import { Maximize2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function Machine3DView() {

    const store = createXRStore()


    const [x, setX] = useState(-850);
    const [y, setY] = useState(0);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setX(Number(event.target.value));
    };

    return (

        <Card >
            <CardHeader>
                <CardTitle className="relative">3D View
                    <Dialog>
                        <DialogTrigger className="absolute right-0 top-0">
                            <Maximize2 className="h-5 w-5 cursor-pointer" />
                        </DialogTrigger>
                        <DialogContent className="w-7xl">
                            <DialogHeader >
                                <DialogTitle>Live feed</DialogTitle>
                                <DialogDescription>

                                </DialogDescription>
                            </DialogHeader>
                            <div className="">
                                <div className="aspect-[4/3] w-full">
                                    <Canvas camera={{ position: [2, 2, 2], zoom: 140 }} orthographic>
                                        {/* <XR store={store} > */}
                                        <ambientLight intensity={0.5} />
                                        <Environment preset="city" environmentIntensity={0.5} background={false} />
                                        <group position={[-0.3, 0 - 0.5, 0]}>
                                            <Model />
                                            <Kuka />

                                            <MovableCNCMachine />
                                            {/* </XR> */}
                                        </group>

                                        {/* <OrbitControls /> */}
                                    </Canvas>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </CardTitle>
                <CardDescription>View the 3D model of the Workcell.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-[4/3] w-full">
                    <Canvas camera={{ position: [2, 2, 2], zoom: 140 }} orthographic>
                        {/* <XR store={store} > */}
                        <ambientLight intensity={0.5} />
                        <Environment preset="city" environmentIntensity={0.5} background={false} />
                        <group position={[-0.3, 0 - 0.5, 0]}>
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