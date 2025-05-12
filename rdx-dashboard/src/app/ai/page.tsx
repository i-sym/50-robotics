import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="bg-background flex items-start  justify-center  min-h-screen gap-4">
            <div className="grid gap-4 grid-cols-4 mt-8">
                <div className="col-span-4 md:col-span-2 lg:col-span-1">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                            <p className="text-muted-foreground text-center">
                                This page is currently under development and will be implemented soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}