declare module 'meilisearch' {
  export class Meilisearch {
    constructor(config: { host: string; apiKey?: string });
    createIndex(name: string, opts: { primaryKey: string }): Promise<unknown>;
    index(name: string): {
      addDocuments(docs: unknown[]): Promise<unknown>;
      search(q: string, opts: { limit: number }): Promise<{ hits: Array<{ slug?: string }> }>;
    };
  }
}
