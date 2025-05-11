import { z } from 'zod';

export const MachineBaseSchema = z.object({
    id: z.string().describe('Unique identifier for the machine'),
    name: z.string().min(1).describe('Name of the machine'),
    dataSources: z.array(z.string()).optional().describe('Array of data source IDs'),
    controlPoints: z.array(z.string()).optional().describe('Array of control point IDs')
});

// S7 specific schemas
export const S7ConnectionSchema = z.object({
    ip: z.string().describe('IP address of the S7 PLC'),
    rack: z.number().int().describe('Rack number of the PLC'),
    slot: z.number().int().describe('Slot number of the PLC'),
    localTSAP: z.number().optional().describe('Local TSAP number'),
    remoteTSAP: z.number().optional().describe('Remote TSAP number'),
    timeout: z.number().optional().describe('Connection timeout in milliseconds')
});

export const S7MachineSchema = MachineBaseSchema.extend({
    connection: S7ConnectionSchema
});

// Shelly specific schemas
export const ShellyConnectionSchema = z.object({
    ip: z.string().describe('IP address of the Shelly device'),
    type: z.string().describe('Shelly device type')
});

export const ShellyMachineSchema = MachineBaseSchema.extend({
    connection: ShellyConnectionSchema
});

// UCCNC specific schemas
export const UccncConnectionSchema = z.object({
    ip: z.string().describe('IP address of the machine running UCCNC'),
    port: z.number().int().describe('Port number of the UCCNC API service'),
    apiKey: z.string().optional().describe('API key for authentication')
});

export const UccncMachineSchema = MachineBaseSchema.extend({
    connection: UccncConnectionSchema
});

// Generic machine schema that can be any of the specific types
export const MachineSchema = z.union([
    S7MachineSchema,
    ShellyMachineSchema,
    UccncMachineSchema
]);

export const MachineListSchema = z.array(MachineSchema);