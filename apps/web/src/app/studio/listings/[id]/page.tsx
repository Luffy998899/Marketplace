'use client';

import { StudioShell } from '@/components/studio/StudioShell';
import { ListingWizard } from '@/components/studio/ListingWizard';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ListingWizardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading, isCreator } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=/studio/listings/${params.id}`);
    else if (!isCreator()) router.replace('/studio/become-creator');
  }, [user, loading, isCreator, router, params.id]);

  if (loading || !user || !isCreator()) {
    return (
      <StudioShell>
        <p className="text-sm text-ink-secondary">Loading…</p>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <ListingWizard listingId={params.id} />
    </StudioShell>
  );
}
