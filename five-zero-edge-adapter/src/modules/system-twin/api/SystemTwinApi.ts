import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { SystemTwinService } from '../SystemTwinService'
import { SystemTwinController } from './SystemTwinController'

export class SystemTwinApi {
    public readonly app: Hono
    private ctrl: SystemTwinController

    constructor({
        systemTwinController
    }: {
        systemTwinController: SystemTwinController
    }) {
        this.ctrl = systemTwinController
        this.app = new Hono()

        this.app.get('/', (c) => {
            return c.json({ message: 'Hello World' })
        })

        this.app.get('/twin-scopes', this.ctrl.listTwinScopes)
        this.app.get('/twin-scopes/:twinScopeId', this.ctrl.getTwinScope)

        this.app.get('/twin-components', this.ctrl.listTwinComponents)
        this.app.get('/twin-components/:twinComponentId', this.ctrl.getTwinComponent)

    }
}