// src/api/index.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { bearerAuth } from 'hono/bearer-auth';
import { Bindings } from '../common/types/Bindings';
import { MachineService } from '../services/MachineService';
import { DataSourceService } from '../services/DataSourceService';
import { ControlPointService } from '../services/ControlPointService';
import { authMiddleware, errorMiddleware } from '../common/middleware';
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
import { openApiSetup } from './openapi';

/**
 * Setup the API routes and middleware
 */
export function setupApi({
    machineService,
    dataSourceService,
    controlPointService
}: {
    machineService: MachineService;
    dataSourceService: DataSourceService;
    controlPointService: ControlPointService;
}) {
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
    app.use('*', errorMiddleware());
    app.use('*', authMiddleware());

    // Swagger UI
    app.get('/docs/*', swaggerUI({ url: '/docs/openapi.json' }));

    // Health check route
    buildHealthRoute(app);

    // Machine routes
    buildGetMachinesRoute(app, machineService);
    buildGetMachineRoute(app, machineService);

    // Data source routes
    buildGetDataSourcesRoute(app, machineService, dataSourceService);
    buildGetDataSourceValueRoute(app, dataSourceService);

    // Control point routes
    buildGetControlPointsRoute(app, machineService, controlPointService);
    buildGetControlPointStateRoute(app, controlPointService);
    buildSetControlPointTargetRoute(app, controlPointService);

    return app;
}
