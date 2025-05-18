import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { createRoute } from '@hono/zod-openapi'
import snap7 from 'node-snap7'
import { swaggerUI } from '@hono/swagger-ui'

// S7 Simulator
class S7Simulator {
  private values: {
    SPINDLE_POWER: number,
    SPINDLE_RPM: number,
    MOTOR_LOAD: number,
    VIBRATION: number
  }
  private server: any
  private db1Buffer: Buffer
  private changing: boolean = false
  private interval: NodeJS.Timeout | null = null

  constructor() {
    // Initialize with reasonable starting values
    this.values = {
      SPINDLE_POWER: 2100, // watts
      SPINDLE_RPM: 1500,   // RPM
      MOTOR_LOAD: 50,      // percentage
      VIBRATION: 200       // arbitrary units
    }

    // Create a DB1 buffer for S7 communication
    this.db1Buffer = Buffer.alloc(2000) // Size large enough for our data
    this.updateBuffer()

    // Initialize the S7 server

    // @ts-ignore
    this.server = new snap7.S7Server()
  }

  public start() {
    try {
      // Register the DB1 area

      // @ts-ignore
      this.server.RegisterArea(this.server.srvAreaDB, 1, this.db1Buffer)

      // Start the server on default port (102)
      this.server.StartTo('0.0.0.0')
      console.log('S7 Server started on port 102')

      // Start the simulation
      this.startSimulation()
    } catch (err) {
      console.error('Failed to start S7 Server:', err)
    }
  }

  private updateBuffer() {
    // Update the buffer with current values
    // Writing WORD values at the specified offsets

    console.log('Updating buffer with values:', this.values)

    this.db1Buffer.writeUInt16BE(this.values.SPINDLE_POWER, 1136)
    this.db1Buffer.writeUInt16BE(this.values.SPINDLE_RPM, 1140)
    this.db1Buffer.writeUInt16BE(this.values.MOTOR_LOAD, 1138)
    this.db1Buffer.writeUInt16BE(this.values.VIBRATION, 1142)

    // Unregister the area to update the buffer
    // @ts-ignore

    if (this.server?.srvAreaDB) {

      this.server.UnregisterArea(this.server.srvAreaDB, 1)
      // Register the area again to apply changes
      // @ts-ignore
      this.server.RegisterArea(this.server.srvAreaDB, 1, this.db1Buffer)
    }
  }

  private startSimulation() {
    // Update values every second with some realistic variations
    this.interval = setInterval(() => {
      if (this.changing) return

      this.changing = true

      // Create realistic changes that follow trends
      // SPINDLE_POWER: gradually changes with occasional spikes
      this.values.SPINDLE_POWER += Math.floor(Math.random() * 21) - 10
      // Keep within realistic bounds
      this.values.SPINDLE_POWER = Math.max(1000, Math.min(3000, this.values.SPINDLE_POWER))

      // SPINDLE_RPM: stays relatively stable with small fluctuations
      this.values.SPINDLE_RPM += Math.floor(Math.random() * 11) - 5
      this.values.SPINDLE_RPM = Math.max(1200, Math.min(1800, this.values.SPINDLE_RPM))

      // MOTOR_LOAD: can vary more significantly
      this.values.MOTOR_LOAD += Math.floor(Math.random() * 7) - 3
      this.values.MOTOR_LOAD = Math.max(20, Math.min(90, this.values.MOTOR_LOAD))

      // VIBRATION: occasional spikes but generally stays in a range
      this.values.VIBRATION += Math.floor(Math.random() * 31) - 15
      this.values.VIBRATION = Math.max(100, Math.min(500, this.values.VIBRATION))

      // Update the S7 server buffer
      this.updateBuffer()
      this.changing = false
    }, 1000)
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.server.Stop()
  }

  public getValues() {
    return { ...this.values }
  }

  public setValue(key: keyof typeof this.values, value: number) {
    if (key in this.values) {
      this.values[key] = value
      this.updateBuffer()
      return true
    }
    return false
  }
}

// Shelly RGBW Simulator
class ShellySimulator {
  private state: {
    turn: 'on' | 'off',
    red: number,
    green: number,
    blue: number,
    brightness: number
  }

  constructor() {
    this.state = {
      turn: 'off',
      red: 255,
      green: 255,
      blue: 255,
      brightness: 100
    }
  }

  public getState() {
    return { ...this.state }
  }

  public updateState(params: Partial<typeof this.state>) {
    this.state = { ...this.state, ...params }
    return this.state
  }
}

// Create the Hono app with OpenAPI support
const app = new OpenAPIHono()

// Create instances of simulators
const s7Simulator = new S7Simulator()
const shellySimulator = new ShellySimulator()

// Start S7 Simulator when the server starts
s7Simulator.start()

