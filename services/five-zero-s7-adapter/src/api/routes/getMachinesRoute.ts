import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';
import { Adapter } from '../../domain/base/Adapter';

export const buildGetMachinesRoute = (app: ServiceAPI, adapter: Adapter) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: '/machines',
            tags: ['Machines'],
            security: [{
                Bearer: []
            }],
            summary: 'Get all machines',
            description: 'Retrieve a list of all configured machines',
            responses: {
                200: {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: z.array(z.any()),
                        },
                    },
                },
            },
        }),
        async (c) => {
            const machines = adapter.getAllMachines().map(machine => machine.toJSON());
            return c.json(machines);
        }
    );
};