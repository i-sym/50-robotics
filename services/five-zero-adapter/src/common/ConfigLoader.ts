// src/common/ConfigLoader.ts
import * as fs from 'fs';
import * as path from 'path';

export class ConfigLoader {
    private config: any;

    constructor(configPath?: string) {
        this.config = this.loadConfig(configPath);
    }

    private loadConfig(configPath?: string): any {
        // Default configuration
        const defaultConfig = {
            adapter: {
                name: 'generic-adapter',
                type: 'generic',
                pollIntervalMs: 1000
            },
            mqtt: {
                url: 'mqtt://localhost:1883',
                clientId: 'generic-adapter',
                username: 'adapter',
                password: 'adapter'
            },
            machines: []
        };

        try {
            const filePath = configPath || path.join(process.cwd(), 'config/default.json');
            if (fs.existsSync(filePath)) {
                const configData = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(configData);
            } else {
                console.warn(`Configuration file not found at ${filePath}, using defaults`);
                return defaultConfig;
            }
        } catch (error) {
            console.warn('Could not load configuration file, using defaults:', error);
            return defaultConfig;
        }
    }

    getAdapterName(): string {
        return this.config.adapter?.name || 'generic-adapter';
    }

    getAdapterType(): string {
        return this.config.adapter?.type || 'generic';
    }

    getPollIntervalMs(): number {
        return this.config.adapter?.pollIntervalMs || 1000;
    }

    getMqttConfig(): any {
        return this.config.mqtt || {};
    }

    getMachines(): any[] {
        return this.config.machines || [];
    }

    getRawConfig(): any {
        return this.config;
    }
}
