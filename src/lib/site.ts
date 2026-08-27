const rawSiteUrl = import.meta.env['VITE_SITE_URL']?.trim();

export const siteUrl = rawSiteUrl ? rawSiteUrl.replace(/\/+$/, "") : undefined;

export function siteAsset(path: string) {
  return siteUrl ? `${siteUrl}${path}` : path;
}

