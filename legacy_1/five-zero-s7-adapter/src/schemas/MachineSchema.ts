import { z } from 'zod';

export const S7ConnectionSchema = z.object({
    ip: z.string().describe("IP address of the S7 PLC"),
    rack: z.number().int().describe("The rack number of the PLC"),
    slot: z.number().int().describe("The slot number of the PLC"),
    localTSAP: z.number().optional().describe("Local TSAP number"),
    remoteTSAP: z.number().optional().describe("Remote TSAP number"),
    timeout: z.number().optional().describe("Connection timeout in milliseconds")
});

export const MachineSchema = z.object({
    id: z.string().uuid().describe("Unique identifier for the machine"),
    name: z.string().min(1).describe("Name of the machine"),
    connection: S7ConnectionSchema,
    dataSources: z.array(z.string()).optional().describe("Array of data source IDs"),
    controlPoints: z.array(z.string()).optional().describe("Array of control point IDs")
});

export const MachineListSchema = z.array(MachineSchema);

export type S7Connection = z.infer<typeof S7ConnectionSchema>;
export type MachineData = z.infer<typeof MachineSchema>;