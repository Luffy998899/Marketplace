import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { CharacterFilterSchema } from '@acm/shared';
import { CharactersService } from './characters.service';

@Controller('characters')
export class CharactersController {
  constructor(private readonly characters: CharactersService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    const filter = CharacterFilterSchema.parse(normalizeQuery(query));
    return this.characters.list(filter);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    const character = this.characters.getBySlug(slug);
    if (!character) throw new NotFoundException('Character not found');
    return character;
  }
}

// Express query params arrive as strings / string[]. Coerce into the shapes the
// zod filter schema expects (arrays, numbers, booleans).
function normalizeQuery(query: Record<string, unknown>): Record<string, unknown> {
  const arrayKeys = ['gender', 'ethnicity', 'niche', 'style', 'licenseType'];
  const numberKeys = ['minPriceMinor', 'maxPriceMinor', 'minRating', 'page', 'pageSize'];
  const out: Record<string, unknown> = { ...query };
  for (const key of arrayKeys) {
    if (out[key] === undefined) continue;
    out[key] = Array.isArray(out[key])
      ? out[key]
      : String(out[key])
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  }
  for (const key of numberKeys) {
    if (out[key] !== undefined) out[key] = Number(out[key]);
  }
  if (out.availableOnly !== undefined) out.availableOnly = out.availableOnly === 'true' || out.availableOnly === true;
  return out;
}
