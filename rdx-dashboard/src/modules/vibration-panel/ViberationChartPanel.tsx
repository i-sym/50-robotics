"use client"

import { Activity, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import useSWRSubscription from "swr/subscription"
import { z } from "zod"
const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 0 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
        icon: Activity,
    },
} satisfies ChartConfig

export function VibrationChartPanel() {

    const { data: gaugeSeriesValue } = useSWRSubscription('ws://192.168.0.166:4000/machine/state/vibration/series/ws', (key, { next }) => {
        const socket = new WebSocket(key)
        socket.addEventListener('message', (event) => {
            const json = JSON.parse(event.data)

            const parsedData = z.array(z.object({
                value: z.number()
            })).safeParse(json)

            if (parsedData.success) {
                next(null, parsedData.data.map((d, i) => ({ month: i, desktop: d.value })))
            }
        })
        socket.addEventListener('error', (event) => next(JSON.stringify(event)))
        return () => socket.close()
    })



    // Chart texts and data
    const chartTitle = "Machine Vibration Monitoring";
    const chartDescription = "Real-time vibration intensity readings";
    const trendText = "Current vibration within normal range";
    const dateRangeText = "Showing latest measurements";

    // Update references to these variables in the JSX below


    return (
        <Card>
            <CardHeader>
                <CardTitle>{chartTitle}</CardTitle>
                <CardDescription>
                    {chartDescription}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={gaugeSeriesValue}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Area
                            dataKey="desktop"
                            type="step"
                            fill="var(--color-desktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {trendText}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            {dateRangeText}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
