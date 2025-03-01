import { Describable } from "@/lib/descriptions";
import { MethodConfigData } from "../schemas";
import { Indexable } from "@/lib/indexable";

export class Method implements Describable, Indexable {
    config: MethodConfigData;

    public readonly id: number;
    public readonly slug: string;

    constructor({
        config
    }: {
        config: MethodConfigData;
    }) {
        this.id = config.id;
        this.slug = `Method:${config.id}`;
        this.config = config;
    }

    public async getDescription() {
        return {
            kind: "Method",
            description: {
                config: this.config
            }
        }
    }



}