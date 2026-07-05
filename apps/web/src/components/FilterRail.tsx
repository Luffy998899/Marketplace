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
  { value: LicenseType.ONE_TIME, label: '$1 use' },
  { value: LicenseType.CAMPAIGN, label: 'Campaign' },
  { value: LicenseType.FULL_RIGHTS, label: 'Full rights' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-subtle py-4 last:border-0">
      <h3 className="mb-3 font-display text-[10px] font-bold uppercase tracking-label text-ink-dim">
        {title}
      </h3>
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
      className={`chip ${active ? 'chip-active' : ''}`}
    >
      {children}
    </button>
  );
}

export function FilterRail() {
  const s = useFilterStore();

  return (
    <aside className="thin-scroll h-full overflow-y-auto">
      <div className="card-surface p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-xs font-bold uppercase tracking-label text-ink">
            Filters
          </h2>
          {s.activeCount() > 0 && (
            <button
              onClick={s.reset}
              className="text-[10px] font-semibold uppercase tracking-label text-lime hover:underline"
              type="button"
            >
              Clear · {s.activeCount()}
            </button>
          )}
        </div>

        <Section title="License">
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex flex-wrap gap-1.5">
            {NICHE_OPTIONS.map((o) => (
              <Chip key={o} active={s.niche.includes(o)} onClick={() => s.toggle('niche', o)}>
                {o}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Style">
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((o) => (
              <Chip key={o} active={s.style.includes(o)} onClick={() => s.toggle('style', o)}>
                {o}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Gender">
          <div className="flex flex-wrap gap-1.5">
            {GENDER_OPTIONS.map((o) => (
              <Chip key={o} active={s.gender.includes(o)} onClick={() => s.toggle('gender', o)}>
                {o}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Ethnicity">
          <div className="flex flex-wrap gap-1.5">
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

        <Section title="Rating">
          <div className="flex flex-wrap gap-1.5">
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
          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={s.availableOnly}
              onChange={(e) => s.setAvailableOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border accent-lime"
            />
            Available only
          </label>
        </Section>
      </div>
    </aside>
  );
}
