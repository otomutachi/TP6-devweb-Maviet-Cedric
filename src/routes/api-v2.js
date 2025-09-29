const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { isValidUrl, generateShortUrl, generateSecret } = require('../utils/url');
const config = require('../utils/config');

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
  res.format({
    'application/json': async () => {
      const { url } = req.body;
      if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
      }
      try {
        let shortUrl;
        let isUnique = false;
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
          shortUrl = generateShortUrl(config.LINK_LEN);
          const existing = await db.get('SELECT short FROM links WHERE short = ?', [shortUrl]);
          if (!existing) {
            isUnique = true;
            break;
          }
        }
        if (!isUnique) {
          return res.status(500).json({ error: 'Could not generate unique short URL' });
        }
        const createdAt = new Date().toISOString();
        const secret = generateSecret();
        await db.run('INSERT INTO links (short, origin, created_at, secret) VALUES (?, ?, ?, ?)', [shortUrl, url, createdAt, secret]);
        res.status(201).json({ short_url: `http://localhost:${config.PORT}/api-v2/${shortUrl}` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    'text/html': async () => {
      const { url } = req.body;
      if (!url || !isValidUrl(url)) {
        return res.status(400).send('Invalid URL');
      }
      try {
        let shortUrl;
        let isUnique = false;
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
          shortUrl = generateShortUrl(config.LINK_LEN);
          const existing = await db.get('SELECT short FROM links WHERE short = ?', [shortUrl]);
          if (!existing) {
            isUnique = true;
            break;
          }
        }
        if (!isUnique) {
          return res.status(500).send('Could not generate unique short URL');
        }
        const createdAt = new Date().toISOString();
        const secret = generateSecret();
        await db.run('INSERT INTO links (short, origin, created_at, secret) VALUES (?, ?, ?, ?)', [shortUrl, url, createdAt, secret]);
        res.render('root', { page: 'created', shortUrl: shortUrl, port: config.PORT });
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

router.get('/:url', (req, res) => {
  res.format({
    'application/json': async () => {
      try {
        const row = await db.get('SELECT created_at, origin, visits FROM links WHERE short = ?', [req.params.url]);
        if (!row) {
          return res.status(404).json({ error: 'Not found' });
        }
        // Ne pas révéler le secret
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