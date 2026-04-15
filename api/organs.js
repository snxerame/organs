import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KV_KEY = 'organ_donations';

  try {
    if (req.method === 'GET') {
      // Get all organs
      const organs = await kv.get(KV_KEY) || [];
      return res.status(200).json({ organs });
    }

    if (req.method === 'POST') {
      // Add new organ
      const { name, image, expirationTime, location } = req.body;

      const organs = await kv.get(KV_KEY) || [];

      const newOrgan = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        image,
        expirationTime,
        location,
        createdAt: new Date().toISOString()
      };

      organs.push(newOrgan);
      await kv.set(KV_KEY, organs);

      return res.status(200).json({ organs });
    }

    if (req.method === 'DELETE') {
      // Delete organ
      const { id } = req.body;

      let organs = await kv.get(KV_KEY) || [];
      organs = organs.filter(organ => organ.id !== id);

      await kv.set(KV_KEY, organs);

      return res.status(200).json({ organs });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
