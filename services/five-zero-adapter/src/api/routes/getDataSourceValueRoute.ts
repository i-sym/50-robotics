import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';
import { Adapter } from '../../domain/base/Adapter';
import { ErrorResponseSchema } from '../../schemas/ErrorSchema';

export const buildGetDataSourceValueRoute = (app: ServiceAPI, adapter: Adapter) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: '/machines/{machineId}/datasources/{dataSourceId}/value',
            tags: ['Data Sources'],
            security: [{
                Bearer: []
            }],
            summary: 'Get current value of a data source',
            description: 'Retrieve the current value and status of a specific data source',
            request: {
                params: z.object({
                    machineId: z.string().describe("Unique ID of the machine"),
                    dataSourceId: z.string().describe("Unique ID of the data source"),
                }),
            },
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: z.object({
                                id: z.string(),
                                value: z.any(),
                                status: z.enum(['OK', 'ERROR', 'DISCONNECTED']),
                                timestamp: z.string().datetime()
                            }),
                        },
                    },
                },
                404: {
                    description: 'Not found',
                    content: {
                        'application/json': {
                            schema: ErrorResponseSchema,
                        },
                    },
                },
                400: {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: ErrorResponseSchema,
                        },
                    },
                },
            },
        }),
        async (c) => {
            const { machineId, dataSourceId } = c.req.valid('param');

            const dataSource = adapter.getDataSource(dataSourceId);

            if (!dataSource) {
                return c.json({ message: 'Data source not found', status: 404 }, 404);
            }

            if (dataSource.getMachineId() !== machineId) {
                return c.json({
                    message: `Data source ${dataSourceId} does not belong to machine ${machineId}`,
                    status: 400
                }, 400);
            }

            return c.json({
                id: dataSourceId,
                value: dataSource.getCurrentValue(),
                status: dataSource.getCurrentStatus(),
                timestamp: new Date().toISOString()
            }, 200);
        }
    );
};