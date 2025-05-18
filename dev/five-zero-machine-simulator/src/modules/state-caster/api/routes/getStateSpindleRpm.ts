import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const getStateSpindleRpmRoute = createRoute({
    method: 'get',
    path: '/state/spindle-rpm',
    request: {

    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.any(),
                },
            },
            description: 'Retrieve the power data source information',
        },
    },
})

