import { GoProLiveKitBlock } from "@/app/room/page";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function VideoStreamerPanel() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Live feed</CardTitle>
                <CardDescription>View the live feed from the Workcell camera.</CardDescription>
            </CardHeader>
            <CardContent>
                <div >
                    <GoProLiveKitBlock />
                </div>

            </CardContent>
        </Card>
    )
}
