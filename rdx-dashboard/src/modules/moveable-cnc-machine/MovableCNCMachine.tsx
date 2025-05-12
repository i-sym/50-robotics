import { Cnc } from "@/components/Cnc";

import useSWRSubscription from "swr/subscription";
import { z } from "zod";
export function MovableCNCMachine() {

    const { data: gaugeValue } = useSWRSubscription('ws://192.168.0.166:4000/machine/state/position/ws', (key, { next }) => {
        const socket = new WebSocket(key)
        socket.addEventListener('message', (event) => {
            const json = JSON.parse(event.data)

            const parsedData = z.object({
                x: z.number(),
                y: z.number(),
                z: z.number()
            }).safeParse(json)

            if (parsedData.success) {
                next(null, parsedData.data)
            }
        })
        socket.addEventListener('error', (event) => next(JSON.stringify(event)))
        return () => socket.close()
    })

    return (
        <group>
            {
                gaugeValue ? <Cnc x={gaugeValue.x} y={gaugeValue.y} z={gaugeValue.z} /> : <Cnc x={0} y={0} z={0} />

            }
        </group>
    )
}