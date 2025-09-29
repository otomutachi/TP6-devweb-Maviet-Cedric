const express = require('express');
const db = require('./utils/database');

const app = express();
const PORT = 8081;

app.get('/:short', async (req, res) => {
  try {
    const row = await db.get('SELECT origin, visits FROM links WHERE short = ?', [req.params.short]);
    if (!row) {
      return res.status(404).send('Not found');
    }
    await db.run('UPDATE links SET visits = ? WHERE short = ?', [row.visits + 1, req.params.short]);
    res.redirect(row.origin);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () => {
  console.log(`Short URL server running on port ${PORT}`);
});