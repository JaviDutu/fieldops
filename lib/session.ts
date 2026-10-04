// Session token signing/verification using only Web Crypto (crypto.subtle, btoa/atob),
// so the exact same code runs in both the Node.js route handlers and the Edge-capable
// middleware without extra dependencies.

export const COOKIE_NAME = "fieldops_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set.");
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function signSession(userId: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ userId, exp })));
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

export async function verifySession(token: string | undefined | null): Promise<{ userId: string } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = await hmacSign(payload);
  if (!timingSafeEqual(expected, signature)) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    const data = JSON.parse(json) as { userId?: string; exp?: number };
    if (!data.userId || typeof data.exp !== "number" || Date.now() > data.exp) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}
