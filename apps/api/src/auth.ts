import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { PrismaClient, Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { Config } from './config.js';
import { ApiError, assert } from './errors.js';

const derive = promisify(scrypt);
const SESSION_AGE = 8 * 60 * 60 * 1000;
export type Actor = { id: string; name: string; email: string; role: Role };
declare global {
  namespace Express {
    interface Request { actor: Actor; sessionId: string; csrfToken: string }
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, encoded] = hash.split('$');
  if (algorithm !== 'scrypt' || !salt || !encoded) return false;
  const key = await derive(password, salt, 64) as Buffer;
  const stored = Buffer.from(encoded, 'hex');
  return key.length === stored.length && timingSafeEqual(key, stored);
}
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const userView = (user: Actor) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export function auth(db: PrismaClient, config: Config) {
  const attempts = new Map<string, { count: number; expires: number }>();
  const cookie = { httpOnly: true, secure: config.secureCookie, sameSite: 'strict' as const, path: '/' };
  const requireOrigin: RequestHandler = (req, _res, next) => {
    if (req.get('Origin') !== config.origin) return next(new ApiError(403, 'ORIGIN_INVALID', 'Origen de solicitud no autorizado.'));
    next();
  };
  const login: RequestHandler = async (req, res) => {
    const input = z.object({ email: z.email().max(254), password: z.string().min(1).max(256) }).strict().parse(req.body);
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    for (const [key, value] of attempts) if (value.expires < now) attempts.delete(key);
    const attempt = attempts.get(ip) ?? { count: 0, expires: now + 15 * 60 * 1000 };
    assert(attempt.count < 10, 429, 'LOGIN_RATE_LIMIT', 'Demasiados intentos. Espere 15 minutos.');
    attempt.count += 1;
    attempts.set(ip, attempt);
    const user = await db.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    // Constant-cost password work also for an unknown user.
    const valid = await verifyPassword(input.password, user?.passwordHash ?? 'scrypt$00000000000000000000000000000000$' + '00'.repeat(64));
    assert(user?.active && valid, 401, 'LOGIN_FAILED', 'Credenciales inválidas.');
    attempts.delete(ip);
    const rawToken = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(32).toString('base64url');
    await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await db.session.create({ data: { id: digest(rawToken), userId: user.id, csrfToken, expiresAt: new Date(Date.now() + SESSION_AGE) } });
    res.cookie('astra_session', rawToken, { ...cookie, maxAge: SESSION_AGE });
    res.json({ user: userView(user), csrfToken });
  };
  const requireSession: RequestHandler = async (req, _res, next) => {
    const value = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('astra_session='))?.slice(14);
    assert(value && /^[A-Za-z0-9_-]{43}$/.test(value), 401, 'AUTH_REQUIRED', 'Inicie sesión.');
    const session = await db.session.findUnique({ where: { id: digest(value) }, include: { user: true } });
    assert(session && session.expiresAt > new Date() && session.user.active, 401, 'SESSION_EXPIRED', 'Sesión vencida.');
    req.actor = userView(session.user);
    req.sessionId = session.id;
    req.csrfToken = session.csrfToken;
    next();
  };
  const requireCsrf: RequestHandler = (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const supplied = Buffer.from(req.get('X-CSRF-Token') ?? '');
    const expected = Buffer.from(req.csrfToken);
    assert(req.get('Origin') === config.origin && supplied.length === expected.length && timingSafeEqual(supplied, expected), 403, 'CSRF_INVALID', 'Token CSRF u origen inválido.');
    next();
  };
  const logout: RequestHandler = async (req, res) => {
    await db.session.deleteMany({ where: { id: req.sessionId } });
    res.clearCookie('astra_session', cookie).status(204).end();
  };
  return { requireOrigin, login, requireSession, requireCsrf, logout };
}

export const roles = (...allowed: Role[]): RequestHandler => (req, _res, next) => {
  if (!allowed.includes(req.actor.role)) return next(new ApiError(403, 'FORBIDDEN', 'Su rol no permite esta operación.'));
  next();
};
