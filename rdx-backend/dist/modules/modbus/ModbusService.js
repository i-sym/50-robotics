"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModbusService = void 0;
const env_1 = __importDefault(require("../../env"));
const zod_1 = require("zod");
const schemas_1 = require("../../shared/schemas");
const response_1 = require("../../lib/response");
class ModbusService {
    requestModbusApi(endpoint, method, body, responseSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`https://modbus.api.solarrouter.rivdevs.com/api/modbus/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': env_1.default.ALLOWED_API_KEY
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                console.log("Error2", res);
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const json = yield res.json();
            const parsedResponse = response_1.apiResponseSchema.parse(json);
            if (!parsedResponse.success) {
                throw new Error(`API error: ${parsedResponse.data}`);
            }
            const parsedData = responseSchema.parse(parsedResponse.data);
            return parsedData;
        });
    }
    writeRegister(toRead) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.requestModbusApi('write-register', 'POST', toRead, schemas_1.Modbus.writeRegisterResponseSchema);
                return res;
            }
            catch (error) {
                throw new Error(`Error writing register: ${error}`);
            }
        });
    }
    readRegister(toRead) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.requestModbusApi('read-register', 'POST', toRead, schemas_1.Modbus.readRegisterResponseSchema);
                return res;
            }
            catch (error) {
                console.log("Throwinf Error", error);
                return null;
                // throw new Error(`Error reading register: ${error}`);
            }
        });
    }
    ping(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.requestModbusApi('ping', 'POST', config, schemas_1.Modbus.pingResponseSchema);
                return res;
            }
            catch (error) {
                return ({
                    alive: false,
                    time: "0"
                });
            }
        });
    }
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.requestModbusApi('health', 'GET', {}, zod_1.z.object({
                    service: zod_1.z.string()
                }));
                return res;
            }
            catch (error) {
                throw new Error(`Error health checking: ${error}`);
            }
        });
    }
}
exports.ModbusService = ModbusService;
//# sourceMappingURL=ModbusService.js.map