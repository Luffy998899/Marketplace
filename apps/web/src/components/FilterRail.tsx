'use client';

import {
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  LicenseType,
  NICHE_OPTIONS,
  STYLE_OPTIONS,
} from '@acm/shared';
import { useFilterStore } from '@/store/filters';

const LICENSE_OPTIONS: { value: LicenseType; label: string }[] = [
  { value: LicenseType.ONE_TIME, label: 'One-time ($1)' },
  { value: LicenseType.CAMPAIGN, label: 'Campaign' },
  { value: LicenseType.FULL_RIGHTS, label: 'Full rights' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/5 py-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h3>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
        active
          ? 'border-neon-400 bg-neon-500/20 text-neon-200'
          : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterRail() {
  const s = useFilterStore();

  return (
    <aside className="thin-scroll h-full overflow-y-auto pr-2">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Filters</h2>
        {s.activeCount() > 0 && (
          <button
            onClick={s.reset}
            className="text-xs text-neon-300 hover:text-neon-200"
            type="button"
          >
            Clear ({s.activeCount()})
          </button>
        )}
      </div>

      <Section title="License type">
        <div className="flex flex-wrap gap-2">
          {LICENSE_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              active={s.licenseType.includes(o.value)}
              onClick={() => s.toggleLicense(o.value)}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Niche">
        <div className="flex flex-wrap gap-2">
          {NICHE_OPTIONS.map((o) => (
            <Chip key={o} active={s.niche.includes(o)} onClick={() => s.toggle('niche', o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Style">
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((o) => (
            <Chip key={o} active={s.style.includes(o)} onClick={() => s.toggle('style', o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Gender">
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((o) => (
            <Chip key={o} active={s.gender.includes(o)} onClick={() => s.toggle('gender', o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Ethnicity">
        <div className="flex flex-wrap gap-2">
          {ETHNICITY_OPTIONS.map((o) => (
            <Chip
              key={o}
              active={s.ethnicity.includes(o)}
              onClick={() => s.toggle('ethnicity', o)}
            >
              {o.replace('-', ' ')}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Minimum rating">
        <div className="flex flex-wrap gap-2">
          {[3, 4, 4.5].map((r) => (
            <Chip
              key={r}
              active={s.minRating === r}
              onClick={() => s.setMinRating(s.minRating === r ? undefined : r)}
            >
              ★ {r}+
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={s.availableOnly}
            onChange={(e) => s.setAvailableOnly(e.target.checked)}
            className="h-4 w-4 accent-neon-500"
          />
          Available only (hide exclusively licensed)
        </label>
      </Section>
    </aside>
  );
}
