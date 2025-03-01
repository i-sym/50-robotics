import { Describable } from "@/lib/descriptions";
import { TwinComponentConfigData } from "../schemas";
import { Indexable } from "@/lib/indexable";

export class TwinComponent implements Describable, Indexable {
    config: TwinComponentConfigData;

    public readonly id;
    public readonly slug;

    constructor({
        config
    }: {
        config: TwinComponentConfigData;
    }) {
        this.config = config;

        this.id = config.id;
        this.slug = config.name;
    }

    public async getDescription() {
        return {
            kind: "TwinComponent",
            description: {
                config: this.config
            }
        }
    }

}