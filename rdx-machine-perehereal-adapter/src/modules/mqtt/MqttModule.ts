import EventEmitter from 'events'
import mqtt from 'mqtt'
import { ShellyModule } from '../shelly/ShellyModule'
import { z } from 'zod'
import env from '../../env'
import { S7Module } from '../s7/S7Module'

// const protocol = 'mqtt'
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`


export class MqttModule {

    private host = env.MQTT_HOST
    private port = env.MQTT_PORT
    private protocol = env.MQTT_PROTOCOL
    private username = env.MQTT_USERNAME
    private password = env.MQTT_PASSWORD
    private clientId = `mqtt_${Math.random().toString(16).slice(3)}`


    private readonly mqttClient: mqtt.MqttClient

    private shellyModule: ShellyModule
    private s7Module: S7Module

    constructor({
        deps

    }: {
        deps: {
            shellyModule: ShellyModule,
            s7Module: S7Module
        }
    }) {

        this.shellyModule = deps.shellyModule
        this.s7Module = deps.s7Module

        const connectUrl = `${this.protocol}://${this.host}:${this.port}`

        this.mqttClient = mqtt.connect(connectUrl, {
            clientId: this.clientId,
            username: this.username,
            password: this.password,
            rejectUnauthorized: false
        })

        this.mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.mqttClient.subscribe(['/lights/+'], (err: unknown) => {
                if (err) {
                    console.error('Error subscribing to topic', err)
                }
            })
        });


        this.mqttClient.on('message', (topic: string, message: Buffer) => {
            if (topic === '/lights/target') {
                const target = JSON.parse(message.toString())
                const parsedTarget = z.object({
                    red: z.number(),
                    green: z.number(),
                    blue: z.number(),
                    turn: z.enum(['on', 'off'])
                }).safeParse(target)

                if (parsedTarget.success) {
                    const { red, green, blue, turn } = parsedTarget.data
                    if (turn === 'on') {
                        this.shellyModule.switchOn()
                    } else {
                        this.shellyModule.switchOff()
                    }
                    this.shellyModule.setColor({ red, green, blue })

                    this.mqttClient.publish('/lights/state', JSON.stringify({
                        red,
                        green,
                        blue,
                        turn
                    }))
                } else {
                    this.mqttClient.publish('/lights/error', JSON.stringify(parsedTarget.error))
                }

            }

        })
    }

    private pollingIntervalMs = 200

    async init() {
        console.log('MqttModule init')

        // Request data from s7, wait for response and publish it to mqtt and wait for pollingIntervalMs
        // Avoid race conditions

        let lastData: {
            spindlePower: number,
            spindleRpm: number,
            motorLoad: number,
            vibration: number,
        } | null = null

        const pollS7 = async () => {
            console.log('Polling S7')
            const data = await this.s7Module.readData()
            if (data != null) {
                this.mqttClient.publish('/s7/state/spindlePower', String(data.spindlePower))
                this.mqttClient.publish('/s7/state/spindleRpm', String(data.spindleRpm))
                this.mqttClient.publish('/s7/state/motorLoad', String(data.motorLoad))
                this.mqttClient.publish('/s7/state/vibration', String(data.vibration))
                this.mqttClient.publish('/s7/status', 'ok')
                lastData = data
            } else {
                console.error('Failed to read data from S7')
                this.mqttClient.publish('/s7/status', 'error')
            }
        }

        setInterval(pollS7, this.pollingIntervalMs)


    }
}