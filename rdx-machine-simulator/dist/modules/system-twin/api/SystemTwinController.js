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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTwinController = void 0;
const zod_1 = require("zod");
class SystemTwinController {
    constructor({ systemTwinService }) {
        this.listTwinScopes = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const twinScopes = yield this.systemTwinService.twinScopeRegistry.listDescriptions();
                return c.json({
                    description: twinScopes
                });
            }
            catch (error) {
                console.log("Error in listTwinScopes", error);
                return c.json({
                    success: false,
                    message: JSON.stringify(error)
                });
            }
        });
        this.getTwinScope = (c) => __awaiter(this, void 0, void 0, function* () {
            const twinScopeId = c.req.param('twinScopeId');
            const parsedTwinScopeId = zod_1.z.coerce.number().parse(twinScopeId);
            const twinScope = yield this.systemTwinService.twinScopeRegistry.get(parsedTwinScopeId);
            if (!twinScope) {
                return c.json({
                    success: false,
                    message: 'TwinScope not found'
                });
            }
            const description = yield twinScope.getDescription();
            return c.json({
                description
            });
        });
        this.getTwinComponent = (c) => __awaiter(this, void 0, void 0, function* () {
            const twinComponentId = c.req.param('twinComponentId');
            const parsedTwinComponentId = zod_1.z.coerce.number().parse(twinComponentId);
            const twinComponent = yield this.systemTwinService.getTwinComponent({
                twinComponentId: parsedTwinComponentId
            });
            return c.json({
                twinComponent
            });
        });
        this.listTwinComponents = (c) => __awaiter(this, void 0, void 0, function* () {
            const twinComponents = yield this.systemTwinService.listTwinComponents();
            return c.json({
                twinComponents
            });
        });
        this.systemTwinService = systemTwinService;
    }
}
exports.SystemTwinController = SystemTwinController;
//# sourceMappingURL=SystemTwinController.js.map