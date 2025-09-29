const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { isValidUrl, generateShortUrl, generateSecret } = require('../utils/url');
const config = require('../utils/config');

const SHORT_URL_BASE = `http://localhost:8081`;

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
  if (!originalUrl || !isValidUrl(originalUrl)) {
    throw new Error('Invalid URL');
  }
  const shortUrl = await generateUniqueShortUrl(config.LINK_LEN);
  const createdAt = new Date().toISOString();
  const secret = generateSecret();
  await db.run(
    'INSERT INTO links (short, origin, created_at, secret) VALUES (?, ?, ?, ?)',
    [shortUrl, originalUrl, createdAt, secret]
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
        const shortLink = await createShortUrl(url);
        res.status(201).json({ short_url: shortLink });
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
        const shortLink = await createShortUrl(url);
        res.render('root', { page: 'created', shortUrl: shortLink, port: config.PORT });
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
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const row = await db.get('SELECT secret FROM links WHERE short = ?', [req.params.url]);
    if (!row) {
      return res.status(404).send('Not found');
    }
    if (row.secret !== apiKey) {
      return res.status(403).send('Forbidden');
    }
    await db.run('DELETE FROM links WHERE short = ?', [req.params.url]);
    res.status(200).send('Link successfully deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

router.get('/:url', (req, res) => {
  res.format({
    'application/json': async () => {
      try {
        const row = await db.get('SELECT created_at, origin, visits FROM links WHERE short = ?', [req.params.url]);
        if (!row) {
          return res.status(404).json({ error: 'Not found' });
        }
        const { secret, ...safeRow } = row; 
        res.json(safeRow);
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
        await db.run('UPDATE links SET visits = ? WHERE short = ?', [row.visits + 1, req.params.url]);
        res.redirect(row.origin);
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