import { GenericRegistry } from "src/lib/generic-registry";
import { DataSourceConfigData } from "../schemas";
import { DataSource } from "./DataSource";

export class DataSourceRegistry extends GenericRegistry<DataSource> {
    constructor() {
        super();
    }
}