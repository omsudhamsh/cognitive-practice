/**
 * POST /api/visitor
 * Registers a visit and returns the number of unique visitors.
 *
 * Uniqueness is based on the client IP address. The raw IP is never stored:
 * it is salted and SHA-256 hashed before being written to the store, so the
 * dataset holds one-way digests only.
 *
 * Persistence
 * -----------
 * Serverless memory is ephemeral (per-instance, reset on cold start), so a
 * real counter needs an external store. If any of these env vars are set the
 * function uses Upstash Redis / Vercel KV over its REST API:
 *
 *   KV_REST_API_URL + KV_REST_API_TOKEN          (Vercel KV)
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (Upstash)
 *
 * Without them it falls back to a best-effort in-memory set. That fallback is
 * NOT durable: counts reset on cold start and diverge across concurrent
 * instances. Treat it as a placeholder until a store is configured.
 */

const crypto = require('crypto');

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const HAS_REDIS = Boolean(REDIS_URL && REDIS_TOKEN);

// Salting means the stored digests cannot be reversed or correlated across
// different deployments even if the visitor set is ever exposed.
const SALT = process.env.VISITOR_SALT || 'cognitive-game-lab-v1';

// Survives warm invocations on the same instance, so repeated page loads in a
// single warm lambda still deduplicate correctly. Keyed by site to match the
// Redis path, so two sites never share a counter.
const memory =
  globalThis.__visitorMemory ||
  (globalThis.__visitorMemory = new Map());

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) {
    return fwd.split(',')[0].trim();
  }
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-vercel-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(SALT + ip).digest('hex');
}

function siteKey(site) {
  const clean = String(site || 'default').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'default';
  return `visitors:${clean}:ips`;
}

/** Single Redis command over the Upstash/Upstash-compatible REST API. */
async function redis(cmd) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`store ${res.status}`);
  const data = await res.json();
  if (data && data.error) throw new Error(data.error);
  return data ? data.result : null;
}

async function register(key, hash) {
  if (HAS_REDIS) {
    // SADD returns 1 for a new member, 0 for an existing one, which lets us
    // report first-time vs returning visitors without a second round trip.
    const added = await redis(['SADD', key, hash]);
    const count = await redis(['SCARD', key]);
    return { count: Number(count) || 0, isNew: added === 1 };
  }
  let set = memory.get(key);
  if (!set) {
    set = new Set();
    memory.set(key, set);
  }
  const isNew = !set.has(hash);
  set.add(hash);
  return { count: set.size, isNew };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let site = 'default';
  if (req.method === 'POST') {
    // Ignore an unparseable body rather than failing the request outright.
    if (typeof req.body === 'string' && req.body) {
      try {
        site = JSON.parse(req.body).site || site;
      } catch (e) {
        /* fall through with the default site */
      }
    } else if (req.body && typeof req.body === 'object') {
      site = req.body.site || site;
    }
  }

  try {
    const ip = clientIp(req);
    const { count, isNew } = await register(siteKey(site), hashIp(ip));
    return res.status(200).json({
      count,
      isNew,
      storage: HAS_REDIS ? 'redis' : 'memory',
    });
  } catch (err) {
    return res.status(500).json({ error: 'count_failed' });
  }
};