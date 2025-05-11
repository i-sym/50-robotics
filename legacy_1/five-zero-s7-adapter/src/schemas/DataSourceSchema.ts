import { z } from 'zod';

export const DataSourceSchema = z.object({
    id: z.string().uuid().describe("Unique identifier for the data source"),
    machineId: z.string().uuid().describe("ID of the machine this data source belongs to"),
    name: z.string().min(1).describe("Name of the data source"),
    address: z.string().min(1).describe("S7 address (e.g., 'DB1.DBD4')"),
    dataType: z.enum(['BOOL', 'INT', 'DINT', 'REAL', 'WORD', 'BYTE', 'STRING']).describe("S7 data type"),
    scaleFactor: z.number().optional().default(1).describe("Scale factor to apply to the raw value"),
    offset: z.number().optional().default(0).describe("Offset to apply to the raw value after scaling")
});

export const DataSourceCreateSchema = DataSourceSchema.omit({
    id: true,
    machineId: true
});

export const DataSourceUpdateSchema = DataSourceCreateSchema.partial();

export const DataSourceListSchema = z.array(DataSourceSchema);

export const DataSourceValueSchema = z.object({
    id: z.string().uuid().describe("Unique identifier for the data source"),
    value: z.any().describe("Current value of the data source"),
    status: z.enum(['OK', 'ERROR', 'DISCONNECTED']).describe("Status of the data source"),
    timestamp: z.string().datetime().describe("Timestamp of the value reading")
});

export type DataSourceData = z.infer<typeof DataSourceSchema>;
export type DataSourceCreateData = z.infer<typeof DataSourceCreateSchema>;
export type DataSourceUpdateData = z.infer<typeof DataSourceUpdateSchema>;
export type DataSourceValueData = z.infer<typeof DataSourceValueSchema>;