"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTwinService = void 0;
const TwinScopeRegistry_1 = require("src/entities/twin-scope/objects/TwinScopeRegistry");
const SystemTwinApi_1 = require("./api/SystemTwinApi");
const SystemTwinController_1 = require("./api/SystemTwinController");
const TwinComponentRegisty_1 = require("src/entities/twin-component/objects/TwinComponentRegisty");
class SystemTwinService {
    constructor() {
        this.apiController = new SystemTwinController_1.SystemTwinController({
            systemTwinService: this
        });
        this.api = new SystemTwinApi_1.SystemTwinApi({
            systemTwinController: this.apiController
        });
        this.twinScopeRegistry = new TwinScopeRegistry_1.TwinScopeRegistry();
        this.twinComponentRegistry = new TwinComponentRegisty_1.TwinComponentRegistry();
    }
    listTwinComponents() {
        throw new Error("Method not implemented.");
    }
    getTwinComponent({ twinComponentId }) {
        throw new Error("Method not implemented.");
    }
    getTwinScope({ twinScopeId }) {
        throw new Error("Method not implemented.");
    }
    listTwinScopes() {
        throw new Error("Method not implemented.");
    }
}
exports.SystemTwinService = SystemTwinService;
//# sourceMappingURL=SystemTwinService.js.map