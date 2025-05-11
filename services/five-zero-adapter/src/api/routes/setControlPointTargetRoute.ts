import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';
import { Adapter } from '../../domain/base/Adapter';
import { MqttClient } from '../../infrastructure/MqttClient';
import { ErrorResponseSchema } from '../../schemas/ErrorSchema';
import { ControlPointTargetSchema } from '../../schemas/ControlPointSchema';

export const buildSetControlPointTargetRoute = (
    app: ServiceAPI,
    adapter: Adapter,
    mqttClient: MqttClient
) => {
    app.openapi(
        createRoute({
            method: 'post',
            path: '/machines/{machineId}/controlpoints/{controlPointId}/target',
            tags: ['Control Points'],
            security: [{
                Bearer: []
            }],
            summary: 'Set target value for a control point',
            description: 'Set a target value for a specific control point',
            request: {
                params: z.object({
                    machineId: z.string().describe("Unique ID of the machine"),
                    controlPointId: z.string().describe("Unique ID of the control point"),
                }),
                body: {
                    content: {
                        'application/json': {
                            schema: ControlPointTargetSchema,
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: z.object({
                                id: z.string(),
                                target: z.any(),
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
                500: {
                    description: 'Server error',
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
            const body = await c.req.valid('json');

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

            try {
                // Publish to MQTT topic (this will trigger the control point handler)
                const topic = `/machines/${machineId}/controlPoints/${controlPointId}/target`;
                const message = JSON.stringify({
                    value: body.value,
                    timestamp: new Date().toISOString()
                });

                mqttClient.publish(topic, message);

                return c.json({
                    id: controlPointId,
                    target: body.value,
                    timestamp: new Date().toISOString()
                }, 200);
            } catch (error) {
                console.error(`Error setting target for ${controlPointId}:`, error);
                return c.json({
                    message: `Failed to set target: ${error instanceof Error ? error.message : error}`,
                    status: 500
                }, 500);
            }
        }
    );
};