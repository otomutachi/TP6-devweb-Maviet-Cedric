const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { isValidUrl, generateShortUrl, generateSecret } = require('../utils/url');
const config = require('../utils/config');

const SHORT_URL_BASE = process.env.RENDER_EXTERNAL_URL || `http://localhost:8080`;

async function generateUniqueShortUrl(length) {
  let attempts = 0;
  const maxAttempts = 100; 
  while (attempts < maxAttempts) {
    const shortUrl = generateShortUrl(length);
    const existing = await db.get('SELECT short FROM links WHERE short = ?', [shortUrl]);
    if (!existing) {
      return shortUrl;
    }
    attempts++;
  }
  throw new Error('Could not generate unique short URL after multiple attempts');
}

async function createShortUrl(originalUrl) {
  if (!originalUrl) {
    throw new Error('Invalid URL');
  }
  let finalUrl = originalUrl;
  if (originalUrl.startsWith('/')) {
    finalUrl = `${SHORT_URL_BASE}${originalUrl}`;
  } else if (!isValidUrl(originalUrl)) {
    throw new Error('Invalid URL');
  }
  const shortUrl = await generateUniqueShortUrl(config.LINK_LEN);
  const createdAt = new Date().toISOString();
  const secret = generateSecret();
  await db.run(
    'INSERT INTO links (short, origin, created_at, secret) VALUES (?, ?, ?, ?)',
    [shortUrl, finalUrl, createdAt, secret]
  );
  return `${SHORT_URL_BASE}/${shortUrl}`;
}

router.get('/', async (req, res) => {
  res.format({
    'application/json': async () => {
      try {
        const rows = await db.all('SELECT COUNT(*) as count FROM links');
        res.json({ count: rows[0].count });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    'text/html': () => {
      res.render('root', { page: 'home', port: config.PORT });
    },
    default: () => {
      res.status(406).send('Not Acceptable');
    }
  });
});

router.post('/', async (req, res) => {
  const { url } = req.body;
  res.format({
    'application/json': async () => {
      try {
        const shortUrl = await createShortUrl(url);
        const row = await db.get('SELECT short, secret FROM links WHERE origin = ?', [shortUrl.replace(`${SHORT_URL_BASE}/`, '')]);
        res.status(201).json({ short_url: shortUrl, secret: row ? row.secret : undefined });
      } catch (err) {
        console.error(err);
        if (err.message === 'Invalid URL') {
          return res.status(400).json({ error: 'Invalid URL' });
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    'text/html': async () => {
      try {
        const shortUrl = await createShortUrl(url);
        const row = await db.get('SELECT short, secret FROM links WHERE short = ?', [shortUrl.split('/').pop()]);
        res.render('root', { page: 'created', shortUrl: shortUrl, port: config.PORT, secret: row ? row.secret : undefined });
      } catch (err) {
        console.error(err);
        if (err.message === 'Invalid URL') {
          return res.status(400).send('Invalid URL');
        }
        res.status(500).send('Internal server error');
      }
    },
    default: () => {
      res.status(406).send('Not Acceptable');
    }
  });
});

router.get('/:url', async (req, res) => {
  res.format({
    'application/json': async () => {
      try {
        const row = await db.get('SELECT created_at, origin, visits FROM links WHERE short = ?', [req.params.url]);
        if (!row) {
          return res.status(404).json({ error: 'Not found' });
        }
        res.json({
          created_at: row.created_at,
          origin: row.origin,
          visits: row.visits
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    'text/html': async () => {
      try {
        const row = await db.get('SELECT origin, visits FROM links WHERE short = ?', [req.params.url]);
        if (!row) {
          return res.status(404).send('Not found');
        }
        await db.run('UPDATE links SET visits = visits + 1 WHERE short = ?', [req.params.url]);
        res.redirect(302, row.origin);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      }
    },
    default: () => {
      res.status(406).send('Not Acceptable');
    }
  });
});

router.delete('/:url', async (req, res) => {
  const apiKey = req.get('X-API-Key');
  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: X-API-Key header is required' });
  }
  try {
    const row = await db.get('SELECT secret FROM links WHERE short = ?', [req.params.url]);
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (row.secret !== apiKey) {
      return res.status(403).json({ error: 'Forbidden: Invalid X-API-Key' });
    }
    await db.run('DELETE FROM links WHERE short = ?', [req.params.url]);
    res.status(200).json({ message: 'Link deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;