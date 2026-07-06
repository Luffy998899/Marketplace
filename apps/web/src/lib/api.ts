/** Same-origin in browser (Next rewrite → API). Full URL for SSR. */
export function getApiBase(): string {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
    throw new Error(msg ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const authApi = {
  register: (body: { email: string; password: string; displayName: string }) =>
    api<{ user: { id: string; email: string; displayName: string; role: string }; expiresIn: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  login: (body: { email: string; password: string }) =>
    api<{ user: { id: string; email: string; displayName: string; role: string }; expiresIn: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  google: (body: { email: string; displayName: string; googleId: string }) =>
    api<{ user: { id: string; email: string; displayName: string; role: string }; expiresIn: string }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  logout: () => api<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () =>
    api<{ id: string; email: string; displayName: string; role: string }>('/auth/me'),
};

export const kycApi = {
  status: () =>
    api<{
      status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
      legalName?: string;
      countryCode?: string;
      message?: string;
    }>('/kyc/status'),
  submit: (body: { legalName: string; countryCode: string; agreedToTerms: boolean }) =>
    api<{ status: string; message?: string }>('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const walletApi = {
  balance: () =>
    api<{
      userId: string;
      balance: { amountMinor: number; currency: string };
      payoutPending: { amountMinor: number; currency: string };
    }>('/wallet/me/balance'),
  topUp: (amountMinor: number) =>
    api<{
      id: string;
      amount: { amountMinor: number; currency: string };
      status: string;
      clientSecret?: string;
    }>('/wallet/me/topup', {
      method: 'POST',
      body: JSON.stringify({ amountMinor }),
    }),
};

export const ordersApi = {
  purchase: (characterSlug: string, licenseTierId: string) =>
    api<{
      orderId: string;
      certificate: { serial: string; ledgerHash: string };
      amountMinor: number;
      currency: string;
    }>('/orders/purchase', {
      method: 'POST',
      body: JSON.stringify({ characterSlug, licenseTierId }),
    }),
  mine: () =>
    api<
      Array<{
        orderId: string;
        characterSlug: string;
        characterName: string;
        licenseType: string;
        amountMinor: number;
        currency: string;
        certificate: { serial: string; issuedAt: string; ledgerHash: string };
        purchasedAt: string;
      }>
    >('/orders/me'),
};

export const assetsApi = {
  downloads: (characterSlug: string) =>
    api<
      Array<{ url: string; expiresAt: string; assetKind: string; label: string }>
    >(`/assets/${characterSlug}/downloads`),
};

export const studioApi = {
  becomeCreator: () =>
    api<{ id: string; email: string; displayName: string; role: string }>(
      '/auth/become-creator',
      { method: 'POST' },
    ),
  stats: () =>
    api<{
      totalListings: number;
      liveListings: number;
      draftListings: number;
      inReviewListings: number;
      payoutPendingMinor: number;
      currency: string;
    }>('/studio/stats'),
  listings: () =>
    api<
      Array<{
        id: string;
        slug: string;
        name: string;
        status: string;
        niche: string;
        checklist: { currentStep: string; moderationPassed: boolean };
        updatedAt: string;
      }>
    >('/studio/listings'),
  getListing: (id: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}`),
  createListing: (body: {
    name: string;
    tagline?: string;
    niche: string;
    style: string;
    gender: string;
    ethnicity: string;
  }) =>
    api<import('@acm/shared').CreatorListingDTO>('/studio/listings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateListing: (id: string, body: Record<string, string | undefined>) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  confirmIdentity: (id: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}/identity`, {
      method: 'POST',
    }),
  uploadAsset: (id: string, body: { kind: string; url: string; label?: string }) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}/assets`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  stampSynthId: (id: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}/synthid`, {
      method: 'POST',
    }),
  signRights: (id: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}/rights`, {
      method: 'POST',
    }),
  submit: (id: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/studio/listings/${id}/submit`, {
      method: 'POST',
    }),
  uploadFile: async (id: string, kind: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    const res = await fetch(`${getApiBase()}/api/studio/listings/${id}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message ?? 'Upload failed');
    }
    return res.json() as Promise<import('@acm/shared').CreatorListingDTO>;
  },
};

export const moderationApi = {
  queue: () =>
    api<Array<import('@acm/shared').CreatorListingDTO>>('/moderation/queue'),
  approve: (listingId: string, notes?: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/moderation/${listingId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  reject: (listingId: string, notes: string) =>
    api<import('@acm/shared').CreatorListingDTO>(`/moderation/${listingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
};

export const certificatesApi = {
  verify: (serial: string) =>
    api<{
      valid: boolean;
      serial?: string;
      orderId?: string;
      ledgerHash?: string;
      characterSlug?: string;
      characterName?: string;
      licenseType?: string;
      purchasedAt?: string;
      message?: string;
    }>(`/certificates/verify/${encodeURIComponent(serial)}`),
};

export const commissionsApi = {
  open: () => api<import('@acm/shared').CommissionDTO[]>('/commissions/open'),
  mine: () => api<import('@acm/shared').CommissionDTO[]>('/commissions/me'),
  get: (id: string) => api<import('@acm/shared').CommissionDTO>(`/commissions/${id}`),
  create: (body: { title: string; brief: string; budgetMinor: number; deadline?: string }) =>
    api<import('@acm/shared').CommissionDTO>('/commissions', { method: 'POST', body: JSON.stringify(body) }),
  bid: (id: string, body: { amountMinor: number; message?: string; etaDays?: number }) =>
    api<import('@acm/shared').CommissionDTO>(`/commissions/${id}/bids`, { method: 'POST', body: JSON.stringify(body) }),
  assign: (id: string, bidId: string) =>
    api<import('@acm/shared').CommissionDTO>(`/commissions/${id}/assign/${bidId}`, { method: 'POST' }),
  deliver: (id: string, deliverableUrl: string) =>
    api<import('@acm/shared').CommissionDTO>(`/commissions/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ deliverableUrl }),
    }),
  approve: (id: string) =>
    api<import('@acm/shared').CommissionDTO>(`/commissions/${id}/approve`, { method: 'POST' }),
  revision: (id: string, notes: string) =>
    api<import('@acm/shared').CommissionDTO>(`/commissions/${id}/revision`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  becomeFreelancer: () =>
    api<{ id: string; email: string; displayName: string; role: string }>(
      '/auth/become-freelancer',
      { method: 'POST' },
    ),
};

export const feedApi = {
  list: (page = 1) => api<{ items: import('@acm/shared').FeedPostDTO[]; hasMore: boolean }>(`/feed?page=${page}`),
  byCharacter: (slug: string) => api<import('@acm/shared').FeedPostDTO[]>(`/feed/character/${slug}`),
  like: (id: string) => api<import('@acm/shared').FeedPostDTO>(`/feed/${id}/like`, { method: 'POST' }),
  comments: (id: string) => api<import('@acm/shared').FeedCommentDTO[]>(`/feed/${id}/comments`),
  comment: (id: string, body: string) =>
    api<import('@acm/shared').FeedCommentDTO>(`/feed/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};

export const reviewsApi = {
  list: (slug: string) =>
    api<{
      reviews: import('@acm/shared').ReviewDTO[];
      aggregate: { rating: number; count: number };
    }>(`/reviews/character/${slug}`),
  create: (body: { characterSlug: string; rating: number; body?: string }) =>
    api<import('@acm/shared').ReviewDTO>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
};
