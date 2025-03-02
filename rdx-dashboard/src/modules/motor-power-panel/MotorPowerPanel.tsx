"use client"

import { TrendingUp } from "lucide-react"
import {
    Label,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import {
    Card,
    CardContent, CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

import { z } from "zod"
import useSWRSubscription from "swr/subscription";

export function MotorPowerPanel() {

    //use the useSWRSubscription hook to subscribe to the gauge value
    const { data: gaugeValue } = useSWRSubscription('ws://192.168.0.166:4000/machine/state/motor-load/ws', (key, { next }) => {
        const socket = new WebSocket(key)
        socket.addEventListener('message', (event) => {
            const json = JSON.parse(event.data)

            const parsedData = z.object({
                value: z.number()
            }).safeParse(json)

            if (parsedData.success) {
                next(null, parsedData.data.value)
            }
        })
        socket.addEventListener('error', (event) => next(JSON.stringify(event)))
        return () => socket.close()
    })

    const CHART_TITLE = "Radial Chart - Shape";
    const CHART_DESCRIPTION = "January - June 2024";
    const TRENDING_TEXT = "Trending up by 5.2% this month";
    const FOOTER_TEXT = "Showing total visitors for the last 6 months";
    const VISITORS_LABEL = "Revs/min";

    const MAX_VALUE = 4000;

    return (

        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{CHART_TITLE}</CardTitle>
                <CardDescription>{CHART_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={[
                            { browser: "safari", visitors: 10, fill: "var(--primary)" },
                        ]}
                        startAngle={0}
                        endAngle={gaugeValue / MAX_VALUE * 180}
                        innerRadius={80}
                        outerRadius={110}


                    >
                        <PolarGrid

                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                            min={0}
                            max={100}
                        />
                        <RadialBar dataKey="visitors" background cornerRadius={10} type="number" />
                        {/* <PolarAngleAxis tick={false} axisLine={true} domain={[0, 100]} x1={0} x2={0} y1={0} y2={0} /> */}
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}  >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    {/* {chartData[0].visitors.toLocaleString()} */}
                                                    {gaugeValue?.toFixed(2)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {VISITORS_LABEL}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                {gaugeValue !== undefined ? (
                    <div className="flex items-center gap-2 font-medium leading-none">
                        {TRENDING_TEXT}
                        <TrendingUp className="h-4 w-4" />
                        <TrendingUp className="h-4 w-4" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 font-medium leading-none text-primary">
                        Unable to connect to machine
                    </div>
                )}
                <div className="leading-none text-muted-foreground">
                    {FOOTER_TEXT}
                </div>
            </CardFooter>
        </Card>
    )
}




