import { z } from 'zod';

export const ControlPointBaseSchema = z.object({
    id: z.string().describe('Unique identifier for the control point'),
    machineId: z.string().uuid().describe('ID of the machine this control point belongs to'),
    name: z.string().min(1).describe('Name of the control point')
});

// S7 specific schemas
export const S7ControlPointSchema = ControlPointBaseSchema.extend({
    address: z.string().min(1).describe('S7 address (e.g., "DB2.DBX0.0")'),
    dataType: z.enum(['BOOL', 'INT', 'DINT', 'REAL', 'WORD', 'BYTE', 'STRING']).describe('S7 data type')
});

// Shelly specific schemas
export const ShellyControlPointSchema = ControlPointBaseSchema.extend({
    endpoint: z.string().min(1).describe('HTTP endpoint to call (e.g., "/light/0")'),
    valueKey: z.string().min(1).describe('Parameter name for the value (e.g., "turn")'),
    valueOn: z.string().optional().describe('Value for ON state (e.g., "on")'),
    valueOff: z.string().optional().describe('Value for OFF state (e.g., "off")'),
    minValue: z.number().optional().describe('Min value for range controls'),
    maxValue: z.number().optional().describe('Max value for range controls')
});

// UCCNC specific schemas
export const UccncControlPointSchema = ControlPointBaseSchema.extend({
    command: z.string().min(1).describe('UCCNC command name'),
    minValue: z.number().optional().describe('Min value for range controls'),
    maxValue: z.number().optional().describe('Max value for range controls')
});

// Generic control point schema that can be any of the specific types
export const ControlPointSchema = z.union([
    S7ControlPointSchema,
    ShellyControlPointSchema,
    UccncControlPointSchema
]);

export const ControlPointListSchema = z.array(ControlPointSchema);

export const ControlPointStateSchema = z.object({
    id: z.string().describe('Unique identifier for the control point'),
    reported: z.any().nullable().describe('Current reported state of the control point'),
    target: z.any().nullable().describe('Target state of the control point'),
    status: z.enum(['OK', 'ERROR', 'DISCONNECTED']).describe('Status of the control point'),
    timestamp: z.string().datetime().describe('Timestamp of the state reading')
});

export const ControlPointTargetSchema = z.object({
    value: z.any().describe('Target value to set')
});