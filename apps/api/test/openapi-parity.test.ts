import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { openapi } from '../src/openapi.js';

const methods = new Set(['get', 'post', 'patch', 'delete']);
const normalize = (path: string) => path.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/$/, '') || '/';

function implementedOperations() {
  const app = readFileSync(fileURLToPath(new URL('../src/app.ts', import.meta.url)), 'utf8');
  const documents = readFileSync(fileURLToPath(new URL('../src/document-review.ts', import.meta.url)), 'utf8');
  const operations = new Set<string>();
  const routePattern = /^\s*(app|api)\.(get|post|patch|delete)\('([^']+)'/gm;
  for (const match of app.matchAll(routePattern)) {
    const receiver = match[1];
    let path = match[3];
    if (receiver === 'app' && path.startsWith('/api/v1')) path = path.slice('/api/v1'.length);
    operations.add(`${match[2].toUpperCase()} ${normalize(path)}`);
  }
  const documentPattern = /^\s*router\.(get|post|patch|delete)\('([^']+)'/gm;
  for (const match of documents.matchAll(documentPattern)) {
    const suffix = match[2] === '/' ? '' : match[2];
    operations.add(`${match[1].toUpperCase()} ${normalize('/document-candidates' + suffix)}`);
  }
  return [...operations].sort();
}

function documentedOperations() {
  return Object.entries(openapi.paths).flatMap(([path, definition]) =>
    Object.keys(definition).filter(method => methods.has(method)).map(method => `${method.toUpperCase()} ${path}`)
  ).sort();
}

describe('OpenAPI parity', () => {
  it('documents every implemented method and route without stale operations', () => {
    expect(documentedOperations()).toEqual(implementedOperations());
  });

  it('resolves every local schema reference', () => {
    const serialized = JSON.stringify(openapi);
    const references = [...serialized.matchAll(/#\/components\/schemas\/([A-Za-z0-9]+)/g)].map(match => match[1]);
    for (const reference of references) expect(openapi.components.schemas).toHaveProperty(reference);
  });
});
