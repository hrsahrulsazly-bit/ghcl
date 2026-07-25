import { Redis } from "@upstash/redis";

let client = null;

function getRedis() {
  if (!client) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Tiada KV_REST_API_URL/KV_REST_API_TOKEN. Sila sambungkan database Redis (Upstash) di Vercel."
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

const LINKS_KEY = "links";
const ORDER_KEY = "links:order";
const SEQ_KEY = "links:seq";

export async function listLinks() {
  const redis = getRedis();
  const ids = await redis.zrange(ORDER_KEY, 0, -1, { rev: true });
  if (ids.length === 0) return [];
  const entries = await redis.hmget(LINKS_KEY, ...ids.map(String));
  return ids.map((id) => entries[String(id)]).filter(Boolean);
}

export async function addLink(title, url) {
  const redis = getRedis();
  const id = await redis.incr(SEQ_KEY);
  const createdAt = Date.now();
  const link = { id, title, url, created_at: new Date(createdAt).toISOString() };
  await redis.hset(LINKS_KEY, { [id]: link });
  await redis.zadd(ORDER_KEY, { score: createdAt, member: String(id) });
  return link;
}

export async function deleteLink(id) {
  const redis = getRedis();
  await redis.hdel(LINKS_KEY, String(id));
  await redis.zrem(ORDER_KEY, String(id));
}
