import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ki-no-shiori-session";
const SESSION_DURATION_DAYS = 30;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT session token with a 30-day expiry.
 */
export async function createSessionToken(payload: Record<string, unknown> = {}): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(secret);
  return token;
}

/**
 * Verifies a JWT session token and returns the payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifySessionToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
