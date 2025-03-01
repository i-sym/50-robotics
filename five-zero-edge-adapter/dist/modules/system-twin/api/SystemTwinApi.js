"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTwinApi = void 0;
const hono_1 = require("hono");
class SystemTwinApi {
    constructor({ systemTwinController }) {
        this.ctrl = systemTwinController;
        this.app = new hono_1.Hono();
        this.app.get('/', (c) => {
            return c.json({ message: 'Hello World' });
        });
        this.app.get('/twin-scopes', this.ctrl.listTwinScopes);
        this.app.get('/twin-scopes/:twinScopeId', this.ctrl.getTwinScope);
        this.app.get('/twin-components', this.ctrl.listTwinComponents);
        this.app.get('/twin-components/:twinComponentId', this.ctrl.getTwinComponent);
    }
}
exports.SystemTwinApi = SystemTwinApi;
//# sourceMappingURL=SystemTwinApi.js.map