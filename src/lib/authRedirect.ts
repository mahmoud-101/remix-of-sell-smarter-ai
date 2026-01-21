// Small helper to create auth-related redirect URLs (OAuth + email links).
//
// IMPORTANT:
// In preview/editor environments we MUST prefer the current origin so that confirmation
// links work immediately (some remixes still have a canonical URL that points to a
// different domain, which would break email confirmation).

function isWrapperHost(hostname: string) {
  return hostname.endsWith(".lovableproject.com") || hostname.endsWith(".lovable.dev") || hostname === "lovable.dev";
}

export function getPrimarySiteOrigin(): string {
  return window.location.origin;
}

export function getSafeAuthOrigin(): string {
  // Always prefer current origin; it works in both preview and production.
  return window.location.origin;
}

export function getSafeAuthRedirect(pathname = "/"): string {
  const base = getSafeAuthOrigin();
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${normalized}`;
}
