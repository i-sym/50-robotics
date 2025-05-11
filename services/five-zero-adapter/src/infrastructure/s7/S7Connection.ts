import nodes7 from 'nodes7';
import { S7Machine } from '../../domain/s7/S7Machine';
import { ConnectionError, ConfigurationError, ProtocolError } from '../../common/errors';

export class S7Connection {
    private conn: any; // nodes7 connection
    private connected: boolean = false;
    private variables: { [key: string]: string } = {};
    private machine: S7Machine;

    constructor(machine: S7Machine) {
        this.machine = machine;
        this.conn = new nodes7();
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const { ip, rack, slot, localTSAP, remoteTSAP, timeout } = this.machine.getConnection();

            this.conn.initiateConnection(
                {
                    port: 102,
                    host: ip,
                    rack: rack,
                    slot: slot,
                    localTSAP: localTSAP || 0x0200,
                    remoteTSAP: remoteTSAP || 0x0300,
                    timeout: timeout || 5000
                },
                (err: any) => {
                    if (err) {
                        this.connected = false;
                        reject(new ConnectionError(`Failed to connect to S7 PLC at ${ip}: ${err.message || err}`));
                    } else {
                        this.connected = true;
                        resolve();
                    }
                }
            );
        });
    }

    addVariable(alias: string, address: string): void {
        this.variables[alias] = address;
    }

    setupVariables(): void {
        if (Object.keys(this.variables).length > 0) {
            this.conn.setTranslationCB((tag: string) => this.variables[tag]);
            this.conn.addItems(Object.keys(this.variables));
        }
    }

    async readVariables(): Promise<{ [key: string]: any }> {
        if (!this.connected) {
            throw new ConnectionError('Not connected to PLC');
        }

        return new Promise((resolve, reject) => {
            this.conn.readAllItems((err: any, values: any) => {
                if (err) {
                    reject(new ProtocolError(`Failed to read variables: ${err.message || err}`));
                } else {
                    resolve(values);
                }
            });
        });
    }

    async writeVariable(alias: string, value: any): Promise<void> {
        if (!this.connected) {
            throw new ConnectionError('Not connected to PLC');
        }

        if (!this.variables[alias]) {
            throw new ConfigurationError(`Variable ${alias} not defined`);
        }

        return new Promise((resolve, reject) => {
            this.conn.writeItems(alias, value, (err: any) => {
                if (err) {
                    reject(new ProtocolError(`Failed to write variable ${alias}: ${err.message || err}`));
                } else {
                    resolve();
                }
            });
        });
    }

    disconnect(): void {
        if (this.conn) {
            try {
                this.conn.dropConnection();
            } catch (error) {
                console.error(`Error disconnecting from PLC: ${error}`);
            }
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }
}