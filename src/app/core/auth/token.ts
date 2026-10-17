import { isRecord } from '../models/records';
import { isRole, type User } from '../models/user.model';

export const TOKEN_STORAGE_KEY = 'harborline.demo.token';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

export function createDemoToken(user: User, now = Date.now()): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: now + TOKEN_TTL_MS,
    }),
  );
  return `${header}.${payload}.demo`;
}

export function readToken(token: string, now = Date.now()): User | null {
  const parts = token.split('.');
  const payloadPart = parts[1];
  if (parts.length !== 3 || parts[2] !== 'demo' || !payloadPart) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(fromBase64Url(payloadPart));
    if (!isRecord(payload)) {
      return null;
    }
    const { sub, name, email, role, exp } = payload;
    if (typeof sub !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      return null;
    }
    if (!isRole(role) || typeof exp !== 'number' || exp <= now) {
      return null;
    }
    return { id: sub, name, email, role };
  } catch {
    return null;
  }
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}
