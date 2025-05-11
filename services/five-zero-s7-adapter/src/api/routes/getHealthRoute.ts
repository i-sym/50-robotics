import { z } from 'zod';
import { createRoute } from '@hono/zod-openapi';
import { ServiceAPI } from '../../common/types/Bindings';

export const buildHealthRoute = (app: ServiceAPI) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: '/health',
            tags: ['System'],
            summary: 'Health check',
            description: 'Check the health status of the service',
            responses: {
                200: {
                    description: 'Service is healthy',
                    content: {
                        'application/json': {
                            schema: z.object({
                                status: z.string(),
                                timestamp: z.string().datetime(),
                            }),
                        },
                    },
                },
            },
        }),
        async (c) => {
            return c.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
            });
        }
    );
};