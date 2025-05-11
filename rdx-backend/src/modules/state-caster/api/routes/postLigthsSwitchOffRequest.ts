import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const postLightSwitchOff = createRoute({
    method: 'post',
    path: '/control/lights/switch-off',
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

