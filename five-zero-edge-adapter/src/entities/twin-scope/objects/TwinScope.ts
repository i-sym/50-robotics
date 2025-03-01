import { Describable } from "@/lib/descriptions";
import { TwinScopeConfigData } from "../schemas";
import { Indexable } from "@/lib/indexable";

export class TwinScope implements Describable, Indexable {
    config: TwinScopeConfigData;

    public readonly id: number;
    public readonly slug: string;

    constructor({
        config
    }: {
        config: TwinScopeConfigData;
    }) {
        this.config = config;

        this.id = config.id;
        this.slug = `TwinScope:${config.id}`;
    }

    public async getDescription() {
        return {
            kind: "TwinScope",
            description: {
                config: this.config
            }
        }
    }

}