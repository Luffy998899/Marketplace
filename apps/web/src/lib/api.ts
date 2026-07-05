const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('acm_token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('acm_token', token);
  else localStorage.removeItem('acm_token');
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    api<{ accessToken: string; user: { id: string; email: string; displayName: string; role: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  login: (body: { email: string; password: string }) =>
    api<{ accessToken: string; user: { id: string; email: string; displayName: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  google: (body: { email: string; displayName: string; googleId: string }) =>
    api<{ accessToken: string; user: { id: string; email: string; displayName: string; role: string } }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  me: () =>
    api<{ id: string; email: string; displayName: string; role: string }>('/auth/me'),
};

export const walletApi = {
  balance: () =>
    api<{
      userId: string;
      balance: { amountMinor: number; currency: string };
      payoutPending: { amountMinor: number; currency: string };
    }>('/wallet/me/balance'),
  topUp: (amountMinor: number) =>
    api<{ id: string; amount: { amountMinor: number; currency: string }; status: string }>(
      '/wallet/me/topup',
      { method: 'POST', body: JSON.stringify({ amountMinor }) },
    ),
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
};
