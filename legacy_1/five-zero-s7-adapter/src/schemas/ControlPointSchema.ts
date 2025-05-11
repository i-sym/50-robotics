import { z } from 'zod';

export const ControlPointSchema = z.object({
    id: z.string().uuid().describe("Unique identifier for the control point"),
    machineId: z.string().uuid().describe("ID of the machine this control point belongs to"),
    name: z.string().min(1).describe("Name of the control point"),
    address: z.string().min(1).describe("S7 address (e.g., 'DB2.DBX0.0')"),
    dataType: z.enum(['BOOL', 'INT', 'DINT', 'REAL', 'WORD', 'BYTE', 'STRING']).describe("S7 data type")
});

export const ControlPointCreateSchema = ControlPointSchema.omit({
    id: true,
    machineId: true
});

export const ControlPointUpdateSchema = ControlPointCreateSchema.partial();

export const ControlPointListSchema = z.array(ControlPointSchema);

export const ControlPointStateSchema = z.object({
    id: z.string().uuid().describe("Unique identifier for the control point"),
    reported: z.any().nullable().describe("Current reported state of the control point"),
    target: z.any().nullable().describe("Target state of the control point"),
    status: z.enum(['OK', 'ERROR', 'DISCONNECTED']).describe("Status of the control point"),
    timestamp: z.string().datetime().describe("Timestamp of the state reading")
});

export const ControlPointTargetSchema = z.object({
    value: z.any().describe("Target value to set")
});

export type ControlPointData = z.infer<typeof ControlPointSchema>;
export type ControlPointCreateData = z.infer<typeof ControlPointCreateSchema>;
export type ControlPointUpdateData = z.infer<typeof ControlPointUpdateSchema>;
export type ControlPointStateData = z.infer<typeof ControlPointStateSchema>;
export type ControlPointTargetData = z.infer<typeof ControlPointTargetSchema>;
