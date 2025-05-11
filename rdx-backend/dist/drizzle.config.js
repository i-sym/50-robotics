"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("@/env"));
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: "postgresql",
    schema: "./src/modules/db/schemas.ts",
    dbCredentials: {
        url: env_1.default.DRIZZLE_DATABASE_URL
    }
});
//# sourceMappingURL=drizzle.config.js.map