const express = require('express');
const path = require("path");
const router = express.Router();
const dbPath = path.resolve(__dirname,'..', 'model', 'db', 'database.sqlite');
const db = require('better-sqlite3')(dbPath);

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user) {
        return res.status(401).json({ error: 'Username already exists.' });
    }

    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);

    res.status(200).json({ success: true });
});

module.exports = router;