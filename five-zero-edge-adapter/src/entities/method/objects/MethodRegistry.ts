import { GenericRegistry } from "@/lib/generic-registry";
import { MethodConfigData } from "../schemas";
import { Method } from "./Method";

export class MethodRegistry extends GenericRegistry<Method> {
    constructor() {
        super();
    }
}