import { CharacterStatus } from '@acm/shared';

const LABELS: Record<string, string> = {
  [CharacterStatus.DRAFT]: 'Draft',
  [CharacterStatus.IN_REVIEW]: 'In review',
  [CharacterStatus.CHANGES_REQUESTED]: 'Changes',
  [CharacterStatus.LIVE]: 'Live',
  [CharacterStatus.SUSPENDED]: 'Suspended',
  [CharacterStatus.DELISTED]: 'Delisted',
};

export function ListingStatusBadge({ status }: { status: string }) {
  const live = status === CharacterStatus.LIVE;
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-label ${
        live ? 'bg-lime/15 text-lime' : 'bg-surface-raised text-ink-secondary'
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
