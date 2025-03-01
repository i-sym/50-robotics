import { Describable } from "@/lib/descriptions";
import { DataSourceLinkConfigData } from "../schemas";
import { Indexable } from "@/lib/indexable";

export class DataSourceLink implements Describable, Indexable {
    config: DataSourceLinkConfigData;

    public readonly id: number;
    public readonly slug: string;

    constructor({
        config
    }: {
        config: DataSourceLinkConfigData;
    }) {
        this.id = config.id;
        this.slug = `DataSourceLink:${config.id}`;

        this.config = config;
    }

    public async getDescription() {
        return {
            kind: "DataSourceLink",
            description: {
                config: this.config
            }
        }
    }
}