// Vercel Serverless Function: /api/cloud-db
// Supports Cross-Device Cloud Storage for Vercel Deployments

let memoryStore = global._careerMemoryStore || {};
global._careerMemoryStore = memoryStore;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { email, key } = req.query;
  const userKey = (email || key || 'default_user').toLowerCase().replace(/[^a-z0-9]/gi, '_');

  // Support Vercel KV / Upstash Redis if configured in Vercel project environment
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === 'GET') {
    if (kvUrl && kvToken) {
      try {
        const response = await fetch(`${kvUrl}/get/career_user_${userKey}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const data = await response.json();
        if (data.result) {
          const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          return res.status(200).json(parsed);
        }
      } catch (e) {
        console.error("KV fetch notice:", e);
      }
    }

    if (memoryStore[userKey]) {
      return res.status(200).json(memoryStore[userKey]);
    }

    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    memoryStore[userKey] = body;

    if (kvUrl && kvToken) {
      try {
        await fetch(`${kvUrl}/set/career_user_${userKey}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      } catch (e) {
        console.error("KV save notice:", e);
      }
    }

    return res.status(200).json({ success: true, userKey, updatedAt: Date.now() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
