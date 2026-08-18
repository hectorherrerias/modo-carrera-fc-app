// Vercel Serverless Function: /api/sync
import cloudDbHandler from './cloud-db.js';

export default async function handler(req, res) {
  return cloudDbHandler(req, res);
}
