export interface Config {
  origin: string;
  secureCookie: boolean;
  environment: string;
  version: string;
  commit: string;
}

export function readConfig(env = process.env): Config {
  const environment = env.APP_ENVIRONMENT ?? 'development';
  const origin = env.APP_ORIGIN ?? (env.NODE_ENV === 'test' ? 'http://localhost:4301' : undefined);
  if (!origin) throw new Error('APP_ORIGIN is required (the exact browser origin).');
  const parsed = new URL(origin);
  if (parsed.origin !== origin || !['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('APP_ORIGIN must be an HTTP(S) origin with no path or trailing slash.');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  const local = loopback && ['development', 'staging', 'test'].includes(environment);
  const secureCookie = env.COOKIE_SECURE === undefined ? !local : env.COOKIE_SECURE === 'true';
  if (!secureCookie && !local) throw new Error('Insecure cookies are restricted to loopback development/staging.');
  if (!local && parsed.protocol !== 'https:') throw new Error('LAN/production requires an HTTPS origin.');
  return { origin, secureCookie, environment, version: env.APP_VERSION ?? '0.1.0', commit: env.GIT_COMMIT ?? 'unknown' };
}
