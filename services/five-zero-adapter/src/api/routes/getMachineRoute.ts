import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';
import { Adapter } from '../../domain/base/Adapter';
import { ErrorResponseSchema } from '../../schemas/ErrorSchema';

export const buildGetMachineRoute = (app: ServiceAPI, adapter: Adapter) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: '/machines/{machineId}',
            tags: ['Machines'],
            security: [{
                Bearer: []
            }],
            summary: 'Get machine by ID',
            description: 'Retrieve details for a specific machine',
            request: {
                params: z.object({
                    machineId: z.string().describe("Unique ID of the machine"),
                }),
            },
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: z.any(),
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
            },
        }),
        async (c) => {
            const { machineId } = c.req.valid('param');

            const machine = adapter.getMachine(machineId);

            if (!machine) {
                return c.json({ message: 'Machine not found', status: 404 }, 404);
            }

            return c.json(machine.toJSON());
        }
    );
};