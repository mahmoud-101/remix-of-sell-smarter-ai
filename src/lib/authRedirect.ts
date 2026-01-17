// Small helper to ensure auth-related redirects (OAuth + email links) always go back
// to the “real” app domain, even when the app is running inside an editor/wrapper domain.
//
// Strategy:
// - Prefer current origin when it's a normal deployment host.
// - If the host looks like an editor/wrapper (e.g. *.lovableproject.com), fall back to
//   the canonical URL origin (if present).
// - Finally fall back to current origin.

function isWrapperHost(hostname: string) {
  return hostname.endsWith(".lovableproject.com") || hostname.endsWith(".lovable.dev") || hostname === "lovable.dev";
}

export function getPrimarySiteOrigin(): string {
  const canonicalHref = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");

  if (canonicalHref) {
    try {
      return new URL(canonicalHref, window.location.href).origin;
    } catch {
      // ignore
    }
  }

  return window.location.origin;
}

export function getSafeAuthOrigin(): string {
  const { hostname, origin } = window.location;
  return isWrapperHost(hostname) ? getPrimarySiteOrigin() : origin;
}

export function getSafeAuthRedirect(pathname = "/"): string {
  const base = getSafeAuthOrigin();
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${normalized}`;
}
