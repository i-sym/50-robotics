"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Power, Sparkles } from "lucide-react";
import { Label as UILabel } from "@/components/ui/label";

export default function LightControlPanel() {
    const [isOn, setIsOn] = useState<boolean>(false);

    // Function to turn lights on
    const handleLightOn = async () => {
        try {
            await fetch("http://192.168.0.166:4000/machine/control/lights/switch-on", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            setIsOn(true);
        } catch (error) {
            console.error("Failed to turn on lights:", error);
        }
    };

    // Function to turn lights off
    const handleLightOff = async () => {
        try {
            await fetch("http://192.168.0.166:4000/machine/control/lights/switch-off", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            setIsOn(false);
        } catch (error) {
            console.error("Failed to turn off lights:", error);
        }
    };

    // Function to set light color
    const setLightColor = async (red: number, green: number, blue: number) => {
        try {
            await fetch("http://192.168.0.166:4000/machine/control/lights/set-color", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ red, green, blue }),
            });
        } catch (error) {
            console.error("Failed to set light color:", error);
        }
    };

    // Auto button handler (sets green color)
    const handleAuto = () => setLightColor(0, 255, 0);

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Light Control</CardTitle>
                <CardDescription>Control the lights in the Workcell.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="w-[48%] flex gap-2">
                            <Button
                                variant={isOn ? "default" : "outline"}
                                className="flex-1 flex items-center justify-center gap-1"
                                onClick={handleLightOn}
                            >
                                <Power size={16} />
                                On
                            </Button>
                            <Button
                                variant={!isOn ? "default" : "outline"}
                                className="flex-1 flex items-center justify-center gap-1"
                                onClick={handleLightOff}
                            >
                                <Power size={16} />
                                Off
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full flex items-center gap-2"
                            onClick={handleAuto}
                        >
                            <Sparkles size={16} />
                            Auto
                        </Button>
                    </div>

                    <div>
                        <UILabel className="text-sm font-medium mb-2 block">Color Presets</UILabel>
                        <div className="grid grid-cols-3 gap-2">
                            <Button className="h-8 bg-red-500 hover:bg-red-600" onClick={() => setLightColor(255, 0, 0)} />
                            <Button className="h-8 bg-blue-500 hover:bg-blue-600" onClick={() => setLightColor(0, 0, 255)} />
                            <Button className="h-8 bg-green-500 hover:bg-green-600" onClick={() => setLightColor(0, 255, 0)} />
                            <Button className="h-8 bg-yellow-500 hover:bg-yellow-600" onClick={() => setLightColor(255, 255, 0)} />
                            <Button className="h-8 bg-purple-500 hover:bg-purple-600" onClick={() => setLightColor(128, 0, 128)} />
                            <Button className="h-8 bg-white text-black hover:bg-gray-200" onClick={() => setLightColor(255, 255, 255)} />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                        <UILabel htmlFor="brightness" className="text-sm">Brightness</UILabel>
                        <span className="text-sm font-medium">75%</span>
                    </div>
                    <Input
                        id="brightness"
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="75"
                        className="w-full accent-primary"
                    />
                </div>
            </CardFooter>
        </Card>
    )
}