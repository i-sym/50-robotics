// Module to control shelly RGBW Light

export class ShellyModule {

    private deviceIp: string

    constructor() {
        this.deviceIp = '10.10.10.100'
    }

    public async init() {
        console.log('ShellyModule init')

    }

    public async sendCommand({ params }: { params: Record<string, any> }) {
        const url = new URL(`http://${this.deviceIp}/light/0`);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));


        console.log('Sending command to Shelly', url.toString())

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to send command to Shelly')
        }
    }

    public async switchOn() {
        await this.sendCommand({ params: { turn: 'on' } })
    }

    public async switchOff() {
        await this.sendCommand({ params: { turn: 'off' } })
    }

    public async setColor({ red, green, blue }: { red: number, green: number, blue: number }) {
        await this.sendCommand({ params: { red, green, blue } })
    }

}