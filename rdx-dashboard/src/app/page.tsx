import Image from "next/image";
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SpindleRpmPanel } from "@/modules/spindl-rpm-panel/SpindleRpmPanel";
import { VibrationChartPanel } from "@/modules/vibration-panel/ViberationChartPanel";
import { VideoStreamerPanel } from "@/modules/video-stream-panel/VideoStreamerPanel";
import Machine3DView from "@/modules/machine-3d-view/Machine3DView";
import LightControlPanel from "@/modules/light-controll-panel/LightControlPanel";
import { SpindlePowerPanel } from "@/modules/spindl-power-panel/SpindlePowerPanel";
import { MotorPowerPanel } from "@/modules/motor-power-panel/MotorPowerPanel";
import { VibrationPanel } from "@/modules/vibration-panel/VibrationPanel";
import { SpindleRpmChartPanel } from "@/modules/spindl-rpm-panel/SpindleRpmChartPanel";
import { SpinlePowerChartPanel } from "@/modules/spindl-power-panel/SpindlePowerChartPanel";
import { MotorPowerChartPanel } from "@/modules/motor-power-panel/MotorPowerChartPanel";
import { ControllPanel } from "@/modules/controll-panel/ControllPanel";

export function CardWithForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}

export default function Home() {
  return (
    <div className="bg-background flex items-center justify-center  min-h-screen gap-4">
      <div className="grid gap-4 grid-cols-3">
        <VideoStreamerPanel />
        <Machine3DView />
        <ControllPanel />
        <LightControlPanel />
        <SpindleRpmPanel />
        <SpindlePowerPanel />
        <MotorPowerPanel />
        <VibrationPanel />

        <VibrationChartPanel />
        <SpindleRpmChartPanel />
        <SpinlePowerChartPanel />
        <MotorPowerChartPanel />
      </div>
    </div>
  );
}
