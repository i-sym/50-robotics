import { ControllPanel } from "@/modules/controll-panel/ControllPanel";
import LightControlPanel from "@/modules/light-controll-panel/LightControlPanel";
import Machine3DView from "@/modules/machine-3d-view/Machine3DView";
import { VideoStreamerPanel } from "@/modules/video-stream-panel/VideoStreamerPanel";

export default function Home() {
    return (
        <div className="bg-background flex items-start  justify-center  min-h-screen gap-4">
            <div className="grid gap-4 grid-cols-2">
                <VideoStreamerPanel />
                <ControllPanel />
                <Machine3DView />
                <LightControlPanel />
            </div>
        </div>
    );
}