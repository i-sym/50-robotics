import LightControlPanel from "@/modules/light-controll-panel/LightControlPanel";
import Machine3DView from "@/modules/machine-3d-view/Machine3DView";
import { MotorPowerChartPanel } from "@/modules/motor-power-panel/MotorPowerChartPanel";
import { MotorPowerPanel } from "@/modules/motor-power-panel/MotorPowerPanel";
import { SpinlePowerChartPanel } from "@/modules/spindl-power-panel/SpindlePowerChartPanel";
import { SpindlePowerPanel } from "@/modules/spindl-power-panel/SpindlePowerPanel";
import { SpindleRpmChartPanel } from "@/modules/spindl-rpm-panel/SpindleRpmChartPanel";
import { SpindleRpmPanel } from "@/modules/spindl-rpm-panel/SpindleRpmPanel";
import { VibrationChartPanel } from "@/modules/vibration-panel/ViberationChartPanel";
import { VibrationPanel } from "@/modules/vibration-panel/VibrationPanel";
import { VideoStreamerPanel } from "@/modules/video-stream-panel/VideoStreamerPanel";

export default function Home() {
    return (
        <div className="bg-background flex items-start  justify-center  min-h-screen gap-4">
            <div className="grid gap-4 grid-cols-4">
                <SpindleRpmPanel />
                <SpindlePowerPanel />
                <MotorPowerPanel />
                <VibrationPanel />
                <SpindleRpmChartPanel />
                <SpinlePowerChartPanel />
                <MotorPowerChartPanel />
                <VibrationChartPanel />

            </div>
        </div>
    );
}