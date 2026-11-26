/**
 * Extracts latitude/longitude coordinates from Google Maps URLs (full place URLs,
 * viewport URLs, query-param URLs, or direct "lat, lng" strings) and validates
 * Google Maps / shortener hostnames before server-side redirect resolution.
 */

export interface Coords {
  lat: number;
  lng: number;
}

const isValidCoords = (lat: number, lng: number): boolean =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

const roundCoord = (n: number): number => Math.round(n * 1_000_000) / 1_000_000;

const makeCoords = (latRaw: string, lngRaw: string): Coords | null => {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!isValidCoords(lat, lng)) return null;
  return { lat: roundCoord(lat), lng: roundCoord(lng) };
};

/** Allowlist of Google Maps and Google short-link hosts (prevents SSRF). */
export const isAllowedMapsHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  if (host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co") return true;
  if (/^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)) return true;
  return false;
};

export const isShortMapsHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  return host === "maps.app.goo.gl" || host === "goo.gl" || host === "g.co";
};

/**
 * Tries to extract coordinates directly from a Google Maps URL or "lat, lng" string.
 * Prefers exact pin coordinates (!3d...!4d...) over viewport center (@lat,lng).
 */
export function parseGoogleMapsCoords(raw: string): Coords | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 0. Direct "lat, lng" paste
  const direct = trimmed.match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (direct) return makeCoords(direct[1], direct[2]);

  // Decode percent-encoding once so %2C / %40 patterns match uniformly.
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    // Keep original if malformed percent encoding.
  }

  // 1. Exact place pin in Google Maps data payload: !3d<lat>!4d<lng> (use the last match).
  const pinMatches = Array.from(
    decoded.matchAll(/!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/g)
  );
  if (pinMatches.length > 0) {
    const last = pinMatches[pinMatches.length - 1];
    const parsed = makeCoords(last[1], last[2]);
    if (parsed) return parsed;
  }

  // 2. Query parameters: ?q=lat,lng, ?ll=lat,lng, ?query=lat,lng, ?destination=lat,lng, ?center=lat,lng
  try {
    const url = new URL(trimmed);
    for (const key of ["q", "ll", "query", "destination", "center", "sll", "daddr"]) {
      const value = url.searchParams.get(key);
      if (!value) continue;
      const m = value.match(/(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/);
      if (m) {
        const parsed = makeCoords(m[1], m[2]);
        if (parsed) return parsed;
      }
    }
  } catch {
    // Not a full URL; fall through to regex patterns.
  }

  // 3. Viewport center: /@lat,lng,zoom
  const atMatch = decoded.match(/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
  if (atMatch) {
    const parsed = makeCoords(atMatch[1], atMatch[2]);
    if (parsed) return parsed;
  }

  // 4. Path coords: /search/lat,lng or /place/lat,lng
  const pathMatch = decoded.match(
    /\/(?:search|place)\/(-?\d{1,2}(?:\.\d+)?),\+?(-?\d{1,3}(?:\.\d+)?)/
  );
  if (pathMatch) {
    const parsed = makeCoords(pathMatch[1], pathMatch[2]);
    if (parsed) return parsed;
  }

  return null;
}

/** True when the string looks like a Google Maps URL that needs server-side redirect resolution. */
export function needsServerResolve(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return isAllowedMapsHost(url.hostname) && (isShortMapsHost(url.hostname) || parseGoogleMapsCoords(raw) === null);
  } catch {
    return false;
  }
}
