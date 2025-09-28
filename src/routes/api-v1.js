const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { isValidUrl, generateShortUrl } = require('../utils/url');

router.get('/', async (req, res) => {
    try {
        const rows = await db.all('SELECT COUNT(*) as count FROM links');
        res.json({ count: rows[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const { url } = req.body;
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    try {
        let shortUrl;
        let isUnique = false;
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
            shortUrl = generateShortUrl(process.env.LINK_LEN);
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
        await db.run('INSERT INTO links (short, origin, created_at) VALUES (?, ?, ?)', [shortUrl, url, createdAt]);
        res.status(201).json({ short_url: `http://localhost:${process.env.PORT}/${shortUrl}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/error', (req, res) => {
    res.status(500).json({ error: 'Internal server error' });
});

router.get('/:url', (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
});

router.get('/status/:url', (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;