// Handle process exit
process.on('exit', () => {
  s7Simulator.stop()
})

// Define Zod schemas for API validation
const S7ValuesSchema = z.object({
  SPINDLE_POWER: z.number().min(0).max(5000),
  SPINDLE_RPM: z.number().min(0).max(3000),
  MOTOR_LOAD: z.number().min(0).max(100),
  VIBRATION: z.number().min(0).max(1000)
})

const S7UpdateSchema = z.object({
  key: z.enum(['SPINDLE_POWER', 'SPINDLE_RPM', 'MOTOR_LOAD', 'VIBRATION']),
  value: z.number()
})

const ShellyStateSchema = z.object({
  turn: z.enum(['on', 'off']),
  red: z.number().min(0).max(255),
  green: z.number().min(0).max(255),
  blue: z.number().min(0).max(255),
  brightness: z.number().min(0).max(100)
})

const ShellyUpdateSchema = z.object({
  turn: z.enum(['on', 'off']).optional(),
  red: z.number().min(0).max(255).optional(),
  green: z.number().min(0).max(255).optional(),
  blue: z.number().min(0).max(255).optional(),
  brightness: z.number().min(0).max(100).optional()
})

// Define API routes

// API documentation
app.doc('/api/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Five-Zero Simulation API',
    version: '1.0.0',
    description: 'API for the Five-Zero S7 and Shelly simulation'
  }
})

// S7 simulator routes
app.openapi(
  createRoute({
    method: 'get',
    path: '/api/simulation/s7',
    tags: ['S7 Simulator'],
    summary: 'Get current S7 simulated values',
    responses: {
      200: {
        description: 'Current S7 values',
        content: {
          'application/json': {
            schema: S7ValuesSchema
          }
        }
      }
    }
  }),
  (c) => {
    return c.json(s7Simulator.getValues())
  }
)

app.openapi(
  createRoute({
    method: 'post',
    path: '/api/simulation/s7',
    tags: ['S7 Simulator'],
    summary: 'Update a specific S7 value',
    request: {
      body: {
        content: {
          'application/json': {
            schema: S7UpdateSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Updated S7 values',
        content: {
          'application/json': {
            schema: S7ValuesSchema
          }
        }
      },
      400: {
        description: 'Invalid request'
      }
    }
  }),
  async (c) => {
    const data = await c.req.json()
    const validation = S7UpdateSchema.safeParse(data)

    if (!validation.success) {
      return c.json({ error: 'Invalid data', details: validation.error }, 400)
    }

    const { key, value } = validation.data
    s7Simulator.setValue(key, value)

    return c.json(s7Simulator.getValues())
  }
)

// Shelly simulator routes
app.openapi(
  createRoute({
    method: 'get',
    path: '/api/simulation/shelly',
    tags: ['Shelly Simulator'],
    summary: 'Get current Shelly state',
    responses: {
      200: {
        description: 'Current Shelly state',
        content: {
          'application/json': {
            schema: ShellyStateSchema
          }
        }
      }
    }
  }),
  (c) => {
    return c.json(shellySimulator.getState())
  }
)

app.openapi(
  createRoute({
    method: 'post',
    path: '/api/simulation/shelly',
    tags: ['Shelly Simulator'],
    summary: 'Update Shelly state',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ShellyUpdateSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Updated Shelly state',
        content: {
          'application/json': {
            schema: ShellyStateSchema
          }
        }
      },
      400: {
        description: 'Invalid request'
      }
    }
  }),
  async (c) => {
    const data = await c.req.json()
    const validation = ShellyUpdateSchema.safeParse(data)

    if (!validation.success) {
      return c.json({ error: 'Invalid data', details: validation.error }, 400)
    }

    const updatedState = shellySimulator.updateState(validation.data)
    return c.json(updatedState)
  }
)

// Shelly direct HTTP endpoints to mimic real Shelly device
app.get('/light/0', (c) => {
  return c.json(shellySimulator.getState())
})

app.post('/light/0', async (c) => {
  // Parse URL parameters from the query string
  const url = new URL(c.req.url)
  const params: Record<string, any> = {}

  // Convert query parameters to state updates
  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'turn') {
      params.turn = value as 'on' | 'off'
    } else if (['red', 'green', 'blue', 'brightness'].includes(key)) {
      params[key] = Number(value)
    }
  }

  // Update Shelly state
  const updatedState = shellySimulator.updateState(params)
  return c.json({ success: true, state: updatedState })
})

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Five-Zero Simulation API',
    version: '1.0.0',
    description: 'API for the Five-Zero S7 and Shelly simulation'
  }
})

app.get(
  '/ui',
  swaggerUI({
    url: '/doc',
  })
);



// Start the server
const port = 8099
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})