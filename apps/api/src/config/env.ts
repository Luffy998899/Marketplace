/** Central env helpers — fail closed in production, allow dev stubs locally. */

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** When true, demo users, payment stubs, and Google auth stub are allowed. */
export function allowDevStubs(): boolean {
  if (isProduction()) return false;
  return process.env.ALLOW_DEV_STUBS !== 'false';
}

export function requireEnv(name: string, devFallback?: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (devFallback !== undefined && allowDevStubs()) return devFallback;
  throw new Error(
    `[security] Missing required environment variable: ${name}. Set it before running in production.`,
  );
}

export function getJwtSecret(): string {
  return requireEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_me');
}

/** Separate from JWT so asset URL forgery does not imply session forgery. */
export function getAssetSigningSecret(): string {
  return process.env.ASSET_SIGNING_SECRET?.trim() || getJwtSecret();
}

export function getCorsOrigins(): string[] | false {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
  if (allowDevStubs()) {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  return false;
}

export function validateSecurityConfig(): void {
  if (isProduction()) {
    requireEnv('JWT_ACCESS_SECRET');
    if (!process.env.ASSET_SIGNING_SECRET?.trim()) {
      // eslint-disable-next-line no-console
      console.warn('[security] ASSET_SIGNING_SECRET not set — falling back to JWT secret.');
    }
  }
}
