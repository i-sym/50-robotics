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
exports.GenericRegistry = void 0;
class GenericRegistry {
    constructor() {
        this.registry = new Map();
        this.slugRegistry = new Map();
    }
    register(item) {
        this.registry.set(item.id, item);
        this.slugRegistry.set(item.slug, item);
    }
    get(id) {
        return this.registry.get(id);
    }
    getBySlug(slug) {
        return this.slugRegistry.get(slug);
    }
    asList() {
        return Array.from(this.registry.values());
    }
    listDescriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(this.asList().map((item) => item.getDescription()));
        });
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                kind: "GenericRegistry",
                description: {
                    items: yield Promise.all(this.asList().map((item) => item.getDescription()))
                }
            };
        });
    }
}
exports.GenericRegistry = GenericRegistry;
//# sourceMappingURL=generic-registry.js.map