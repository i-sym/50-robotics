import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import nodes7 from 'nodes7'; // This is the package name, if the repository is cloned you may need to require 'nodeS7' with uppercase S
import { number } from 'zod';

export class S7Module {
    private conn: nodes7;
    private doneReading: boolean;
    private doneWriting: boolean;
    private variables: { [key: string]: string };

    constructor() {
        this.conn = new nodes7();
        this.doneReading = false;
        this.doneWriting = false;
        this.variables = {
            // TEST1: 'MR4',          // Memory real at MD4
            // TEST2: 'M32.2',        // Bit at M32.2
            // TEST3: 'M20.0',        // Bit at M20.0
            // TEST4: 'DB1,REAL0.20', // Array of 20 values in DB1
            // TEST5: 'DB1,REAL4',    // Single real value
            // TEST6: 'DB1,REAL8',    // Another single real value
            // TEST7: 'DB1,INT12.2',  // Two integer value array
            // TEST8: 'DB1,LREAL4',   // Single 8-byte real value
            // TEST9: 'DB1,X14.0',    // Single bit in a data block
            // TEST10: 'DB1,X14.0.8'  // Array of 8 bits in a data block
            SPINDLE_POWER: "DB1,WORD1136",
            SPINDLE_RPM: "DB1,WORD1140",
            MOTOR_LOAD: "DB1,WORD1138",
            VIBRATION: "DB1,WORD1142",
        };
    }

    public async init() {
        this.conn.initiateConnection({ port: 102, host: '0.0.0.0', localTSAP: 0x0200, remoteTSAP: 0x0300, timeout: 10000 }, this.connected.bind(this));
    }

    private connected(err: any) {
        if (typeof (err) !== "undefined") {
            // We have an error. Maybe the PLC is not reachable.
            console.log(err);
            process.exit()
        }
        this.conn.setTranslationCB((tag: string) => { return this.variables[tag]; }); // This sets the "translation" to allow us to work with object names
        // this.conn.addItems(['TEST1', 'TEST4']);
        // this.conn.addItems('TEST6');
        // // this.conn.removeItems(['TEST2', 'TEST3']); // We could do this.
        // // this.conn.writeItems(['TEST5', 'TEST6'], [ 867.5309, 9 ], this.valuesWritten.bind(this)); // You can write an array of items as well.
        // // this.conn.writeItems('TEST7', [666, 777], this.valuesWritten.bind(this)); // You can write a single array item too.
        // this.conn.writeItems('TEST3', true, this.valuesWritten.bind(this)); // This writes a single boolean item (one bit) to true
        // this.conn.readAllItems(this.valuesReady.bind(this));


        this.conn.addItems(Object.keys(this.variables));


    }

    public async readData(): Promise<{
        spindlePower: number,
        spindleRpm: number,
        motorLoad: number,
        vibration: number,
    } | null> {
        const readResult = new Promise((resolve, reject) => {
            this.conn.readAllItems((err: any, values: any) => {
                if (err) {
                    reject(err);
                }
                resolve(values);
            });
        });

        const result = await readResult as { [key: string]: number };

        if (!result) {

            return null;
        }

        const spindlePower = result.SPINDLE_POWER;
        const spindleRpm = result.SPINDLE_RPM;
        const motorLoad = result.MOTOR_LOAD;
        const vibration = result.VIBRATION;

        return {
            spindlePower,
            spindleRpm,
            motorLoad,
            vibration,
        };

    }

    private hexToFloat(hex: string) {
        var s = parseInt(hex, 16);
        var sign = (s & 0x80000000) ? -1 : 1;
        var e = (s >> 23) & 0xff;
        var m = (e === 0) ?
            (s & 0x7fffff) << 1 :
            (s & 0x7fffff) | 0x800000;
        var f = sign * m * Math.pow(2, e - 150);
        return
    }

    private valuesReady(anythingBad: any, values: any) {
        if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
        console.log(values);
        this.doneReading = true;
        if (this.doneWriting) { process.exit(); }
    }

    private valuesWritten(anythingBad: any) {
        if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
        console.log("Done writing.");
        this.doneWriting = true;
        if (this.doneReading) { process.exit(); }
    }
}