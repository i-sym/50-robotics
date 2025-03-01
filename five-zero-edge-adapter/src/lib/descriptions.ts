export interface Describable {
    getDescription: () => Promise<{
        kind: string;
        description: {
            [key: string]: unknown;
        }
    }>
}