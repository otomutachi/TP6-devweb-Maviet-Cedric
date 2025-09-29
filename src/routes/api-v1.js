const express = require("express");
const router = express.Router();
const db = require("../utils/database");
const { isValidUrl, generateShortUrl } = require("../utils/url");
const config = require("../utils/config");

router.get("/", async (req, res) => {
  try {
    const rows = await db.all("SELECT COUNT(*) as count FROM links");
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "lien invalide" });
  }
  try {
    let shortUrl;
    let isUnique = false;
    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
      shortUrl = generateShortUrl(config.LINK_LEN);
      const existing = await db.get("SELECT short FROM links WHERE short = ?", [
        shortUrl,
      ]);
      if (!existing) {
        isUnique = true;
        break;
      }
    }
    if (!isUnique) {
      return res.status(500).json({ error: "genere pas de lien url" });
    }
    const createdAt = new Date().toISOString();
    await db.run(
      "INSERT INTO links (short, origin, created_at) VALUES (?, ?, ?)",
      [shortUrl, url, createdAt],
    );
    res
      .status(201)
      .json({ short_url: `http://localhost:${config.PORT}/${shortUrl}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/error", (req, res) => {
  res.status(500).json({ error: "Internal server error" });
});

router.get("/:url", async (req, res) => {
  try {
    const row = await db.get(
      "SELECT origin, visits FROM links WHERE short = ?",
      [req.params.url],
    );
    if (!row) {
      return res.status(404).json({ error: "pas trouver" });
    }
    await db.run("UPDATE links SET visits = ? WHERE short = ?", [
      row.visits + 1,
      req.params.url,
    ]);
    res.redirect(row.origin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/status/:url", async (req, res) => {
  try {
    const row = await db.get(
      "SELECT created_at, origin, visits FROM links WHERE short = ?",
      [req.params.url],
    );
    if (!row) {
      return res.status(404).json({ error: "pas trouver" });
    }
    res.json({
      created_at: row.created_at,
      origin: row.origin,
      visits: row.visits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
