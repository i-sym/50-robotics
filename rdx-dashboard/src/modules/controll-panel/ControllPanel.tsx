import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home } from "lucide-react";

export function ControllPanel() {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-6">
                    {/* Title */}
                    <CardHeader>
                        <CardTitle>Control Panel</CardTitle>
                        <CardDescription>Control the CNC Machine.</CardDescription>
                    </CardHeader>

                    {/* XY Controls in Cross Pattern */}

                    <div className="flex flex-row justify-around items-center">

                        <div className="flex flex-col items-center gap-2">
                            {/* Y Up */}
                            <Button size="icon" variant="default" className="rounded-full">
                                <ChevronUp className="h-5 w-5" />
                            </Button>

                            {/* X Left, Center, Right */}
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="default" className="rounded-full">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="w-10 h-10"></div>
                                <Button size="icon" variant="default" className="rounded-full">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Y Down */}
                            <Button size="icon" variant="default" className="rounded-full">
                                <ChevronDown className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Z Controls */}
                        <div className="flex justify-center gap-8 mt-4 h-full">
                            <Card className="p-4">
                                <CardContent className="flex flex-col items-center gap-3 pt-0">
                                    <Button size="icon" variant="default" className="rounded-full">
                                        <ChevronUp className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="default" className="rounded-full">
                                        <ChevronDown className="h-5 w-5" />
                                    </Button>

                                    <h3 className="font-semibold">Z Axis</h3>
                                </CardContent>
                            </Card>
                        </div>

                    </div>

                    {/* Home Controls */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <Button variant="secondary">
                            <Home className="mr-2 h-4 w-4" />
                            Home X
                        </Button>
                        <Button variant="secondary">
                            <Home className="mr-2 h-4 w-4" />
                            Home Y
                        </Button>
                        <Button variant="secondary">
                            <Home className="mr-2 h-4 w-4" />
                            Home Z
                        </Button>
                        <Button variant="default">
                            <Home className="mr-2 h-4 w-4" />
                            Home All
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}