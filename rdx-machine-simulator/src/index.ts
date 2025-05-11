import { serve } from '@hono/node-server'
import env from './env'
import { createRoute, OpenAPIHono, z as o } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { createNodeWebSocket } from '@hono/node-ws'
import { StateCasterModule } from './modules/state-caster/StateCasterModule'
import { MqttModule } from './modules/mqtt/MqttModule'


const app = new OpenAPIHono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })


const stateCasterModule = new StateCasterModule({
  deps: {
    upgradeWebSocket,
  }
})

const mqttModule = new MqttModule()

mqttModule.init()

app.route('/machine', stateCasterModule.api.app)


const route = createRoute({
  method: 'get',
  path: '/health',
  request: {
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: o.object({
            status: o.string(),
          }),
        },
      },
      description: 'Retrieve the user',
    },
  },
})

app.openapi(route, (c) => {
  return c.json({ status: 'ok' })
})

app.get('/ui', swaggerUI({ url: '/doc' }))


// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})


const port = env.PORT

console.log(`Server is running on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port
})
injectWebSocket(server)