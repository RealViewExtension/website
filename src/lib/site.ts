export const SITE_NAME = 'RealView';
export const TAGLINE = 'Engaged views for YouTube Studio';

export const EXTENSION_REPO = 'https://github.com/ericlmao/RealViewExtension';
export const RELEASES_URL = `${EXTENSION_REPO}/releases`;
export const LATEST_ZIP_URL = `${EXTENSION_REPO}/releases/latest/download/RealView-extension.zip`;
export const PRIVACY_URL = `${EXTENSION_REPO}/blob/main/PRIVACY.md`;
export const ISSUES_URL = `${EXTENSION_REPO}/issues`;

// Fill in once the Chrome Web Store listing is approved. Empty string hides
// the install button and shows the "under review" note instead.
export const WEB_STORE_URL = '';

export const MIN_CHROME = 111;

// "production" | "staging" | "local"
export const DEPLOY_ENV = import.meta.env.PUBLIC_DEPLOY_ENV ?? 'local';
export const IS_STAGING = DEPLOY_ENV === 'staging';

// Join a site-relative path onto the configured base so links work both at
// the root and under a sub-path such as /website/staging/.
export function url(path: string = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const rest = path.replace(/^\/+/, '');
  return rest ? `${base}/${rest}` : `${base}/`;
}

export function releaseUrl(version: string): string {
  return `${EXTENSION_REPO}/releases/tag/${version}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// Newest first. Same-day releases fall back to the version number, so
// 1.7.4 sorts above 1.6.4 even when both shipped on one date.
export function sortUpdates<T extends { data: { date: Date; version: string } }>(updates: T[]): T[] {
  return [...updates].sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      b.data.version.localeCompare(a.data.version, undefined, { numeric: true }),
  );
}
