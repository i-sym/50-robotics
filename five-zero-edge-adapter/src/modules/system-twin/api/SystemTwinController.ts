import { Context } from "hono"
import { SystemTwinService } from "../SystemTwinService"
import { z } from "zod"
import { desc } from "drizzle-orm"

export class SystemTwinController {
    private systemTwinService

    public listTwinScopes = async (c: Context) => {

        try {

            const twinScopes = await this.systemTwinService.twinScopeRegistry.listDescriptions()

            return c.json({
                descriptions: twinScopes
            })
        } catch (error) {
            console.log("Error in listTwinScopes", error);
            return c.json({
                success: false,
                message: JSON.stringify(error)
            })
        }
    }

    public getTwinScope = async (c: Context) => {
        const twinScopeId = c.req.param('twinScopeId')

        const parsedTwinScopeId = z.coerce.number().parse(twinScopeId)

        const twinScope = await this.systemTwinService.twinScopeRegistry.get(parsedTwinScopeId)

        if (!twinScope) {
            return c.json({
                success: false,
                message: 'TwinScope not found'
            })
        }

        const description = await twinScope.getDescription()

        return c.json({
            description
        })
    }

    public getTwinComponent = async (c: Context) => {
        const twinComponentId = c.req.param('twinComponentId')

        const parsedTwinComponentId = z.coerce.number().parse(twinComponentId)

        const twinComponent = await this.systemTwinService.twinComponentRegistry.get(parsedTwinComponentId)

        if (!twinComponent) {
            return c.json({
                success: false,
                message: 'TwinComponent not found'
            })
        }

        const description = await twinComponent.getDescription()

        return c.json({
            description
        })
    }

    public listTwinComponents = async (c: Context) => {

        try {

            const twinComponents = await this.systemTwinService.twinComponentRegistry.listDescriptions()

            return c.json({
                descriptions: twinComponents
            })
        } catch (error) {
            console.log("Error in listTwinComponents", error);
            return c.json({
                success: false,
                message: JSON.stringify(error)
            })
        }
    }

    constructor({
        systemTwinService
    }: {
        systemTwinService: SystemTwinService
    }) {
        this.systemTwinService = systemTwinService
    }



}