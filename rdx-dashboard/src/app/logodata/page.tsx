import LightControlPanel from "@/modules/light-controll-panel/LightControlPanel";
import Machine3DView from "@/modules/machine-3d-view/Machine3DView";
import { MotorPowerPanel } from "@/modules/motor-power-panel/MotorPowerPanel";
import { SpindlePowerPanel } from "@/modules/spindl-power-panel/SpindlePowerPanel";
import { SpindleRpmChartPanel } from "@/modules/spindl-rpm-panel/SpindleRpmChartPanel";
import { SpindleRpmPanel } from "@/modules/spindl-rpm-panel/SpindleRpmPanel";
import { VibrationPanel } from "@/modules/vibration-panel/VibrationPanel";
import { VideoStreamerPanel } from "@/modules/video-stream-panel/VideoStreamerPanel";

export default function Home() {
    return (
        <div className="bg-background flex items-center  justify-center  min-h-screen gap-4">
            <div className="grid gap-4 grid-cols-3">
                <SpindleRpmPanel />
                <SpindlePowerPanel />
                <MotorPowerPanel />
                <VibrationPanel />
                <SpindleRpmChartPanel />
            </div>
        </div>
    );
}