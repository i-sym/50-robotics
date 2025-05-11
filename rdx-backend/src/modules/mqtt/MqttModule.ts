import EventEmitter from 'events'
import mqtt from 'mqtt'

const protocol = 'mqtt'
const host = '192.168.0.212'
const port = '32643'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

export class MqttModule {

    private updateEventEmitter = new EventEmitter()

    onUpdate(arg0: (topic: any, data: number) => void) {
        this.updateEventEmitter.on('update', (topic, data) => {
            arg0(topic, data)
        })
    }

    private readonly mqttClient: mqtt.MqttClient



    public async publish(topic: string, message: Record<string, any>) {
        this.mqttClient.publish(topic, JSON.stringify(message))
    }



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

        this.mqttClient.subscribe(['/test/1', '/s7/state/+'], (err) => {
            if (err) {
                console.error('Error subscribing to topic', err)
            }

        })

        this.mqttClient.on('message', (topic, message) => {
            console.log('Received message', message.toString())

            if (topic.startsWith('/s7/state/')) {
                this.updateEventEmitter.emit('update', topic, parseInt(message.toString()))
            }

        })
    }
    async init() {
        console.log('MqttModule init')

        let count = 0
        setInterval(() => {

            console.log('Publishing message')
            this.mqttClient.publish('/test/1', `Hello ${count++}`)

        }, 1000)
    }

}

