import { Describable } from "@/lib/descriptions";
import { DataSourceConfigData } from "../schemas";
import { Indexable } from "@/lib/indexable";

export class DataSource implements Describable, Indexable {

    public readonly id: number;
    public readonly slug: string;

    config: DataSourceConfigData;

    constructor({
        config
    }: {
        config: DataSourceConfigData;
    }) {
        this.id = config.id;
        this.slug = `DataSource:${config.id}`;
        this.config = config;
    }

    public async getDescription() {
        return {
            kind: "DataSource",
            description: {
                config: this.config
            }
        }
    }



}