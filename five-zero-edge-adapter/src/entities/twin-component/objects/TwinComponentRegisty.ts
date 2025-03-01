import { GenericRegistry } from "src/lib/generic-registry";
import { TwinComponentConfigData } from "../schemas";
import { TwinComponent } from "./TwinComponent";

class TwinComponentRegistry extends GenericRegistry<TwinComponent> {
    constructor() {
        super();
    }
}

export { TwinComponentRegistry };