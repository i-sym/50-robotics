import { GenericRegistry } from "@/lib/generic-registry";
import { DataSourceLinkConfigData } from "../schemas";
import { DataSourceLink } from "./DataSourceLink";

export class DataSourceLinkRegistry extends GenericRegistry<DataSourceLink> {
    constructor() {
        super();
    }
}