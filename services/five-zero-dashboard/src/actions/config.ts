'use server'


export async function getMqttConfig() {

    /*

    MQTT_BROKER_URL=ws://localhost:8083/mqtt
    MQTT_CLIENT_ID=dashboard-client
    MQTT_USERNAME=dev
    MQTT_PASSWORD=dev

    */
    const mqttConfig = {
        MQTT_BROKER_URL: process.env.MQTT_BROKER_URL!,
        MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID!,
        MQTT_USERNAME: process.env.MQTT_USERNAME!,
        MQTT_PASSWORD: process.env.MQTT_PASSWORD!,
        MQTT_TOPIC: process.env.MQTT_TOPIC!,
    };
    return mqttConfig;
}

export async function getLiveKitConfig() {
    const liveKitConfig = {
        LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL!,
        LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY!,
    };
    return liveKitConfig;
}