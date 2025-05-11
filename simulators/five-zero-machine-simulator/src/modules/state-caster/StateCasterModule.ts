import { OpenAPIHono } from "@hono/zod-openapi";
import { UpgradeWebSocket } from "hono/ws";
import { getStateSpindleRpmRoute } from "./api/routes/getStateSpindleRpm";
import { set } from "zod";

export class StateCasterAPI {
    private upgradeWebSocket: UpgradeWebSocket;

    public readonly app: OpenAPIHono

    constructor({ deps }: { deps: { upgradeWebSocket: UpgradeWebSocket, module: StateCasterModule } }) {
        const upgradeWebSocket = deps.upgradeWebSocket;

        const app = new OpenAPIHono()

        app.openapi(getStateSpindleRpmRoute, (c) => {
            return c.json({ status: 'ok' })
        })

        app.get(
            '/state/spindle-rpm/ws',
            upgradeWebSocket((c) => {
                return {
                    onOpen: (_event, ws) => {
                        // ws.send('Hello from server!')
                        console.log('Connection opened')



                        setInterval(() => {

                            const object = {
                                value: Math.random() * 1000 + 2000,
                            }

                            ws.send(JSON.stringify(object))
                        }, 100)
                    },
                    onMessage(event, ws) {
                        console.log(`Message from client: ${event.data}`)
                        ws.send('Hello from server!')
                    },
                    onClose: () => {
                        console.log('Connection closed')
                    },
                }
            })
        )

        app.get('/state/spindle-rpm/series/ws', upgradeWebSocket((c) => {
            return {
                onOpen: (_event, ws) => {
                    // ws.send('Hello from server!')
                    console.log('Connection opened')

                    let series: { value: number }[] = []

                    function addDataPoint() {
                        const object = {
                            value: Math.random() * 1000 + 2000,
                        }

                        series.push(object)

                        if (series.length > 100) {
                            series.shift()
                        }
                    }


                    setInterval(() => {
                        addDataPoint()

                        ws.send(JSON.stringify(series))
                    }, 100)

                }
            }
        }
        ))

        this.app = app;
        this.upgradeWebSocket = upgradeWebSocket;

    }
}


export class StateCasterModule {
    private upgradeWebSocket: UpgradeWebSocket;
    public readonly api: StateCasterAPI;

    constructor({ deps }: { deps: { upgradeWebSocket: UpgradeWebSocket } }) {
        this.upgradeWebSocket = deps.upgradeWebSocket;

        this.api = new StateCasterAPI({
            deps: {
                upgradeWebSocket: this.upgradeWebSocket,
                module: this
            }
        })

    }


}