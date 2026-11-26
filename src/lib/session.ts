/**
 * Signed admin session: `v1.<expiresAtSeconds>.<base64url HMAC-SHA256>`.
 * Web Crypto only, so the same code runs in the Edge middleware and in Node
 * route handlers. The cookie never carries the password.
 */

export const SESSION_COOKIE = "admin-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week

const encoder = new TextEncoder();

/**
 * Mark the cookie Secure only when the request really came over HTTPS (directly
 * or behind a proxy). Keying it on NODE_ENV made browsers drop the cookie on
 * plain-HTTP local access by IP or hostname, so the login "succeeded" and
 * bounced straight back to the form.
 */
export const isSecureRequest = (request: { url: string; headers: Headers }): boolean =>
  new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

/** SESSION_SECRET when set; otherwise falls back to ADMIN_PASSWORD so an existing .env keeps working. */
export const getSessionSecret = (): string =>
  process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

const toBase64Url = (bytes: ArrayBuffer): string => {
  let binary = "";
  new Uint8Array(bytes).forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string): Uint8Array<ArrayBuffer> => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const importKey = (secret: string) =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

export async function createSessionToken(secret: string, ttlSeconds = SESSION_TTL_SECONDS): Promise<string> {
  if (!secret) throw new Error("Session secret is not configured");
  const payload = `v1.${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) return false;
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`)
    );
  } catch {
    return false;
  }
}
