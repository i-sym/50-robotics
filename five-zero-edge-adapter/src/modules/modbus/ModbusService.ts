
import ping from 'ping';
import env from '../../env';
import { z } from "zod";
import { Modbus } from '../../shared/schemas'
import { apiResponseSchema } from '../../lib/response';

export class ModbusService {


    private async requestModbusApi<T>(endpoint: string, method: string, body: any, responseSchema: z.ZodType<T>): Promise<T> {
        const res = await fetch(`https://modbus.api.solarrouter.rivdevs.com/api/modbus/${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'api-key': env.ALLOWED_API_KEY
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.log("Error2", res);
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();

        const parsedResponse = apiResponseSchema.parse(json);

        if (!parsedResponse.success) {
            throw new Error(`API error: ${parsedResponse.data}`);
        }

        const parsedData = responseSchema.parse(parsedResponse.data);

        return parsedData;
    }


    public async writeRegister(toRead: Modbus.WriteRegisterRequestData): Promise<Modbus.WriteRegisterResponseData> {
        try {
            const res = await this.requestModbusApi('write-register', 'POST', toRead, Modbus.writeRegisterResponseSchema);
            return res;
        } catch (error) {
            throw new Error(`Error writing register: ${error}`);
        }
    }
    public async readRegister(toRead: Modbus.ReadRegisterRequestData): Promise<Modbus.ReadRegisterResponseData | null> {
        try {

            const res = await this.requestModbusApi('read-register', 'POST', toRead, Modbus.readRegisterResponseSchema);
            return res;

        } catch (error) {
            console.log("Throwinf Error", error);
            return null;
            // throw new Error(`Error reading register: ${error}`);
        }
    }
    public async ping(config: Modbus.PingRequestData): Promise<Modbus.PingResponseData> {
        try {

            const res = await this.requestModbusApi('ping', 'POST', config, Modbus.pingResponseSchema);
            return res;

        } catch (error) {
            return ({
                alive: false,
                time: "0"
            })

        }
    }
    public async healthCheck() {
        try {
            const res = await this.requestModbusApi('health', 'GET', {}, z.object({
                service: z.string()
            }));
            return res;
        } catch (error) {
            throw new Error(`Error health checking: ${error}`);
        }
    }
}


