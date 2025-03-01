import { TwinScopeRegistry } from "src/entities/twin-scope/objects/TwinScopeRegistry";
import { SystemTwinApi } from "./api/SystemTwinApi";
import { SystemTwinController } from "./api/SystemTwinController";
import { TwinComponent } from "src/entities/twin-component/objects/TwinComponent";
import { TwinComponentRegistry } from "src/entities/twin-component/objects/TwinComponentRegisty";
import { db } from "../db/db";
import { console } from "inspector";

export class SystemTwinService {

    public readonly api: SystemTwinApi;
    private apiController: SystemTwinController;

    public readonly twinScopeRegistry: TwinScopeRegistry;
    public readonly twinComponentRegistry: TwinComponentRegistry;

    constructor() {

        this.apiController = new SystemTwinController({
            systemTwinService: this
        });

        this.api = new SystemTwinApi({
            systemTwinController: this.apiController
        });

        this.twinScopeRegistry = new TwinScopeRegistry();
        this.twinComponentRegistry = new TwinComponentRegistry();



    }

    public async init() {

    }

    public async initTwinComponentRegistry() {
        const res = db.query.dataSourceConfigTable.findMany({

        })

        console.log("res", res);
    }

}