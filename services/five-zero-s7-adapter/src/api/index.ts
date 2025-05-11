import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { bearerAuth } from 'hono/bearer-auth';
import { Bindings } from '../common/types/Bindings';
// import { errorMiddleware } from '../common';
import { AdapterService } from '../services/base/AdapterService';
import { openApiSetup } from './openapi';

import {
    buildGetMachinesRoute,
    buildGetMachineRoute,
    buildGetDataSourcesRoute,
    buildGetDataSourceValueRoute,
    buildGetControlPointsRoute,
    buildGetControlPointStateRoute,
    buildSetControlPointTargetRoute,
    buildHealthRoute
} from './routes';

/**
 * Setup the API routes and middleware
 */
export function setupApi(adapterService: AdapterService) {
    const app = new OpenAPIHono<{ Bindings: Bindings }>({
        defaultHook: (result, c) => {
            if (!result.success) {
                return c.json({
                    message: 'Validation error',
                    errors: result.error.issues,
                    status: 400
                }, 400);
            }
        }
    });

    // Set up OpenAPI documentation
    openApiSetup(app);

    // Add middleware
    app.use('*', cors());
    // app.use('*', errorMiddleware());
    // app.use('*', authMiddleware());

    // Swagger UI
    app.get('/docs/*', swaggerUI({ url: '/docs/openapi.json' }));

    // Health check route
    buildHealthRoute(app);

    // Get adapter service for the API
    const adapter = adapterService.getAdapter();

    // Machine routes
    buildGetMachinesRoute(app, adapter);
    buildGetMachineRoute(app, adapter);

    // Data source routes
    buildGetDataSourcesRoute(app, adapter);
    buildGetDataSourceValueRoute(app, adapter);

    // Control point routes
    buildGetControlPointsRoute(app, adapter);
    buildGetControlPointStateRoute(app, adapter);
    buildSetControlPointTargetRoute(app, adapter, adapterService.getMqttClient());

    return app;
}