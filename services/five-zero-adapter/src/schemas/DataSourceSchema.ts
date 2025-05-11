import { z } from 'zod';

export const DataSourceBaseSchema = z.object({
    id: z.string().describe('Unique identifier for the data source'),
    machineId: z.string().uuid().describe('ID of the machine this data source belongs to'),
    name: z.string().min(1).describe('Name of the data source'),
    scaleFactor: z.number().optional().default(1).describe('Scale factor to apply to the raw value'),
    offset: z.number().optional().default(0).describe('Offset to apply to the raw value after scaling')
});

// S7 specific schemas
export const S7DataSourceSchema = DataSourceBaseSchema.extend({
    address: z.string().min(1).describe('S7 address (e.g., "DB1.DBD4")'),
    dataType: z.enum(['BOOL', 'INT', 'DINT', 'REAL', 'WORD', 'BYTE', 'STRING']).describe('S7 data type')
});

// Shelly specific schemas
export const ShellyDataSourceSchema = DataSourceBaseSchema.extend({
    endpoint: z.string().min(1).describe('HTTP endpoint to call (e.g., "/status")'),
    valuePath: z.string().min(1).describe('JSON path to the value in the response (e.g., "meters[0].power")')
});

// UCCNC specific schemas
export const UccncDataSourceSchema = DataSourceBaseSchema.extend({
    variable: z.string().min(1).describe('UCCNC variable name')
});

// Generic data source schema that can be any of the specific types
export const DataSourceSchema = z.union([
    S7DataSourceSchema,
    ShellyDataSourceSchema,
    UccncDataSourceSchema
]);

export const DataSourceListSchema = z.array(DataSourceSchema);

export const DataSourceValueSchema = z.object({
    id: z.string().describe('Unique identifier for the data source'),
    value: z.any().describe('Current value of the data source'),
    status: z.enum(['OK', 'ERROR', 'DISCONNECTED']).describe('Status of the data source'),
    timestamp: z.string().datetime().describe('Timestamp of the value reading')
});