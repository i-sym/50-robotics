
import { GenericRegistry } from "src/lib/generic-registry"
import { TwinScopeConfigData } from "../schemas";
import { TwinScope } from "./TwinScope";

class TwinScopeRegistry extends GenericRegistry<TwinScope> {
    constructor() {
        super();
    }
}

export { TwinScopeRegistry };