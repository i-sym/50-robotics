"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const api_1 = __importDefault(require("./modules/api/api"));
const env_1 = __importDefault(require("./env"));
const SystemTwinService_1 = require("./modules/system-twin/SystemTwinService");
const port = env_1.default.PORT;
console.log(`Server is running on port ${port}`);
const systemTwinService = new SystemTwinService_1.SystemTwinService();
api_1.default.route('/api/v1/system-twin', systemTwinService.api.app);
(0, node_server_1.serve)({
    fetch: api_1.default.fetch,
    port
});
//# sourceMappingURL=index.js.map