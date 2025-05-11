import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const postLightsSetColorRequest = createRoute({
    method: 'post',
    path: '/control/lights/set-color',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        red: z.number().min(0).max(255),
                        green: z.number().min(0).max(255),
                        blue: z.number().min(0).max(255),
                    }),
                },
            },
        },
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

