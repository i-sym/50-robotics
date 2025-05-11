import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';
import { Adapter } from '../../domain/base/Adapter';
import { ErrorResponseSchema } from '../../schemas/ErrorSchema';

export const buildGetControlPointStateRoute = (app: ServiceAPI, adapter: Adapter) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: '/machines/{machineId}/controlpoints/{controlPointId}',
            tags: ['Control Points'],
            security: [{
                Bearer: []
            }],
            summary: 'Get current state of a control point',
            description: 'Retrieve the current reported state, target state, and status of a specific control point',
            request: {
                params: z.object({
                    machineId: z.string().describe("Unique ID of the machine"),
                    controlPointId: z.string().describe("Unique ID of the control point"),
                }),
            },
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: z.object({
                                id: z.string(),
                                reported: z.any().nullable(),
                                target: z.any().nullable(),
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
            const { machineId, controlPointId } = c.req.valid('param');

            const controlPoint = adapter.getControlPoint(controlPointId);

            if (!controlPoint) {
                return c.json({ message: 'Control point not found', status: 404 }, 404);
            }

            if (controlPoint.getMachineId() !== machineId) {
                return c.json({
                    message: `Control point ${controlPointId} does not belong to machine ${machineId}`,
                    status: 400
                }, 400);
            }

            return c.json({
                id: controlPointId,
                reported: controlPoint.getCurrentReported(),
                target: controlPoint.getCurrentTarget(),
                status: controlPoint.getCurrentStatus(),
                timestamp: new Date().toISOString()
            }, 200);
        }
    );
};