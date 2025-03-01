import { Indexable } from "./indexable";
import { Describable } from "./descriptions";

export class GenericRegistry<T extends (Indexable & Describable)> {
    private readonly registry: Map<number, T> = new Map();
    private readonly slugRegistry: Map<string, T> = new Map();

    public register(item: T) {
        this.registry.set(item.id, item);
        this.slugRegistry.set(item.slug, item);
    }

    public get(id: number): T | undefined {
        return this.registry.get(id);
    }

    public getBySlug(slug: string): T | undefined {
        return this.slugRegistry.get(slug);
    }

    public asList(): T[] {
        return Array.from(this.registry.values());
    }

    public async listDescriptions() {
        return await Promise.all(this.asList().map((item) => item.getDescription()))
    }

    public async getDescription() {
        return {
            kind: "GenericRegistry",
            description: {
                items: await Promise.all(this.asList().map((item) => item.getDescription()))
            }
        }
    }


}