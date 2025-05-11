import { OpenAPIHono } from "@hono/zod-openapi";
import { UpgradeWebSocket } from "hono/ws";
import { getStateSpindleRpmRoute } from "./api/routes/getStateSpindleRpm";
import { set } from "zod";
import { postLightSwitchOff } from "./api/routes/postLigthsSwitchOffRequest";
import { postLightSwitchOn } from "./api/routes/postLigthsSwitchOnRequest";
import { postLightsSetColorRequest } from "./api/routes/postLigthsSetColorRequest";
import { MqttModule } from "../mqtt/MqttModule";
import EventEmitter from "events";

export class StateCasterAPI {
    private upgradeWebSocket: UpgradeWebSocket;

    public readonly app: OpenAPIHono

    constructor({ deps }: { deps: { upgradeWebSocket: UpgradeWebSocket, module: StateCasterModule } }) {
        const upgradeWebSocket = deps.upgradeWebSocket;

        const module = deps.module;
        const app = new OpenAPIHono()

        app.openapi(getStateSpindleRpmRoute, (c) => {
            return c.json({ status: 'ok' })
        })

        const availableDataSources = ['spindle-power', 'spindle-rpm', 'motor-load', 'vibration'] as const

        availableDataSources.forEach((dataSource) => {

            app.get(
                `/state/${dataSource}/ws`,
                upgradeWebSocket((c) => {
                    console.log('Upgrading websocket')
                    return {
                        onOpen: (_event, ws) => {
                            // ws.send('Hello from server!')
                            console.log('Connection opened')



                            module.onDataSourceUpdate(dataSource, (data) => {
                                console.log('Data', data)
                                ws.send(JSON.stringify(data))
                            })
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

            app.get(`/state/${dataSource}/series/ws`, upgradeWebSocket((c) => {
                return {
                    onOpen: (_event, ws) => {
                        // ws.send('Hello from server!')
                        console.log('Connection opened')

                        module.onDataSourceSeriesUpdate(dataSource, (data) => {
                            console.log('Data', data)
                            ws.send(JSON.stringify(data))
                        })

                    }
                }
            }
            ))

            app.get(`/state/${dataSource}/last-value`, (c) => {
                return c.json({ value: module.lastValues[dataSource] })
            })
        })

        app.get('/state/position/ws', upgradeWebSocket((c) => {
            return {

                onOpen: (_event, ws) => {
                    // ws.send('Hello from server!')
                    console.log('Connection opened')

                    let position = {
                        x: 300,
                        y: 300,
                        z: 0
                    }

                    function updatePosition() {
                        position.x += Math.random() * 50 - 25
                        position.y += Math.random() * 50 - 25
                        position.z += Math.random() * 10 - 5
                    }

                    setInterval(() => {
                        updatePosition()
                        console.log('Sending position', position)
                        ws.send(JSON.stringify(position))
                    }, 100)
                }
            }
        }
        ))

        app.openapi(postLightSwitchOff, async (c) => {
            console.log('Light switch off request')


            await module.lightsController.switchOff()

            return c.json({ status: 'ok' })
        })

        app.openapi(postLightSwitchOn, async (c) => {
            console.log('Light switch on request')

            await module.lightsController.switchOn()

            return c.json({ status: 'ok' })


        })



        app.openapi(postLightsSetColorRequest, async (c) => {
            console.log('Light set color request')
            const color = c.req.valid('json')

            console.log('Color', color)



            await module.lightsController.setColor({
                red: color.red,
                green: color.green,
                blue: color.blue
            })


            return c.json({ status: 'ok' })

        })


        this.app = app;
        this.upgradeWebSocket = upgradeWebSocket;

    }
}

type SupportedDataSources = 'spindle-power' | 'spindle-rpm' | 'motor-load' | 'vibration'



export class StateCasterModule {


    public lastValues: Record<SupportedDataSources, number> = {
        'spindle-power': 0,
        'spindle-rpm': 0,
        'motor-load': 0,
        'vibration': 0
    }

    private lastSeries: Record<SupportedDataSources, number[]> = {
        'spindle-power': [],
        'spindle-rpm': [],
        'motor-load': [],
        'vibration': []
    }

    private updateEventEmitter = new EventEmitter()


    onDataSourceSeriesUpdate(dataSource: SupportedDataSources, arg1: (data: {
        value: number;
    }[]) => void) {

        this.updateEventEmitter.on(`update/${dataSource}/series`, arg1)
        arg1(this.lastSeries[dataSource].map((value, index) => {
            return {
                value,
            }
        }))

    }

    onDataSourceUpdate(dataSource: SupportedDataSources, arg1: (data: {
        value: number;
    }) => void) {

        this.updateEventEmitter.on(`update/${dataSource}`, (data) => {
            console.log('Received updateeeee', data)

            arg1({
                value: this.lastValues[dataSource]
            })
        })
    }


    private upgradeWebSocket: UpgradeWebSocket;
    public readonly api: StateCasterAPI;

    private mqttModule: MqttModule;

    private targetLightState: {
        turn: 'on' | 'off',
        red: number,
        green: number,
        blue: number

    } = {
            turn: 'off',
            red: 255,
            green: 255,
            blue: 255
        }

    lightsController: {
        switchOn: () => Promise<void>;
        switchOff: () => Promise<void>;
        setColor: (arg0: { red: number; green: number; blue: number; }) => Promise<void>;
    } = {
            switchOn: async () => {
                // Last target

                this.targetLightState.turn = 'on'
                this.mqttModule.publish('/lights/target', this.targetLightState)
            },

            switchOff: async () => {
                // Last target
                this.targetLightState.turn = 'off'
                this.mqttModule.publish('/lights/target', this.targetLightState)
            },
            setColor: async ({ red, green, blue }) => {
                this.targetLightState.red = red
                this.targetLightState.green = green
                this.targetLightState.blue = blue
                this.mqttModule.publish('/lights/target', this.targetLightState)
            }
        }

    private addReading(dataSource: SupportedDataSources, value: number) {

        console.log('Adding reading', dataSource, value)
        this.lastValues[dataSource] = value

        // Update the series
        this.lastSeries[dataSource].push(value)

        if (this.lastSeries[dataSource].length > 100) {
            this.lastSeries[dataSource].shift()
        }

        this.updateEventEmitter.emit(`update/${dataSource}`, {
            value
        })

        this.updateEventEmitter.emit(`update/${dataSource}/series`, this.lastSeries[dataSource].map((value, index) => {
            return {
                value
            }
        }))

    }


    constructor({ deps }: { deps: { upgradeWebSocket: UpgradeWebSocket, mqttModule: MqttModule } }) {
        this.upgradeWebSocket = deps.upgradeWebSocket;

        this.api = new StateCasterAPI({
            deps: {
                upgradeWebSocket: this.upgradeWebSocket,
                module: this
            }
        })

        this.mqttModule = deps.mqttModule


        this.mqttModule.onUpdate((topic, data) => {

            console.log('Received update', topic, data)

            if (topic === '/s7/state/spindleRpm') {
                this.addReading('spindle-rpm', data)
            } else if (topic === '/s7/state/spindlePower') {
                this.addReading('spindle-power', data)
            } else if (topic === '/s7/state/motorLoad') {
                this.addReading('motor-load', data)
            } else if (topic === '/s7/state/vibration') {
                this.addReading('vibration', data)
            }
        })
    }
}