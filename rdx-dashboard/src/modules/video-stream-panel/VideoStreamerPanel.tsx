import { GoProLiveKitBlock } from "@/app/room/page";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react";


export function VideoStreamerPanel() {
    return (
        <Card >
            <CardHeader>
                <CardTitle className="relative">
                    Live feed
                    <Dialog >
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
                                <GoProLiveKitBlock />
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardTitle>
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
