import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { CharacterCardDTO } from '@acm/shared';

interface MeiliIndex {
  addDocuments(docs: unknown[]): Promise<unknown>;
  search(q: string, opts: { limit: number }): Promise<{ hits: Array<{ slug?: string }> }>;
}

interface MeiliClient {
  createIndex(name: string, opts: { primaryKey: string }): Promise<unknown>;
  index(name: string): MeiliIndex;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly log = new Logger(SearchService.name);
  private client: MeiliClient | null = null;
  private readonly indexName = 'characters';

  get enabled(): boolean {
    return !!process.env.MEILI_HOST;
  }

  async onModuleInit() {
    if (!this.enabled) return;
    try {
      const { Meilisearch } = await import('meilisearch');
      this.client = new Meilisearch({
        host: process.env.MEILI_HOST!,
        apiKey: process.env.MEILI_MASTER_KEY,
      }) as MeiliClient;
      try {
        await this.client.createIndex(this.indexName, { primaryKey: 'id' });
      } catch {
        /* index may exist */
      }
      this.log.log('Meilisearch connected');
    } catch (err) {
      this.log.warn(`Meilisearch unavailable: ${err instanceof Error ? err.message : err}`);
    }
  }

  async indexCharacters(characters: CharacterCardDTO[]) {
    if (!this.client) return;
    await this.client.index(this.indexName).addDocuments(
      characters.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        niche: c.niche,
        style: c.style,
        tags: c.tags,
        fromPriceMinor: c.fromPriceMinor,
        rating: c.rating,
      })),
    );
  }

  async search(q: string, limit = 24): Promise<string[]> {
    if (!this.client || !q.trim()) return [];
    const res = await this.client.index(this.indexName).search(q, { limit });
    return res.hits.map((h) => h.slug).filter((slug): slug is string => !!slug);
  }
}
