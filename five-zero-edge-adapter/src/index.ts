import { serve } from '@hono/node-server'
import app from './modules/api/api'
import env from './env'
import { SystemTwinService } from './modules/system-twin/SystemTwinService'



const port = env.PORT
console.log(`Server is running on port ${port}`)

const systemTwinService = new SystemTwinService()

systemTwinService.init().then(() => {
  console.log('System Twin Service initialized')
})

app.route('/api/v1/system-twin', systemTwinService.api.app)

serve({
  fetch: app.fetch,
  port
})
