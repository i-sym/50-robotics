import EventEmitter from 'events'
import mqtt from 'mqtt'

const protocol = 'mqtt'
const host = '192.168.0.212'
const port = '32643'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

export class MqttModule {

    private readonly mqttClient: mqtt.MqttClient

    private simulatedMachineState: {
        position: {
            x: number,
            y: number,
            z: number
        }
    } = {
            position: {
                x: 500,
                y: 500,
                z: 500
            }
        }

    private simulatedMachineLimits: {
        x: {
            min: number,
            max: number
        },
        y: {
            min: number,
            max: number
        },
        z: {
            min: number,
            max: number
        }
    } = {
            x: {
                min: 0,
                max: 1000
            },
            y: {
                min: 0,
                max: 1000
            },
            z: {
                min: 0,
                max: 1000
            }
        }

    private machineEventEmitter = new EventEmitter()

    constructor() {
        this.mqttClient = mqtt.connect(connectUrl, {
            clientId,
            username: 'admin',
            password: 'admin',
            rejectUnauthorized: false
        })

        this.mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        this.mqttClient.subscribe('/test/1', (err) => {
            if (err) {
                console.error('Error subscribing to topic', err)
            }
        })

        this.mqttClient.on('message', (topic, message) => {
            console.log('Received message', message.toString())

        })
    }
    async init() {
        console.log('MqttModule init')

        let count = 0
        setInterval(() => {

            // Update the simulated machine state
            this.simulatedMachineState.position.x += Math.random() * 10 - 5
            this.simulatedMachineState.position.y += Math.random() * 10 - 5
            this.simulatedMachineState.position.z += Math.random() * 10 - 5

            // Check if the machine has reached its limits
            if (this.simulatedMachineState.position.x < this.simulatedMachineLimits.x.min) {
                this.simulatedMachineState.position.x = this.simulatedMachineLimits.x.min
            }
            if (this.simulatedMachineState.position.x > this.simulatedMachineLimits.x.max) {
                this.simulatedMachineState.position.x = this.simulatedMachineLimits.x.max
            }

            if (this.simulatedMachineState.position.y < this.simulatedMachineLimits.y.min) {
                this.simulatedMachineState.position.y = this.simulatedMachineLimits.y.min
            }

            if (this.simulatedMachineState.position.y > this.simulatedMachineLimits.y.max) {
                this.simulatedMachineState.position.y = this.simulatedMachineLimits.y.max
            }

            if (this.simulatedMachineState.position.z < this.simulatedMachineLimits.z.min) {
                this.simulatedMachineState.position.z = this.simulatedMachineLimits.z.min
            }

            if (this.simulatedMachineState.position.z > this.simulatedMachineLimits.z.max) {
                this.simulatedMachineState.position.z = this.simulatedMachineLimits.z.max
            }

            // Emit the new machine state
            this.machineEventEmitter.emit('machine-state', this.simulatedMachineState)

            console.log('Publishing message')
            this.mqttClient.publish('/simulated-machine/position', JSON.stringify(this.simulatedMachineState))
        }, 100)
    }
}